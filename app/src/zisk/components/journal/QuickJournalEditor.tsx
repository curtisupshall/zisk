import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import QuickJournalEntryForm from '../form/QuickJournalEntryForm'
import { Box, Button, Stack } from '@mui/material'
import { Add, Save } from '@mui/icons-material'
import { useContext, useState } from 'react'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { JournalContext } from '@/contexts/JournalContext'
import { makeJournalEntry } from '@/utils/journal'
import { createJournalEntry } from '@/database/actions'
import { JournalSliceContext } from '@/contexts/JournalSliceContext'
import { CreateQuickJournalEntry } from '@/schema/models/QuickJournalEntry'

interface QuickJournalEditorProps {
	onAdd?: () => void
}

export default function QuickJournalEditor(props: QuickJournalEditorProps) {
	const [isActive, setIsActive] = useState<boolean>(false)

	const { snackbar } = useContext(NotificationsContext)
	const { refetchAllDependantQueries } = useContext(JournalSliceContext)
	const { journal } = useContext(JournalContext)

	const createQuickJournalEntryForm = useForm<CreateQuickJournalEntry>({
		defaultValues: {
			memo: '',
			// category: undefined,
			amount: undefined,
		},
		resolver: zodResolver(CreateQuickJournalEntry),
	})

	const handleCreateQuickJournalEntry = async (_formData: CreateQuickJournalEntry) => {
		return;

		// TODO fix after ZK-132

		// if (!journal) {
		// 	return
		// }
		// const journalEntry: JournalEntry = makeJournalEntry({
		// 	amount: formData.amount,
		// 	memo: formData.memo,
		// 	categoryId: formData.categoryId
		// }, journal._id)

		// await createJournalEntry(journalEntry)
		// refetchAllDependantQueries()
		// setIsActive(false)
		// snackbar({ message: 'Created journal entry.' })
		// props.onAdd?.()
		// createQuickJournalEntryForm.reset()
	}

	return (
		<FormProvider {...createQuickJournalEntryForm}>
			<form onSubmit={createQuickJournalEntryForm.handleSubmit(handleCreateQuickJournalEntry)}>
				<Box pr={2} py={0}>
					{isActive ? (
						<Stack direction="row">
							<QuickJournalEntryForm />
							<Button type="submit" startIcon={<Save />}>
								Save
							</Button>
							<Button onClick={() => setIsActive(false)}>Cancel</Button>
						</Stack>
					) : (
						<Button
							size="small"
							startIcon={<Add />}
							onClick={() => {
								if (props.onAdd) {
									props.onAdd()
								} else {
									setIsActive(true)
								}
							}}>
							New Entry
						</Button>
					)}
				</Box>
			</form>
		</FormProvider>
	)
}
