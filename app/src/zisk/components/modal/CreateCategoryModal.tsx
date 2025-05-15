import { Add } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material'
import CategoryForm from '../form/CategoryForm'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext } from 'react'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { createCategory } from '@/database/actions'
import { JournalContext } from '@/contexts/JournalContext'
import { DEFAULT_AVATAR } from '../pickers/AvatarPicker'
import { CreateCategory } from '@/schema/documents/Category'

interface CreateCategoryModalProps {
	open: boolean
	onClose: () => void
	onSaved: () => void
}

export const CATEGORY_FORM_CREATE_VALUES: CreateCategory = {
	label: '',
	description: '',
	avatar: {
		...DEFAULT_AVATAR,
	},
}

export default function CreateCategoryModal(props: CreateCategoryModalProps) {
	const { snackbar } = useContext(NotificationsContext)

	const theme = useTheme()
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

	const { journal } = useContext(JournalContext)

	const createCategoryForm = useForm<CreateCategory>({
		defaultValues: CATEGORY_FORM_CREATE_VALUES,
		resolver: zodResolver(CreateCategory),
	})

	const handleCreateCategory = async (formData: CreateCategory) => {
		if (!journal) {
			return
		}
		try {
			await createCategory(formData, journal._id)
			snackbar({ message: 'Created category' })
			props.onClose()
			props.onSaved()
		} catch {
			snackbar({ message: 'Failed to create category' })
		}
	}

	return (
		<FormProvider {...createCategoryForm}>
			<Dialog open={props.open} fullWidth fullScreen={fullScreen} onClose={props.onClose} maxWidth="md">
				<form onSubmit={createCategoryForm.handleSubmit(handleCreateCategory)}>
					<DialogTitle>Add Category</DialogTitle>
					<DialogContent sx={{ overflow: 'initial' }}>
						<CategoryForm />
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
