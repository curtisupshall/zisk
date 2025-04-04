import CreateJournalModal from '@/components/journal/CreateJournalModal'
import SelectJournalModal from '@/components/journal/SelectJournalModal'
import JournalEntryModal from '@/components/modal/JournalEntryModal'
import { PLACEHOLDER_UNNAMED_JOURNAL_NAME } from '@/constants/journal'
import { JournalContext } from '@/contexts/JournalContext'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { ZiskContext } from '@/contexts/ZiskContext'
import { updateActiveJournal, createJournalEntry, getAllJournalObjects, createTransferEntry } from '@/database/actions'
import { getDatabaseClient } from '@/database/client'
import { MigrationEngine } from '@/database/migrate'
import { getAccounts, getCategories, getEntryTags, getJournals } from '@/database/queries'
import { Account, Category, EntryTag, JournalEntry, JournalMeta, TransferEntry } from '@/types/schema'
import useKeyboardAction from '@/hooks/useKeyboardAction'
import { KeyboardActionName } from '@/constants/keyboard'
import { makeJournalEntry, makeTransferEntry } from '@/utils/journal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const db = getDatabaseClient()

db.createIndex({
	index: {
		fields: [
			'type',
			'date',
			'children',
			'journalId',
			'recurs',
		],
	},
})

