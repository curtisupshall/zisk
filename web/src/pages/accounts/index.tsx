import ManageAccounts from '@/components/journal/accounts/ManageAccounts'
import { getLayout } from '@/layouts/main'
import { Container } from '@mui/material'

const AccountsPage = () => {
	return (
		<Container maxWidth="xl" disableGutters sx={{ pt: 1, pl: 1, pr: 3 }}>
			<ManageAccounts />
		</Container>
	)
}

AccountsPage.getLayout = getLayout

export default AccountsPage
