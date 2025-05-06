import { Add } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material'
import AccountForm from '../form/AccountForm'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext } from 'react'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { createAccount } from '@/database/actions'
import { JournalContext } from '@/contexts/JournalContext'
import { CreateAccount } from '@/schema/documents/Account'
import { DEFAULT_AVATAR } from '../pickers/AvatarPicker'

interface CreateAccountModalProps {
	open: boolean
	onClose: () => void
	onSaved: () => void
}

export const ACCOUNT_FORM_CREATE_VALUES: CreateAccount = {
	label: '',
	description: '',
	avatar: {
		...DEFAULT_AVATAR,
	},
}

export default function CreateAccountModal(props: CreateAccountModalProps) {
	const { snackbar } = useContext(NotificationsContext)

	const theme = useTheme()
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

	const { journal } = useContext(JournalContext)

	const createAccountForm = useForm<CreateAccount>({
		defaultValues: ACCOUNT_FORM_CREATE_VALUES,
		resolver: zodResolver(CreateAccount),
	})

	const handleCreateAccount = async (formData: CreateAccount) => {
		if (!journal) {
			return
		}
		try {
			await createAccount(formData, journal._id)
			snackbar({ message: 'Created account' })
			props.onClose()
			props.onSaved()
		} catch {
			snackbar({ message: 'Failed to create account' })
		}
	}

	return (
		<FormProvider {...createAccountForm}>
			<Dialog open={props.open} fullWidth fullScreen={fullScreen} onClose={props.onClose} maxWidth="md">
				<form onSubmit={createAccountForm.handleSubmit(handleCreateAccount)}>
					<DialogTitle>Add Account</DialogTitle>
					<DialogContent sx={{ overflow: 'initial' }}>
						<AccountForm />
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
