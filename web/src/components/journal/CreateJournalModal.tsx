import { JournalContext } from '@/contexts/JournalContext'
import { CreateJournalMeta, JournalMeta } from '@/types/schema'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { useContext } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import AvatarPicker, { DEFAULT_AVATAR } from '../pickers/AvatarPicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { createJournal } from '@/database/actions'

interface CreateJournalModalProps {
	open: boolean
	onClose: () => void
	onCreated: (newJournal: JournalMeta) => void
}

const DEFAULT_JOURNAL_AVATAR = {
	...DEFAULT_AVATAR,
}

export default function CreateJournalModal(props: CreateJournalModalProps) {
	const journalContext = useContext(JournalContext)

	const createJournalForm = useForm<CreateJournalMeta>({
		defaultValues: {
			avatar: {
				...DEFAULT_JOURNAL_AVATAR,
			},
			journalName: '',
		},
		resolver: zodResolver(CreateJournalMeta),
	})

	const handleSubmit = async (formData: CreateJournalMeta) => {
		// Create a new journal
		const newJournal = await createJournal(formData)

		// Refetch journals
		journalContext.getJournalsQuery.refetch()
		props.onCreated(newJournal)
	}

	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<FormProvider {...createJournalForm}>
				<form onSubmit={createJournalForm.handleSubmit(handleSubmit)}>
					<DialogTitle>Create a Journal</DialogTitle>
					<DialogContent sx={{ overflow: "initial" }}>
						<Stack direction="row" spacing={1} mb={2}>
							<Controller
								name="avatar"
								render={({ field }) => <AvatarPicker value={field.value} onChange={field.onChange} />}
								control={createJournalForm.control}
							/>
							<TextField {...createJournalForm.register('journalName')} fullWidth label="Journal Name" />
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={props.onClose}>Cancel</Button>
						<Button variant="contained" type="submit">
							Create Journal
						</Button>
					</DialogActions>
				</form>
			</FormProvider>
		</Dialog>
	)
}
