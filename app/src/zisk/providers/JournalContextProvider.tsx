import SelectJournalModal from '@/components/journal/SelectJournalModal'
import JournalEntryModal from '@/components/modal/JournalEntryModal'
import { JournalContext } from '@/contexts/JournalContext'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { ZiskContext } from '@/contexts/ZiskContext'
import { getDatabaseClient } from '@/database/client'
// import { MigrationEngine } from '@/database/migrate'
import { getAccounts, getCategories, getEntryTags, getJournals } from '@/database/queries'

import { useQuery } from '@tanstack/react-query'
import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { Journal } from '@/schema/documents/Journal'
import { Category } from '@/schema/documents/Category'
import { EntryTag } from '@/schema/documents/EntryTag'
import { Account } from '@/schema/documents/Account'
import { useSetCategories } from '@/store/orm/categories'
import { useSetEntryTags } from '@/store/orm/tags'
import { useSetAccounts } from '@/store/orm/accounts'
import { useSetJournals } from '@/store/orm/journals'
import { updateActiveJournal } from '@/database/actions'
import { useJournalSelectorStatus, useSetJournalSelectorStatus } from '@/store/app/useJournalSelectorState'

const db = getDatabaseClient()

db.createIndex({
	index: {
		fields: [
			'type', // Deprecated
			'kind',
			'date',
			'children',
			'journalId',
			'recurs',
		],
	},
})

export default function JournalContextProvider(props: PropsWithChildren) {
	// Stores
	const setJournals = useSetJournals()
	const setCategories = useSetCategories()
	const setEntryTags = useSetEntryTags()
	const setAccounts = useSetAccounts()

	// The currently active journal
	const [activeJournalId, setActiveJournalId] = useState<string | null>(null)

	const [journalSelectorState, setJournalSelectorStatus] = [useJournalSelectorStatus(), useSetJournalSelectorStatus()]
	
	const [hasLoadedInitialActiveJournal, setHasLoadedInitialActiveJournal] = useState<boolean>(false)

	// const { snackbar } = useContext(NotificationsContext)
	// const ziskContext = useContext(ZiskContext)

	const ziskContext = useContext(ZiskContext)

	const hasSelectedJournal = Boolean(activeJournalId)
		|| Boolean(ziskContext.queries.ziskMeta.isFetched && ziskContext.queries.ziskMeta.data?.activeJournalId)

	const getJournalsQuery = useQuery<Record<string, Journal>>({
		queryKey: ['journals'],
		queryFn: async () => {
			const response: Record<string, Journal> = await getJournals()
			setJournals(response)
			return response
		},
		initialData: {},
	})

	const getCategoriesQuery = useQuery<Record<string, Category>>({
		queryKey: ['categories'],
		queryFn: async () => {
			let response: Record<string, Category>
			response = activeJournalId
				? await getCategories(activeJournalId)
				: {}
			
			setCategories(response)
			return response
		},
		initialData: {},
		enabled: hasSelectedJournal,
	})

	const getEntryTagsQuery = useQuery<Record<string, EntryTag>>({
		queryKey: ['tags'],
		queryFn: async () => {
			let response: Record<string, EntryTag>
			response = activeJournalId
				? await getEntryTags(activeJournalId)
				: {}

			setEntryTags(response)
			return response
		},
		initialData: {},
		enabled: hasSelectedJournal,
	})

	const getAccountsQuery = useQuery<Record<string, Account>>({
		queryKey: ['accounts'],
		queryFn: async () => {
			let response: Record<string, Account>
			response = activeJournalId
				? await getAccounts(activeJournalId)
				: {}
			
			setAccounts(response)
			return response
		},
		initialData: {},
		enabled: hasSelectedJournal,
	})

	// const openCreateEntryModal = (values: Partial<JournalEntry> = {}) => {
	// 	if (!activeJournalId) {
	// 		return
	// 	}
	// 	const entry: JournalEntry = makeJournalEntry(values as CreateJournalEntry, activeJournalId)

	// 	createJournalEntry(entry)

	// 	journalEntryForm.reset(entry)
	// 	setShowJournalEntryModal(true)
	// }

	// const openEditEntryModal = (entry: JournalEntry) => {
	// 	journalEntryForm.reset(entry)
	// 	setShowJournalEntryModal(true)
	// }

	// const promptCreateJournal = () => {
	// 	setShowSelectJournalModal(true)
	// }

	
	// useKeyboardAction(KeyboardActionName.CREATE_JOURNAL_ENTRY, () => {
	// 	if (showJournalEntryModal) {
	// 		return
	// 	}
	// 	openCreateEntryModal();
	// })

	const handleSelectNewActiveJournal = (journalId: string | null) => {
		setActiveJournalId(journalId)
		updateActiveJournal(journalId)
	}

	useEffect(() => {
		if (hasLoadedInitialActiveJournal) {
			return
		} if (!ziskContext.queries.ziskMeta.isFetched) {
			return
		}
		console.log('ziskContext.queries.ziskMeta:', ziskContext.queries.ziskMeta)
		if (!ziskContext.queries.ziskMeta.data?.activeJournalId) {
			// No active journal is set or active journaland ziskMeta active journal do not agree; prompt user to select one
			console.log('No active journal is set or active journaland ziskMeta active journal do not agree; prompt user to select one')
			setJournalSelectorStatus('SELECTING')
		} else {
			setActiveJournalId(ziskContext.queries.ziskMeta.data?.activeJournalId)
		}
		setHasLoadedInitialActiveJournal(true)
	}, [getJournalsQuery.isFetched, ziskContext.queries.ziskMeta.isFetched, hasLoadedInitialActiveJournal])

	// useEffect(() => {
	// 	 else if (!getJournalsQuery.isFetched) {
	// 		return
	// 	} else if (journalContext.activeJournalId) {
	// 		setHasLoadedInitialActiveJournal(true)
	// 		return
	// 	} else 
	// 	setJournalSelectorStatus('SELECTING')
	// }, [hasLoadedInitialActiveJournal, ziskMeta, journalContext.activeJournalId])


	return (
		<JournalContext.Provider
			value={{
				queries: {
					accounts: getAccountsQuery,
					categories: getCategoriesQuery,
					journals: getJournalsQuery,
					tags: getEntryTagsQuery,
				},
				activeJournalId,
				setActiveJournalId: handleSelectNewActiveJournal,
			}}>
			<SelectJournalModal />
			<JournalEntryModal  />
			{props.children}
		</JournalContext.Provider>
	)
}
