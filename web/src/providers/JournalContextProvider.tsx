import CreateJournalModal from '@/components/journal/CreateJournalModal'
import SelectJournalModal from '@/components/journal/SelectJournalModal'
import { PLACEHOLDER_UNNAMED_JOURNAL_NAME } from '@/constants/journal'
import { JournalContext } from '@/contexts/JournalContext'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { updateActiveJournal } from '@/database/actions'
import { getDatabaseClient } from '@/database/client'
import { getCategories, getEntryTags, getJournals, getOrCreateZiskMeta } from '@/database/queries'
import { Category, EntryTag, JournalMeta, ZiskMeta } from '@/types/schema'
import { useQuery } from '@tanstack/react-query'
import { PropsWithChildren, useContext, useEffect, useState } from 'react'

const db = getDatabaseClient()

db.createIndex({
	index: {
		fields: [
			'type',
			'date',
			'parentEntryId',
			'journalId',
		],
	},
})

export default function JournalContextProvider(props: PropsWithChildren) {
	const [showCreateJournalEntryModal, setShowCreateJournalEntryModal] = useState<boolean>(false)
	const [showSelectJournalModal, setShowSelectJournalModal] = useState<boolean>(false)
	const [showCreateJournalModal, setShowCreateJournalModal] = useState(false)
	const [createEntryInitialDate, setCreateEntryInitialDate] = useState<string | undefined | null>(null)

	// The currently active journal
	const [activeJournal, setActiveJournal] = useState<JournalMeta | null>(null)
	// The journal selected in the SelectJournalModal
	const [selectedJournal, setSelectedJournal] = useState<JournalMeta | null>(null)

	const { snackbar } = useContext(NotificationsContext)

	const hasSelectedJournal = Boolean(activeJournal)

	const getZiskMetaQuery = useQuery<ZiskMeta | null>({
		queryKey: ['ziskMeta'],
		queryFn: getOrCreateZiskMeta,
		initialData: null,
		enabled: true,
	})

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

	const openCreateEntryModal = (date?: string) => {
		setCreateEntryInitialDate(date)
		setShowCreateJournalEntryModal(true)
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

	const handleSelectJournal = (journal: JournalMeta) => {
		setActiveJournal((prev) => {
			if (prev) {
				snackbar({ message: `Switched to ${journal.journalName || PLACEHOLDER_UNNAMED_JOURNAL_NAME}` })
			}
			return journal
		})
	}

	const refetchAllDependantQueries = () => {
		getCategoriesQuery.refetch()
		getEntryTagsQuery.refetch()
	}

	useEffect(() => {
		if (!activeJournal) {
			return
		}
		updateActiveJournal(activeJournal._id)
		setShowSelectJournalModal(false)
		refetchAllDependantQueries()
	}, [activeJournal])

	useEffect(() => {
		if (!getZiskMetaQuery.data || !getJournalsQuery.data) {
			return
		} else if (!getZiskMetaQuery.isFetched || !getJournalsQuery.isFetched) {
			return
		}
		const numJournals = Object.keys(getJournalsQuery.data).length
		if (numJournals === 0) {
			promptCreateJournal()
		} else {
			const activeJournalId = getZiskMetaQuery.data.activeJournalId
			const journal = activeJournalId ? getJournalsQuery.data[activeJournalId] : null
			if (!journal) {
				promptSelectJournal()
			} else {
				setActiveJournal(journal)
			}
		}
	}, [getZiskMetaQuery.data, getZiskMetaQuery.isFetched, getJournalsQuery.data, getJournalsQuery.isFetched])

	return (
		<JournalContext.Provider
			value={{
				getCategoriesQuery,
				getEntryTagsQuery,
				createEntryInitialDate,
				openCreateEntryModal,
				showCreateJournalEntryModal,
				closeCreateEntryModal: () => setShowCreateJournalEntryModal(false),
				journal: activeJournal,
				getJournalsQuery,
				openJournalManager: () => promptSelectJournal(),
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
			{props.children}
		</JournalContext.Provider>
	)
}
