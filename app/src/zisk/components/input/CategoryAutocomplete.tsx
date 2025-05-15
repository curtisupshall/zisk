import { Autocomplete, AutocompleteProps, ListItem, ListItemIcon, ListItemText, TextField } from '@mui/material'

import { useContext } from 'react'
import { JournalContext } from '@/contexts/JournalContext'
import AvatarIcon from '../icon/AvatarIcon'
import { useCategories } from '@/store/orm/categories'

export type CategoryAutocompleteProps = Partial<Omit<AutocompleteProps<string, boolean, false, false>, 'options'>>

export default function CategoryAutocomplete(props: CategoryAutocompleteProps) {
	const { loading, ...rest } = props

	const categories = useCategories()

	const journalContext = useContext(JournalContext)
	const { isLoading } = journalContext.queries.categories

	return (
		<Autocomplete
			loading={isLoading || loading}
			options={Object.keys(categories)}
			renderInput={(params) => <TextField {...params} label={'Category'} />}
			getOptionLabel={(option) => categories[option]?.label}
			renderOption={(props, option) => {
				const { key, ...optionProps } = props
				const category = categories[option]

				return (
					<ListItem dense key={key} {...optionProps}>
						<ListItemIcon>
							<AvatarIcon avatar={category?.avatar} />
						</ListItemIcon>
						<ListItemText primary={category?.label} />
					</ListItem>
				)
			}}
			{...rest}
		/>
	)
}
