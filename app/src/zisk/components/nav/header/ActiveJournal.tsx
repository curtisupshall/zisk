import { PLACEHOLDER_UNNAMED_JOURNAL_NAME } from '@/constants/journal'
import { JournalContext } from '@/contexts/JournalContext'
import { Journal } from '@/schema/documents/Journal'
import { useJournalSelectorStatus, useSetJournalSelectorStatus } from '@/store/app/useJournalSelectorState'
import { useJournals } from '@/store/orm/journals'
import { UnfoldMore } from '@mui/icons-material'
import { Button, Typography, Tooltip } from '@mui/material'
import { useContext } from 'react'

export default function ActiveJournal() {
	const journalContext = useContext(JournalContext)
	const { activeJournalId } = journalContext

	const setJournalSelectorStatus = useSetJournalSelectorStatus()
	const journalSelectorStatus = useJournalSelectorStatus()

	const journals = useJournals()
	const activeJournal: Journal | null = activeJournalId
		? journals[activeJournalId] ?? null
		: null

	let journalName = activeJournal?.journalName
	if (journalName === '') {
		journalName = PLACEHOLDER_UNNAMED_JOURNAL_NAME
	}

	return (
		<Tooltip title="Manage Journals">
			{(journalSelectorStatus === 'CLOSED' && !activeJournal) ? (
				<Button variant='contained'  onClick={() => setJournalSelectorStatus('SELECTING')}>
					Select Journal
				</Button>
			) : (
				<Button endIcon={<UnfoldMore />} onClick={() => setJournalSelectorStatus('SELECTING')}>
					<Typography variant="h6">{journalName}</Typography>
				</Button>
			)}
		</Tooltip>
	)
}
