import { SelectAllAction } from '@/components/journal/ribbon/JournalEntrySelectionActions'
import { JournalFilterSlot } from '@/components/journal/ribbon/JournalFilterPicker'
import { JournalContext } from '@/contexts/JournalContext'
import { JournalEditorState, JournalSliceContext } from '@/contexts/JournalSliceContext'
import { getJournalEntries } from '@/database/queries'
import { AmountRange, Analytics, JournalEntry, JournalSlice } from '@/types/schema'
import { generateAnalytics } from '@/utils/analytics'
import { enumerateFilters } from '@/utils/filtering'
import { calculateNetAmount } from '@/utils/journal'
import { useQuery } from '@tanstack/react-query'
import { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type JournalSliceContextProviderProps = PropsWithChildren<JournalEditorState>

export default function JournalSliceContextProvider(props: JournalSliceContextProviderProps) {
	const { dateView, onChangeDateView, switchDateView } = props
	const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})

	const [categoryIds, setCategoryIds] = useState<string[] | undefined>(undefined)
	const [amountRange, setAmountRange] = useState<AmountRange | undefined>(undefined)

	const journalContext = useContext(JournalContext)

	const hasSelectedJournal = Boolean(journalContext.journal)

	const journalSlice: JournalSlice = useMemo(() => {
		return {
			dateView,
			categoryIds,
			amount: amountRange,
		}
	}, [
		dateView,
		categoryIds,
		amountRange,
	])

	const getActiveFilterSet = useCallback(() => {
		const journalSlice = {
			dateView,
			categoryIds,
			amount: amountRange,
		}
		return enumerateFilters(journalSlice)
	}, [
		dateView,
		categoryIds,
		amountRange,
	])

	const clearAllSliceFilters = () => {
		setCategoryIds(undefined)
		setAmountRange(undefined)
	}
	
	const removeFilterBySlot = (slot: JournalFilterSlot) => {
		switch (slot) {
			case JournalFilterSlot.AMOUNT:
				setAmountRange(undefined)
				return
			
			case JournalFilterSlot.ATTACHMENTS:
				throw new Error('Not implemented')
				return

			case JournalFilterSlot.CATEGORIES:
				setCategoryIds(undefined)
				return

			case JournalFilterSlot.DATE_RANGE:
				throw new Error('Not implemented')
				return

			case JournalFilterSlot.TAGS:
				throw new Error('Not implemented')
				return
		}
	}

	const getJournalEntriesQuery = useQuery<Record<JournalEntry['_id'], JournalEntry>>({
		queryKey: ['journalEntries', journalSlice],
		queryFn: async () => {
			if (!journalContext.journal) {
				return {}
			}
			return getJournalEntries(journalSlice, journalContext.journal._id)
		},
		initialData: {},
		enabled: hasSelectedJournal,
	})

	const analyticsQuery = useQuery<Analytics>({
		queryKey: ["analytics", getJournalEntriesQuery.data],
		queryFn: () => generateAnalytics(Object.values(getJournalEntriesQuery.data ?? {}), dateView),
		initialData: {
			basic: {
				chart: { data: [], labels: [] },
				sumGain: 0,
				sumLoss: 0,
			},
			categories: {
				spendByCategoryId: {},
			},
		},
		enabled: Boolean(getJournalEntriesQuery.data),
	});

	// const getTentativeJournalEntryRecurrencesQuery = useQuery<Record<string, TentativeJournalEntry>>({
	// 	queryKey: ["journal-entry-recurrences", journalSlice],
	// 	queryFn: async () => {
	// 		if (!journalContext.journal) {
	// 			return {}
	// 		}
	// 		const recurringJournalEntries = await getRecurringJournalOrTransferEntries(journalContext.journal._id, 'JOURNAL_ENTRY')
	// 		const recurringEntryDates = getRecurrencesForDateView(recurringJournalEntries, journalSlice.dateView)
	// 		return Object.fromEntries(
	// 			Object.entries(recurringEntryDates).reduce((acc: [string, TentativeJournalEntry][], [recurringEntryId, dates]) => {
	// 				Array.from(dates).forEach((date: string) => {
	// 					const entry: TentativeJournalEntry = makeTentativeJournalEntry(
	// 						{},
	// 						journalContext.journal!._id ?? '',
	// 						date,
	// 						recurringEntryId
	// 					);

	// 					acc.push([entry._id, entry])
	// 				})

	// 				return acc
	// 			}, [])
	// 		)
	// 	},
	// 	initialData: {},
	// 	enabled: true,
	// });

	const refetchAllDependantQueries = () => {
		getJournalEntriesQuery.refetch()
		// getTentativeJournalEntryRecurrencesQuery.refetch()
	}

	const toggleSelectedRow = (row: string) => {
		setSelectedRows((prev) => {
			return {
				...prev,
				[row]: prev[row] ? false : true
			}
		})
	}

	const handleSelectAll = (action: SelectAllAction) => {
		console.log(`handleSelectAll(${action})`)
		setSelectedRows((prev) => {
			let selected: Set<string>
			const allRowIds = new Set<string>(Object.keys(getJournalEntriesQuery.data ?? {}))
			const emptySet = new Set<string>([])
			const hasSelectedAll = Object.values(prev).length > 0 && Object.values(prev).every(Boolean)

			switch (action) {
				case SelectAllAction.ALL:
					selected = allRowIds
					break

				case SelectAllAction.NONE:
					selected = emptySet
					break

				case SelectAllAction.CREDIT:
					selected = new Set<string>(Array.from(allRowIds).filter((id: string) => {
						const entry = getJournalEntriesQuery.data[id]
						return entry ? calculateNetAmount(entry) > 0 : false
					}))
					break

				case SelectAllAction.DEBIT:
					selected = new Set<string>(Array.from(allRowIds).filter((id: string) => {
						const entry = getJournalEntriesQuery.data[id]
						return entry ? calculateNetAmount(entry) < 0 : false
					}))
					break

				case SelectAllAction.TOGGLE:
				default:
					selected = hasSelectedAll ? emptySet : allRowIds
			}

			return Object.fromEntries(Array.from(new Set([...Object.keys(prev), ...selected]))
				.map((key) => {
					return [key, selected.has(key)]
				}))
		})
	}

	useEffect(() => {
		if (!journalContext.journal) {
			return
		}

		refetchAllDependantQueries()
	}, [
		journalContext.journal,
		journalContext.getCategoriesQuery.data,
		journalContext.getEntryTagsQuery.data,
	])

	useEffect(() => {
		setSelectedRows({})
	}, [getJournalEntriesQuery.data])

	return (
		<JournalSliceContext.Provider
			value={{
				...journalSlice,
				onChangeDateView,
				switchDateView,
				onChangeCategoryIds: setCategoryIds,
				onChangeAmountRange: setAmountRange,

				getJournalEntriesQuery,
				// getTentativeJournalEntryRecurrencesQuery,
				refetchAllDependantQueries,

				getActiveFilterSet,
				clearAllSliceFilters,
				removeFilterBySlot,

				numRows: Object.values(getJournalEntriesQuery.data ?? {}).length,
				selectedRows,
				onSelectAll: handleSelectAll,
				toggleSelectedRow,

				// Analytics
				analyticsQuery,
			}}>
			{props.children}
		</JournalSliceContext.Provider>
	)
}
