'use client'

import { Add } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material'
import JournalEntryForm from '../form/JournalEntryForm'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext, useEffect, useMemo } from 'react'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { CreateJournalEntryForm } from '@/types/schema'
import { createOrUpdateJournalEntry } from '@/database/actions'
import dayjs from 'dayjs'
import { JournalContext } from '@/contexts/JournalContext'

interface JournalEntryModalProps {
	open: boolean
	initialDate: string | undefined | null
	onClose: () => void
	onSaved: () => void
}

export default function CreateJournalEntryModal(props: JournalEntryModalProps) {
	const { snackbar } = useContext(NotificationsContext)
	const { journal } = useContext(JournalContext)

	const initialDate = useMemo(() => {
		if (!props.initialDate) {
			return dayjs().format('YYYY-MM-DD')
		}
		return props.initialDate
	}, [props.initialDate])

	const handleCreateJournalEntry = async (formData: CreateJournalEntryForm) => {
		if (!journal) {
			return
		}
		await createOrUpdateJournalEntry(formData, journal._id)
		snackbar({ message: 'Created journal entry' })
		props.onSaved()
	}

	const createJournalEntryForm = useForm<CreateJournalEntryForm>({
		defaultValues: {
			parent: {
				memo: '',
				amount: '',
				date: initialDate,
				categoryIds: [],
				tagIds: [],
				artifactIds: [],
				notes: '',
				paymentMethodId: null,
				relatedEntryIds: [],
			},
			children: [],
		},
		resolver: zodResolver(CreateJournalEntryForm),
	})

	useEffect(() => {
		createJournalEntryForm.setValue('parent.date', initialDate)
	}, [initialDate])

	const theme = useTheme()
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<FormProvider {...createJournalEntryForm}>
			<Dialog open={props.open} fullWidth fullScreen={fullScreen} onClose={props.onClose} maxWidth="md">
				<form onSubmit={createJournalEntryForm.handleSubmit(handleCreateJournalEntry)}>
					<DialogTitle>Add Entry</DialogTitle>
					<DialogContent sx={{ overflow: 'initial' }}>
						<JournalEntryForm />
					</DialogContent>
					<DialogActions>
						<Button onClick={() => props.onClose()}>Cancel</Button>
						<Button type="submit" variant="contained" startIcon={<Add />}>
							Add
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</FormProvider>
	)
}
