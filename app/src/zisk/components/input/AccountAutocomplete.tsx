import { Autocomplete, AutocompleteProps, ListItem, ListItemIcon, ListItemText, TextField } from '@mui/material'

import { useContext } from 'react'
import { JournalContext } from '@/contexts/JournalContext'
import AvatarIcon from '../icon/AvatarIcon'
import { useAccounts } from '@/store/orm/accounts'

export type AccountAutocompleteProps = Partial<Omit<AutocompleteProps<string, false, false, false>, 'options'>>

export default function AccountAutocomplete(props: AccountAutocompleteProps) {
	const { loading, ...rest } = props

	const accounts = useAccounts()

	const journalContext = useContext(JournalContext)
	const { isLoading } = journalContext.queries.accounts

	return (
		<Autocomplete
			loading={isLoading || loading}
			options={Object.keys(accounts)}
			renderInput={(params) => <TextField {...params} label={'Account'} />}
			getOptionLabel={(option) => accounts[option]?.label}
			renderOption={(props, option) => {
				const { key, ...optionProps } = props
				const account = accounts[option]

				return (
					<ListItem dense key={key} {...optionProps}>
						<ListItemIcon>
							<AvatarIcon avatar={account?.avatar} />
						</ListItemIcon>
						<ListItemText primary={account?.label} />
					</ListItem>
				)
			}}
			{...rest}
		/>
	)
}
