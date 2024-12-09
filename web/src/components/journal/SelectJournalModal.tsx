import { JournalContext } from '@/contexts/JournalContext'
import { JournalMeta } from '@/types/schema'
import { Add, East, InfoOutlined } from '@mui/icons-material'
import {
	Avatar,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Typography,
} from '@mui/material'
import { useContext, useEffect, useMemo, useState } from 'react'
import AvatarIcon from '../icon/AvatarIcon'
import { PLACEHOLDER_UNNAMED_JOURNAL_NAME } from '@/constants/journal'
import ManageJournalModal from './ManageJournalModal'


interface SelectJournalModal {
	open: boolean
	initialSelection: JournalMeta | null
	onClose: () => void
	onSelect: (journal: JournalMeta) => void
	onPromptCreate: () => void
}

export default function SelectJournalModal(props: SelectJournalModal) {
	const journalContext = useContext(JournalContext)
	const [showManageJournalModal, setShowManageJournalModal] = useState(false)
	const [selectedJournal, setSelectedJournal] = useState<JournalMeta | null>(props.initialSelection)

	useEffect(() => {
		setSelectedJournal(journalContext.journal)
	}, [journalContext.journal])

	useEffect(() => {
		setSelectedJournal(props.initialSelection)
	}, [props.initialSelection])

	const journals: JournalMeta[] = useMemo(() => {
		return Object.values(journalContext.getJournalsQuery.data)
	}, [journalContext.getJournalsQuery.data])

	const handleContinue = () => {
		if (!selectedJournal) {
			return
		}
		props.onSelect(selectedJournal)
	}

	const handleManageJournal = (journal: JournalMeta) => {
		setSelectedJournal(journal)
		setShowManageJournalModal(true)
	}

	const hasSelectedJournal = Boolean(journalContext.journal)

	return (
		<>
			<Dialog open={props.open}>
				<DialogTitle>Your Journals</DialogTitle>
				{!hasSelectedJournal && (
					<DialogContent>
						<DialogContentText>Please select a journal.</DialogContentText>
					</DialogContent>
				)}
				<List>
					{journals.map((journal) => {
						const selected = selectedJournal?._id === journal._id
						return (
							<ListItem
								key={journal._id}
								secondaryAction={
									<IconButton edge="end" onClick={() => handleManageJournal(journal)}>
										<InfoOutlined />
									</IconButton>
								}
								disablePadding
							>
								<ListItemButton
									role={undefined}
									onClick={() => setSelectedJournal(journal)}
									selected={selected}
								>
									<ListItemAvatar>
										<Avatar>
											<AvatarIcon avatar={journal.avatar} />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary={
											<Typography sx={{ fontStyle: !journal.journalName ? 'italic' : undefined }}>
												{journal.journalName || PLACEHOLDER_UNNAMED_JOURNAL_NAME}
											</Typography>
										}
									/>
								</ListItemButton>
							</ListItem>
						)
					})}
					{journals.length > 0 && (
						<Divider component="li" />
					)}
					<ListItem disablePadding>
						<ListItemButton
							onClick={() => props.onPromptCreate()}
						>
							<ListItemAvatar>
								<Avatar>
									<Add />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary="Add journal" />
						</ListItemButton>
					</ListItem>
				</List>
				<DialogActions>
					{journalContext.journal && <Button onClick={() => props.onClose()}>Cancel</Button>}
					<Button
						variant="contained"
						disabled={!selectedJournal || journalContext.journal?._id === selectedJournal._id}
						onClick={() => handleContinue()}
						startIcon={<East />}
					>
						{hasSelectedJournal ? 'Switch Journal' : 'Select Journal'}
					</Button>
				</DialogActions>
			</Dialog>
			<ManageJournalModal
				open={showManageJournalModal}
				onClose={() => setShowManageJournalModal(false)}
				details={{
					journal: selectedJournal,
					activity: [],
					size: null,
					lastActivity: null,
				}}
			/>
		</>
	)
}
