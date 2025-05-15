import { Autocomplete, AutocompleteProps, ListItem, ListItemText, TextField } from '@mui/material'
import { Close, Done } from "@mui/icons-material";

import { useContext } from 'react'
import { JournalContext } from '@/contexts/JournalContext'
import { ZiskEntryStatus } from '@/constants/status';
import { EntryTag } from '@/schema/documents/EntryTag';
import { EntryStatus } from '@/schema/models/EntryStatus';
import { useEntryTags } from '@/store/orm/tags';

const filteredStatuses = ZiskEntryStatus.filter((status) => {
	return !status.disabled && !status.archived
})

export type EntryTagAutocompleteProps = Partial<Omit<AutocompleteProps<string, true, false, false>, 'options'>>

export default function EntryTagAutocomplete(props: EntryTagAutocompleteProps) {
	const { loading, ...rest } = props

	const entryTags = useEntryTags()

	const journalContext = useContext(JournalContext)
	const { isLoading } = journalContext.queries.tags

	const options: Record<string, EntryTag | EntryStatus> = {
		...Object.fromEntries(filteredStatuses.map((status) => [status._id, status])),
		...entryTags
	}

	return (
		<Autocomplete
			loading={isLoading || loading}
			options={[...Object.keys(filteredStatuses), ...Object.keys(entryTags)]}
			renderInput={(params) => <TextField {...params} label={'Tag'} />}
			getOptionLabel={(option) => options[option]?.label}
			renderOption={(props, option, { selected }) => {
				const { key, ...optionProps } = props
				const entryTag: EntryTag | EntryStatus | undefined = options[option]

				return (
					<ListItem key={key} {...optionProps}>
						<Done
							sx={(theme) => ({
								width: 17,
								height: 17,
								mr: theme.spacing(1),
								visibility: selected ? 'visible' : 'hidden',
							})}
						/>
						<ListItemText
							primary={entryTag?.label}
							secondary={entryTag?.description}
						/>
						<Close
							sx={{
								opacity: 0.6,
								width: 18,
								height: 18,
								visibility: selected ? 'visible' : 'hidden',
							}}
						/>
					</ListItem>
				);
			}}
			{...rest}
			multiple
		/>
	)
}
