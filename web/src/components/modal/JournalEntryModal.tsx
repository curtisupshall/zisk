'use client'

import { DialogContent, DialogTitle, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import JournalEntryForm from '../form/JournalEntryForm'
import { FormProvider, useWatch } from 'react-hook-form'
import { useCallback, useContext, useEffect } from 'react'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { JournalEntry } from '@/types/schema'
import { JournalContext } from '@/contexts/JournalContext'
import DetailsDrawer from '../DetailsDrawer'
import AvatarIcon from '../icon/AvatarIcon'
import { deleteJournalEntry, updateJournalEntry } from '@/database/actions'
import { PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO } from '@/constants/journal'
import { useDebounce } from '@/hooks/useDebounce'
import useUnsavedChangesWarning from '@/hooks/useUnsavedChangesWarning'
import { useQueryClient } from '@tanstack/react-query'
import { Delete } from '@mui/icons-material'

interface EditJournalEntryModalProps {
	open: boolean
	onClose: () => void
}

const JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY = 'JOURNAL_ENTRY'

export default function JournalEntryModal(props: EditJournalEntryModalProps) {
	const { snackbar } = useContext(NotificationsContext)
	const { journal, journalEntryForm } = useContext(JournalContext)
	const queryClient = useQueryClient()
	const { disableUnsavedChangesWarning, enableUnsavedChangesWarning } = useUnsavedChangesWarning()

	useEffect(() => {
		if (props.open) {
			// Prevents the user from closing the browser tab with potentially unsaved changes
			enableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
		}
	}, [props.open])

	const handleSaveFormWithCurrentValues = useCallback(async () => {
		if (!journal) {
			return Promise.resolve()
		}
		const formData: JournalEntry = journalEntryForm.getValues()
		return updateJournalEntry(formData)
			.then(() => {
				console.log('Put journal entry.')
				disableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
			})
			.catch((error: any) => {
				console.error(error)
				snackbar({ message: 'Failed to update journal entry' })
			})
	}, [journal]);

	const currentFormState = useWatch({ control: journalEntryForm.control })
	const currentMemoValue = currentFormState.memo ?? ''

	const [debouncedhandleSaveFormWithCurrentValues, flushSaveFormDebounce] = useDebounce(handleSaveFormWithCurrentValues, 1000)

	useEffect(() => {
		if (!journalEntryForm.formState.isDirty) {
			return
		}
		debouncedhandleSaveFormWithCurrentValues()
		enableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
	}, [currentFormState])

	const refreshJournalEntriesQuery = () => {
		queryClient.invalidateQueries({ predicate: query => query.queryKey[0] === 'enhancedJournalEntries' })
	}

	const handleClose = () => {
		props.onClose();
		if (!journalEntryForm.formState.isDirty) {
			return
		}
		flushSaveFormDebounce()
		handleSaveFormWithCurrentValues().then(() => {
			refreshJournalEntriesQuery()
			snackbar({ message: 'Saved journal entry.' })
			disableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
		})
	}

	const handleDelete = useCallback(async () => {
		const formData: JournalEntry = journalEntryForm.getValues()
		deleteJournalEntry(formData._id).then(() => {
			refreshJournalEntriesQuery()
			snackbar({ message: 'Deleted journal entry.' })
			disableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
			props.onClose()
		}).catch((error: any) => {
			console.error(error)
			snackbar({ message: 'Failed to delete journal entry' })
		})
	}, [journal])

	return (
		<FormProvider {...journalEntryForm}>
			<DetailsDrawer
				open={props.open}
				onClose={handleClose}
				actions={
					<>
						<Tooltip title='Delete Entry'>
							<IconButton onClick={() => handleDelete()}>
								<Delete />
							</IconButton>
						</Tooltip>
					</>
				}
			>
				<form>
					<DialogTitle>
						<Stack direction='row' gap={1} alignItems='center'>
							<AvatarIcon />
							<Typography variant='inherit'>
								{currentMemoValue.trim() || PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO}
							</Typography>
						</Stack>
					</DialogTitle>
					<DialogContent sx={{ overflow: 'initial' }}>
						<JournalEntryForm />
					</DialogContent>
				</form>
			</DetailsDrawer>
		</FormProvider>
	)
}
