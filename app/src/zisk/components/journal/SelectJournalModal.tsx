import { JournalContext } from '@/contexts/JournalContext'
import { Add, East, InfoOutlined } from '@mui/icons-material'
import {
	Avatar,
	Button,
	Chip,
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
	Stack,
	Typography,
} from '@mui/material'
import { use, useContext, useEffect, useMemo, useState } from 'react'
import AvatarIcon from '../icon/AvatarIcon'
import { PLACEHOLDER_UNNAMED_JOURNAL_NAME } from '@/constants/journal'
import ManageJournalModal from './ManageJournalModal'
import { Journal } from '@/schema/documents/Journal'
import { useSetJournalSelectorStatus, useJournalSelectorStatus } from '@/store/app/useJournalSelectorState'
import CreateJournalModal from './CreateJournalModal'
import { useJournals } from '@/store/orm/journals'
import { ZiskContext } from '@/contexts/ZiskContext'

export default function SelectJournalModal() {
	const journalContext = useContext(JournalContext)
	const [showManageJournalModal, setShowManageJournalModal] = useState(false)
	const [selectedJournalId, setSelectedJournalId] = useState<string | null>(journalContext.activeJournalId)
	const [previouslyActiveJournalId, setPreviouslyActiveJournalId] = useState<string | null>(null)

	const journals = useJournals()

	const [journalSelectorState, setJournalSelectorStatus] = [useJournalSelectorStatus(), useSetJournalSelectorStatus()]
	const showSelectJournalModal = ['SELECTING', 'CREATING'].includes(journalSelectorState)

	useEffect(() => {
		if (showSelectJournalModal) {
			setSelectedJournalId(journalContext.activeJournalId)
		}
	}, [journalContext.activeJournalId, showSelectJournalModal])

	useEffect(() => {
		if (showSelectJournalModal) {
			setPreviouslyActiveJournalId(journalContext.activeJournalId)
		}
	}, [showSelectJournalModal])

	const handleContinue = () => {
		if (!selectedJournalId) {
			return
		}
		journalContext.setActiveJournalId(selectedJournalId)
		onCloseSelectJournalModal()
	}

	const onCloseCreateModal = () => {
		setJournalSelectorStatus('SELECTING')
	}

	const onCloseSelectJournalModal = () => {
		setJournalSelectorStatus('CLOSED')
	}

	const handleManageJournal = (journal: Journal) => {
		setSelectedJournalId(journal._id)
		setShowManageJournalModal(true)
	}

	const handleDeletedJournal = (journal: Journal) => {
		// If the deleted journal is the active journal, reset the active journal
		if (journal._id === journalContext.activeJournalId) {
			journalContext.setActiveJournalId(null)
		}
	}

	const hasActiveJournal = Boolean(journalContext.activeJournalId)

	return (
		<>
			<CreateJournalModal
				open={journalSelectorState === 'CREATING'}
				onClose={onCloseCreateModal}
				onCreated={(newJournal) => setSelectedJournalId(newJournal._id)}
			/>
			<Dialog open={showSelectJournalModal}>
				<DialogTitle>Your Journals</DialogTitle>
				{!hasActiveJournal && (
					<DialogContent>
						<DialogContentText>Please select a journal.</DialogContentText>
					</DialogContent>
				)}
				<List>
					{Object.values(journals).map((journal: Journal) => {
						const selected = selectedJournalId === journal._id
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
									onClick={() => setSelectedJournalId(journal._id)}
									selected={selected}
								>
									<ListItemAvatar>
										<Avatar>
											<AvatarIcon avatar={journal.avatar} />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary={
											<Stack direction="row" spacing={2} alignItems="center">
												<Typography sx={{ fontStyle: !journal.journalName ? 'italic' : undefined }}>
													{journal.journalName || PLACEHOLDER_UNNAMED_JOURNAL_NAME}
												</Typography>
												{journal._id === previouslyActiveJournalId && (
													<Chip
														size='small'
														color='primary'
														label={<Typography variant='overline'>Active</Typography>}
													/>
												)}
											</Stack>
										}
										// secondary={journal._id === journalContext.activeJournalId?._id
										// 	? <Chip
										// 		size='small'
										// 		color='primary'
										// 		label={<Typography variant='overline'>Active</Typography>}
										// 	/>
										// 	: undefined
										// }
									/>
								</ListItemButton>
							</ListItem>
						)
					})}
					{Object.values(journals).length > 0 && (
						<Divider component="li" />
					)}
					<ListItem disablePadding>
						<ListItemButton
							onClick={() => setJournalSelectorStatus('CREATING')}
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
					{journalContext.activeJournalId && (
						<Button onClick={() => setJournalSelectorStatus('CLOSED')}>Cancel</Button>
					)}
					<Button
						variant="contained"
						disabled={!selectedJournalId || journalContext.activeJournalId === selectedJournalId}
						onClick={() => handleContinue()}
						startIcon={<East />}
					>
						{hasActiveJournal ? 'Switch Journal' : 'Select Journal'}
					</Button>
				</DialogActions>
			</Dialog>
			<ManageJournalModal
				open={showManageJournalModal}
				onClose={() => setShowManageJournalModal(false)}
				details={{
					journal: selectedJournalId ? journals[selectedJournalId] ?? null : null,
					activity: [],
					size: null,
					lastActivity: null,
				}}
				onDeletedJournal={handleDeletedJournal}
			/>
		</>
	)
}
