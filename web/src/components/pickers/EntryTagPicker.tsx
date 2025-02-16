
import { 
    AutocompleteCloseReason,
    ClickAwayListener,
    Divider,
    InputBase,
    Link,
    Paper,
    Popper,
    Typography
} from "@mui/material";

import { useState } from "react";
import EntryTagAutocomplete, { EntryTagAutocompleteProps } from "../input/EntryTagAutocomplete";

interface EntryTagPickerProps extends Omit<EntryTagAutocompleteProps, 'renderInput'> {
	anchorEl: HTMLElement | null
	open: boolean
	onClose: () => void
	onCreateEntryTagWithValue: (value: string) => Promise<void>
}

export const EntryTagPicker = (props: EntryTagPickerProps) => {
	const [searchValue, setSearchValue] = useState<string>('')

	const {
		anchorEl,
		open,
		onClose,
		onCreateEntryTagWithValue,
		// options,
		...rest
	} = props

	return (
		<Popper
			open={open}
			anchorEl={anchorEl}
			sx={(theme) => ({ width: '300px', zIndex: theme.zIndex.modal})}
			placement='bottom-start'
		>
			<ClickAwayListener onClickAway={onClose}>
				<Paper>
					<EntryTagAutocomplete
						{...rest}
						open
						onClose={(
							_event,
							reason: AutocompleteCloseReason,
						) => {
							if (reason === 'escape') {
								onClose();
							}
						}}
						disableCloseOnSelect
						noOptionsText={
							searchValue.length === 0 ? (
								<Typography variant='body2' color='textSecondary'>
									No tags
								</Typography>
							) : (
								<Link onClick={() => onCreateEntryTagWithValue(searchValue)}>
									Create new tag &quot;{searchValue}&quot;
								</Link>
							)
						}
						renderTags={() => null}
						renderInput={(params) => (
							<>
								<InputBase
									sx={{ width: '100%', px: 2, py: 1 }}
									ref={params.InputProps.ref}
									value={searchValue}
									onChange={(event) => setSearchValue(event.target.value)}
									inputProps={params.inputProps}
									autoFocus
									placeholder="Filter tags"
								/>
								<Divider />
							</>
						)}
						slots={{
							popper: (params: any) => <div {...params} />,
							paper: (params) => <div {...params} />,
						}}
					/>
				</Paper>
			</ClickAwayListener>
		</Popper>
	)
}