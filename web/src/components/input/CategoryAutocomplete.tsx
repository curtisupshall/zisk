'use client'

import { Autocomplete, ListItem, ListItemIcon, ListItemText, TextField, AutocompleteProps } from '@mui/material'

import AvatarIcon from '@/components/icon/AvatarIcon'
import { Category } from '@/types/schema'
import { useContext } from 'react'
import { JournalContext } from '@/contexts/JournalContext'

type CategoryAutocompleteProps = Omit<
	AutocompleteProps<Category['_id'], false, false, false>,
	'options' | 'renderInput'
> &
	Partial<Pick<AutocompleteProps<Category['_id'], false, false, false>, 'options' | 'renderInput'>> & {
		label?: string
		variant?: 'filled' | 'outlined' | 'standard'
	}

export default function CategoryAutocomplete(props: CategoryAutocompleteProps) {
	const { label, sx, ...rest } = props

	const { getCategoriesQuery } = useContext(JournalContext)
	const { data, isLoading } = getCategoriesQuery

	return (
		<Autocomplete<Category['_id']>
			loading={isLoading}
			options={Object.keys(data)}
			// isOptionEqualToValue={(option, value) => option._id === value}
			renderInput={(params) => {
				const avatar = props.value && data[props.value]?.avatar
				return (
					<TextField
						{...params}
						label={label ?? 'Category'}
						variant={props.variant}
						slotProps={{
							input: {
								...params.InputProps,
								startAdornment: avatar
									? <AvatarIcon avatar={avatar} />
									: undefined
							}
						}}
					/>
				)
			}}
			getOptionLabel={(option) => data[option]?.label}
			renderOption={(props, option) => {
				const { key, ...optionProps } = props
				const category = data[option]

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
			sx={{
				flex: 1,
				...sx,
			}}
		/>
	)
}
