import KeyboardShortcut from '@/components/text/KeyboardShortcut'
import { Search } from '@mui/icons-material'
import { Button, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material'

export interface SearchLaunchButtonProps {
    placeholderText?: string
    onOpen: () => void
}

export default function SearchLaunchButton(props: SearchLaunchButtonProps) {
	const theme = useTheme()
	const showSearchBar = !useMediaQuery(theme.breakpoints.down('md'))

	const placeholderText = props.placeholderText ?? 'Search'

	if (showSearchBar) {
		return (
			<Button
				variant="text"
				sx={(theme) => ({
					color: theme.palette.text.secondary,
					backgroundColor: theme.palette.action.hover,
					borderRadius: 16,
					py: 0.75,
					px: 2,
					pr: 8,
				})}
				startIcon={<Search color="inherit" />}
                onClick={() => props.onOpen()}
            >
				<Typography sx={{ userSelect: 'none', display: 'flex', alignItems: 'center', gap: 0.5 }}>
					{placeholderText}
					<KeyboardShortcut letter="/" />
				</Typography>
			</Button>
		)
	}

	return (
		<IconButton>
			<Search />
		</IconButton>
	)
}