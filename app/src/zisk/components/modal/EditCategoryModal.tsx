import { Save } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material'
import CategoryForm from '../form/CategoryForm'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext, useEffect } from 'react'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { updateCategory } from '@/database/actions'
import { Category } from '@/schema/documents/Category'

interface EditCategoryModalProps {
	open: boolean
	initialValues: Category
	onClose: () => void
	onSaved: () => void
}

export default function EditCategoryModal(props: EditCategoryModalProps) {
	const { snackbar } = useContext(NotificationsContext)

	const theme = useTheme()
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
	
	const updateCategoryForm = useForm<Category>({
		defaultValues: {
			...props.initialValues,
		},
		resolver: zodResolver(Category),
	})	

	const handleUpdateCategory = async (formData: Category) => {
		await updateCategory(formData)
		snackbar({ message: 'Updated category' })
		props.onClose()
		props.onSaved()
	}

	useEffect(() => {
		updateCategoryForm.reset({ ...props.initialValues })
	}, [props.initialValues])

	useEffect(() => {
		if (props.open) {
			updateCategoryForm.reset()
		}
	}, [props.open])

	return (
		<FormProvider {...updateCategoryForm}>
			<Dialog open={props.open} fullWidth fullScreen={fullScreen} onClose={props.onClose} maxWidth="md">
				<form onSubmit={updateCategoryForm.handleSubmit(handleUpdateCategory)}>
					<DialogTitle>Edit Category</DialogTitle>
					<DialogContent sx={{ overflow: 'initial' }}>
						<CategoryForm />
					</DialogContent>
					<DialogActions>
						<Button onClick={() => props.onClose()}>Cancel</Button>
						<Button type="submit" variant="contained" startIcon={<Save />}>
							Save
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</FormProvider>
	)
}
