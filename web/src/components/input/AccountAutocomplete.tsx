'use client'

import { Autocomplete, AutocompleteProps, ListItem, ListItemIcon, ListItemText, TextField } from '@mui/material'

import { useContext } from 'react'
import { JournalContext } from '@/contexts/JournalContext'
import AvatarIcon from '../icon/AvatarIcon'

export type AccountAutocompleteProps = Partial<Omit<AutocompleteProps<string, false, false, false>, 'options'>>

export default function AccountAutocomplete(props: AccountAutocompleteProps) {
	const { loading, ...rest } = props

	const { getAccountsQuery } = useContext(JournalContext)
	const { data, isLoading } = getAccountsQuery

	return (
		<Autocomplete
			loading={isLoading || loading}
			options={Object.keys(data)}
			renderInput={(params) => <TextField {...params} label={'Account'} />}
			getOptionLabel={(option) => data[option]?.label}
			renderOption={(props, option) => {
				const { key, ...optionProps } = props
				const account = data[option]

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
