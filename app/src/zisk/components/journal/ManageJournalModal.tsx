import AvatarIcon from '@/components/icon/AvatarIcon'
import { getRelativeTime } from '@/utils/date'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, Grid2 as Grid, Stack, Tab, Tabs, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useContext, useMemo, useState } from 'react'
import { formatFileSize } from '@/utils/string'
import { PLACEHOLDER_UNNAMED_JOURNAL_NAME } from '@/constants/journal'
import JournalActions from './JournalActions'
import { deleteJournal, exportJournal, resetJournal } from '@/database/actions'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { JournalContext } from '@/contexts/JournalContext'
import { Journal } from '@/schema/documents/Journal'

interface JournalDetailsAndActivityProps {
	journal: Journal | null
	size: number | null
	lastActivity: string | null
	activity: never[]
}

type JournalProperty = {
	label: string
	value: string
}

interface ManageJournalModalProps {
	open: boolean
	details: JournalDetailsAndActivityProps
	onClose: () => void
	onResetJournal: (journal: Journal) => void
	onDeletedJournal: (journal: Journal) => void
}

const JOURNAL_TYPE_LABEL_MAP = {
	'zisk:journal': 'Zisk Journal',
}

function JournalDetailsAndActivity(props: JournalDetailsAndActivityProps) {
	const [tab, setTab] = useState<number>(0)

	const properties: JournalProperty[] = useMemo(() => {
		return [
			{
				label: 'Type',
				value: props.journal?.kind ? JOURNAL_TYPE_LABEL_MAP[props.journal?.kind] : '',
			},
			{
				label: 'Last Activity',
				value: props.lastActivity ? getRelativeTime(props.lastActivity) : '',
			},
			{
				label: 'Version',
				value: '', // TODO fix after ZK-132
				// value: props.journal ? String(props.journal.journalVersion) : '',
			},
			{
				label: 'Size',
				value: props.size === null ? '' : formatFileSize(props.size),
			},
			{
				label: 'Modified',
				value: props.journal?.updatedAt ? dayjs(props.journal.updatedAt).format('MMM D, YYYY') : '',
			},
			{
				label: 'Created',
				value: props.journal?.createdAt ? dayjs(props.journal.createdAt).format('MMM D, YYYY') : '',
			},
		]
	}, [props.activity, props.journal, props.size])

	return (
		<Stack>
			{props.journal && (
				<Stack direction="row" gap={2} alignItems={'center'}>
					<Box sx={{ '& > * ': { fontSize: '36px !important' } }}>
						<AvatarIcon avatar={props.journal.avatar} />
					</Box>
					<Typography variant="h5" sx={{ fontStyle: !props.journal?.journalName ? 'italic' : undefined }}>
						{props.journal.journalName || PLACEHOLDER_UNNAMED_JOURNAL_NAME}
					</Typography>
				</Stack>
			)}
			<Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
				<Tab label="Details" />
				{/* <Tab label="Activity" /> */}
			</Tabs>
			{tab === 0 && (
				<Grid container columns={12} spacing={2}>
					{properties.map((property) => (
						<Grid size={6} sx={{ display: 'flex', flexFlow: 'column nowrap' }} key={property.label}>
							<Typography variant="body1">{property.label}</Typography>
							<Typography variant="body2">{property.value || '--'}</Typography>
						</Grid>
					))}
				</Grid>
			)}
			{tab === 1 && (
				<>
					<Typography>Not available.</Typography>
				</>
			)}
		</Stack>
	)
}

export default function ManageJournalModal(props: ManageJournalModalProps) {
	const [showResetMenu, setShowResetMenu] = useState(false)
	const [showDeleteMenu, setShowDeleteMenu] = useState(false)

	const { snackbar } = useContext(NotificationsContext)
	const journalContext = useContext(JournalContext)

	const handleResetJournal = async () => {
		if (!props.details.journal) {
			return
		}
		await resetJournal(props.details.journal._id)
		setShowResetMenu(false)
		snackbar({ message: 'Journal reset.' })
		props.onResetJournal(props.details.journal)
	}

	const handleDeleteJournal = async () => {
		if (!props.details.journal) {
			return
		}
		await deleteJournal(props.details.journal._id)
		await journalContext.getJournalsQuery.refetch()
		setShowDeleteMenu(false)
		snackbar({ message: 'Journal deleted.' })
		props.onDeletedJournal(props.details.journal)
		props.onClose()
	}

	const handleExportJournal = async () => {
		if (!props.details.journal) {
			return
		}
        await exportJournal(props.details.journal._id, false);
    }

	return (
		<>
			<Dialog open={showDeleteMenu} onClose={() => setShowDeleteMenu(false)}>
				<DialogContent>
					<DialogContentText>Are you sure you want to delete this journal?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowDeleteMenu(false)}>Cancel</Button>
					<Button color='error' onClick={() => handleDeleteJournal()}>Delete</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={showResetMenu} onClose={() => setShowResetMenu(false)}>
				<DialogContent>
					<DialogContentText>Are you sure you want to reset this journal?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowResetMenu(false)}>Cancel</Button>
					<Button color='error' onClick={() => handleResetJournal()}>Reset</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={props.open} onClose={props.onClose}>
				<DialogContent>
					<JournalDetailsAndActivity
						{...props.details}
					/>
				</DialogContent>
				<DialogActions>
					<JournalActions
						onPromptDeleteJournal={() => setShowDeleteMenu(true)}
						onPromptResetJournal={() => setShowResetMenu(true)}
						onExportJournal={() => handleExportJournal()}
					/>
					<Button onClick={() => props.onClose()}>Close</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}