export default function JournalContextProvider(props: PropsWithChildren) {
	const [showJournalEntryModal, setShowJournalEntryModal] = useState<boolean>(false)
	const [showSelectJournalModal, setShowSelectJournalModal] = useState<boolean>(false)
	const [showCreateJournalModal, setShowCreateJournalModal] = useState(false)

	// The currently active journal
	const [activeJournal, setActiveJournal] = useState<JournalMeta | null>(null)
	// The journal selected in the SelectJournalModal
	const [selectedJournal, setSelectedJournal] = useState<JournalMeta | null>(null)

	const { snackbar } = useContext(NotificationsContext)
	const ziskContext = useContext(ZiskContext)

	const hasSelectedJournal = Boolean(activeJournal)

	const getJournalsQuery = useQuery<Record<JournalMeta['_id'], JournalMeta>>({
		queryKey: ['journals'],
		queryFn: getJournals,
		initialData: {},
	})

	const getCategoriesQuery = useQuery<Record<Category['_id'], Category>>({
		queryKey: ['categories'],
		queryFn: async () => {
			if (!activeJournal) {
				return {}
			}
			return getCategories(activeJournal._id)
		},
		initialData: {},
		enabled: hasSelectedJournal,
	})

	const getEntryTagsQuery = useQuery<Record<EntryTag['_id'], EntryTag>>({
		queryKey: ['entryTags'],
		queryFn: async () => {
			if (!activeJournal) {
				return {}
			}
			return getEntryTags(activeJournal._id)
		},
		initialData: {},
		enabled: hasSelectedJournal,
	})

	const getAccountsQuery = useQuery<Record<Account['_id'], Account>>({
		queryKey: ['accounts'],
		queryFn: async () => {
			if (!activeJournal) {
				return {}
			}
			return getAccounts(activeJournal._id)
		},
		initialData: {},
		enabled: hasSelectedJournal,
	})

	const openCreateEntryModal = (values: Partial<JournalEntry | TransferEntry> = {}) => {
		if (!activeJournal) {
			return
		}
		let entry: JournalEntry | TransferEntry
		if (values.type === 'TRANSFER_ENTRY') {
			entry = makeTransferEntry(values as Partial<TransferEntry>, activeJournal._id)
			createTransferEntry(entry)
		} else {
			entry = makeJournalEntry(values as Partial<JournalEntry>, activeJournal._id)
			createJournalEntry(entry)
		}
		journalEntryForm.reset(entry)
		setShowJournalEntryModal(true)
	}

	const openEditEntryModal = (entry: JournalEntry | TransferEntry) => {
		journalEntryForm.reset(entry)
		setShowJournalEntryModal(true)
	}

	const promptCreateJournal = () => {
		setShowSelectJournalModal(true)
	}

	const promptSelectJournal = () => {
		if (activeJournal) {
			setSelectedJournal(activeJournal)
		}
		setShowSelectJournalModal(true)
	}

	const migrateJournal = async (journal: JournalMeta): Promise<JournalMeta> => {
		if (!MigrationEngine.shouldMigrate(journal)) {
			console.log(`Journal ${journal.journalName}@${journal.journalVersion} is on the latest version.`)
			return journal
		} else {
			console.log('Migrating...')
		}
		const journalObjects = await getAllJournalObjects(journal._id)
		const [updatedJournal, ...rest] = await MigrationEngine.migrate([journal, ...journalObjects])
		await db.bulkDocs([updatedJournal, ...rest])
		return updatedJournal
	}

	const loadActiveJournal = async (journal: JournalMeta): Promise<JournalMeta> => {
		const updatedJournal = await migrateJournal(journal)
		
		setActiveJournal(updatedJournal)
		return updatedJournal
	}

	const handleSelectJournal = async (journal: JournalMeta): Promise<void> => {		
		loadActiveJournal(journal).then((updatedJournal) => {
			if (updatedJournal) {
				snackbar({ message: `Switched to ${updatedJournal.journalName || PLACEHOLDER_UNNAMED_JOURNAL_NAME}` })
			}
		})
	}
	
	const closeActiveJournal = () => {
		setActiveJournal(null)
		promptSelectJournal()
	}

	const refetchAllDependantQueries = () => {
		getCategoriesQuery.refetch()
		getEntryTagsQuery.refetch()
	}

	useKeyboardAction(KeyboardActionName.CREATE_JOURNAL_ENTRY, () => {
		if (showJournalEntryModal) {
			return
		}
		openCreateEntryModal();
	})

	useEffect(() => {
		if (!activeJournal) {
			return
		}
		updateActiveJournal(activeJournal._id)
		setShowSelectJournalModal(false)
		refetchAllDependantQueries()
	}, [activeJournal])

	useEffect(() => {
		if (!ziskContext.data || !getJournalsQuery.data) {
			return
		} else if (!getJournalsQuery.isFetched) {
			return
		}
		const numJournals = Object.keys(getJournalsQuery.data).length
		if (numJournals === 0) {
			promptCreateJournal()
		} else {
			const activeJournalId = ziskContext.data.activeJournalId
			const journal = activeJournalId ? getJournalsQuery.data[activeJournalId] : null
			if (!journal) {
				promptSelectJournal()
			} else {
				loadActiveJournal(journal)
			}
		}
	}, [ziskContext.data, getJournalsQuery.data, getJournalsQuery.isFetched])

	const journalEntryForm = useForm<JournalEntry | TransferEntry>({
		defaultValues: {},
		resolver: zodResolver(z.union([JournalEntry, TransferEntry])),
	})

	return (
		<JournalContext.Provider
			value={{
				getCategoriesQuery,
				getEntryTagsQuery,
				getAccountsQuery,
				showJournalEntryModal,
				getJournalsQuery,
				journal: activeJournal,
				journalEntryForm,
				createJournalEntry: openCreateEntryModal,
				editJournalEntry: openEditEntryModal,
				closeEntryModal: () => setShowJournalEntryModal(false),
				openJournalManager: () => promptSelectJournal(),
				closeActiveJournal,
			}}>
			<SelectJournalModal
				open={showSelectJournalModal}
				onClose={() => setShowSelectJournalModal(false)}
				initialSelection={selectedJournal}
				onSelect={handleSelectJournal}
				onPromptCreate={() => setShowCreateJournalModal(true)}
			/>
			<CreateJournalModal
				open={showCreateJournalModal}
				onClose={() => setShowCreateJournalModal(false)}
				onCreated={(newJournal) => {
					setSelectedJournal(newJournal)
					setShowCreateJournalModal(false)
					setShowSelectJournalModal(true)
				}}
			/>
			<JournalEntryModal open={showJournalEntryModal} onClose={() => setShowJournalEntryModal(false)} />
			{props.children}
		</JournalContext.Provider>
	)
}
