import AvatarIcon from '@/components/icon/AvatarIcon'
import AvatarChip from '@/components/icon/AvatarChip'
import CreateAccountModal from '@/components/modal/CreateAccountModal'
import EditAccountModal from '@/components/modal/EditAccountModal'
import { JournalContext } from '@/contexts/JournalContext'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { deleteRecord, restoreRecord } from '@/database/actions'
import { Account } from '@/schema/documents/Account'
import { pluralize as p } from '@/utils/string'
import { Add, Search } from '@mui/icons-material'
import {
	Button,
	Divider,
	Link as MuiLink,
	ListItem,
	ListItemIcon,
	MenuList,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material'
import { useContext, useState } from 'react'

export default function ManageAccounts() {
	const [showCreateAccountModal, setShowCreateAccountModal] = useState(false)
	const [showEditAccountModal, setShowEditAccountModal] = useState(false)
	const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

	const { snackbar } = useContext(NotificationsContext)
	const { getAccountsQuery } = useContext(JournalContext)

	const handleSelectAccountForEdit = (account: Account) => {
		setSelectedAccount(account)
		setShowEditAccountModal(true)
	}

	const handleDeleteAccount = async (account: Account) => {
		const record = await deleteRecord(account)

		snackbar({
			message: 'Deleted account',
			action: {
				label: 'Undo',
				onClick: () => {
					restoreRecord(record)
						.then(() => {
							getAccountsQuery.refetch()
							snackbar({ message: 'Account restored' })
						})
						.catch(() => {
							snackbar({ message: 'Failed to restore account' })
						})
				},
			},
		})
		getAccountsQuery.refetch()
	}

	const accounts = Object.values(getAccountsQuery.data)

	return (
		<>
			<CreateAccountModal
				open={showCreateAccountModal}
				onClose={() => setShowCreateAccountModal(false)}
				onSaved={() => getAccountsQuery.refetch()}
			/>
			{selectedAccount && (
				<EditAccountModal
					open={showEditAccountModal}
					initialValues={selectedAccount}
					onClose={() => setShowEditAccountModal(false)}
					onSaved={() => getAccountsQuery.refetch()}
				/>
			)}
			<Stack mb={4} gap={0.5}>
				<Typography variant='h4'>Accounts</Typography>
				{/* <Typography variant='body2'>
					Manage accounts to organize your journal entries.
				</Typography> */}
			</Stack>
			<Stack gap={2}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<TextField
						slotProps={{
							input: {
								startAdornment: <Search />,
							}
						}}
						label="Search all accounts"
						size='small'
					/>
					<Button startIcon={<Add />} onClick={() => setShowCreateAccountModal(true)} variant="contained" size='small'>
						Add Account
					</Button>
				</Stack>
				<Paper sx={(theme) => ({ borderRadius: theme.spacing(1) })}>
					<Stack p={2} direction="row" justifyContent="space-between" alignItems="center">
						<Typography>
							<>{accounts.length} {p(accounts.length, 'account')}</>
						</Typography>
					</Stack>
					<Divider />
					{Object.values(getAccountsQuery.data).length === 0 ? (
						<Typography align="center" variant='body2' px={2} py={3}>
							No accounts. <MuiLink sx={{ pointer: 'cursor' }} onClick={() => setShowCreateAccountModal(true)}>Create one</MuiLink>
						</Typography>
					) : (
						<MenuList>
							{Object.values(getAccountsQuery.data).map((account) => {
								return (
									<ListItem
										key={account._id}
										secondaryAction={
											<Stack direction='row' gap={1}>
												<Button
													color='primary'
													onClick={() => handleSelectAccountForEdit(account)}
												>
													Edit
												</Button>
												<Button
													color='error'
													onClick={() => handleDeleteAccount(account)}
												>
													Delete
												</Button>
											</Stack>
										}
									>
										<ListItemIcon>
											<AvatarIcon avatar={account?.avatar} />
										</ListItemIcon>
										<a  href='#'>
											<AvatarChip avatar={account.avatar} label={account.label} contrast />
										</a>
									</ListItem>
								)
							})}
						</MenuList>
					)}
				</Paper>
			</Stack>
		</>
	)
}
