'use client'

import { Save } from '@mui/icons-material'
import { Button, debounce, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import JournalEntryForm from '../form/JournalEntryForm'
import { FormProvider } from 'react-hook-form'
import { useCallback, useContext } from 'react'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { JournalEntry } from '@/types/schema'
import { JournalContext } from '@/contexts/JournalContext'
import DetailsDrawer from '../DetailsDrawer'
import AvatarIcon from '../icon/AvatarIcon'
import { updateJournalEntry } from '@/database/actions'
import useDebounce from '@/hooks/useDebounce'

interface EditJournalEntryModalProps {
	open: boolean
	onClose: () => void
}

export default function JournalEntryModal(props: EditJournalEntryModalProps) {
	const { snackbar } = useContext(NotificationsContext)
	const { journal, journalEntryForm } = useContext(JournalContext)

	const handleUpdateJournalEntry = useCallback((formData: JournalEntry) => {
		if (!journal) {
			return
		}
		updateJournalEntry(formData)
			.then(() => {
				console.log('Put successful')
			})
			.catch((error: any) => {
				console.error(error)
				snackbar({ message: 'Failed to update journal entry' })
			})
	}, [journal]);

	const debouncedOnChange = useDebounce(() => {
		return handleUpdateJournalEntry(journalEntryForm.watch())
	}, 1000)

	return (
		<FormProvider {...journalEntryForm}>
			<DetailsDrawer open={props.open} onClose={props.onClose}>
				<form onSubmit={journalEntryForm.handleSubmit(handleUpdateJournalEntry)} onChange={debouncedOnChange}>
					<DialogTitle>
						<Stack direction='row' gap={1} alignItems='center'>
							<AvatarIcon />
							<Typography variant='inherit'>{journalEntryForm.watch('memo') || 'New Entry'}</Typography>
						</Stack>
					</DialogTitle>				
					<DialogContent sx={{ overflow: 'initial' }}>
						<JournalEntryForm />
					</DialogContent>
					<DialogActions>
						<Button onClick={() => props.onClose()}>Cancel</Button>
						<Button type="submit" variant="contained" startIcon={<Save />}>
							Save
						</Button>
					</DialogActions>
				</form>
			</DetailsDrawer>
		</FormProvider>
	)
}
