'use client'

import { IconButton, Stack, useMediaQuery, useTheme } from '@mui/material'
import AppLogo from './AppLogo'
import { Menu, MenuOpen, Settings } from '@mui/icons-material'
import { useAppMenuStateStore } from '@/store/useAppMenuStateStore'
import ActiveJournal from './ActiveJournal'
import SearchWidget from './search/SearchWidget'
import UserWidget from './UserWidget'

interface HeaderProps {
	view: 'desktop' | 'mobile'
}

export default function Header(props: HeaderProps) {
	const theme = useTheme()
	const showLogo = !useMediaQuery(theme.breakpoints.down('md'))

	// Get toggle menu function from zustand store
	const toggleExpanded = useAppMenuStateStore((state) => state.toggleExpanded)
	const openDrawer = useAppMenuStateStore((state) => state.openDrawer)
	const isExpanded = useAppMenuStateStore((state) => state.isExpanded)

	const handleClickMenuButton = () => {
		// If the screen is small, open the drawer. Otherwise, toggle the menu
		if (props.view === 'mobile') {
			openDrawer()
		} else {
			toggleExpanded()
		}
	}

	return (
		<Stack
			component="header"
			direction="row"
			gap={1}
			alignItems="center"
			justifyContent={'space-between'}
			sx={{
				py: 1,
				px: 1.5,
				color: 'inherit',
				textDecoration: 'none',
			}}>
			<Stack direction="row" gap={1} alignItems={'center'}>
				<IconButton onClick={() => handleClickMenuButton()} size="large">
					{isExpanded ? <MenuOpen /> : <Menu />}
				</IconButton>
				{showLogo && <AppLogo />}
				<Stack direction="row" alignItems="center" gap={1} ml={showLogo ? 2 : undefined}>
					<ActiveJournal />
					{/* <SyncStatus /> */}
				</Stack>
			</Stack>
			<Stack direction="row" gap={1} alignItems={'center'}>
				<SearchWidget />
				<IconButton sx={(theme) => ({ color: theme.palette.text.secondary })}>
					<Settings />
				</IconButton>
				<UserWidget />
			</Stack>
		</Stack>
	)
}

// const Shortcut = (props: PropsWithChildren) => {
//     return (
//         <Typography component='kbd' sx={(theme) => {
//             return {
//                 // all: 'unset',
//                 // fontSize: theme.typography.pxToRem(12),
//                 fontWeight: 'bold',
//                 lineHeight: '19px',
//                 marginLeft: theme.spacing(0.5),
//                 border: `1px solid ${theme.palette.grey[200]}`,
//                 backgroundColor: theme.palette.background.paper,
//                 padding: theme.spacing(0, 0.5),
//                 borderRadius: 7,
//                 // ...theme.applyDarkStyles({
//                 //     borderColor: (theme).palette.primaryDark[600],
//                 //     backgroundColor: (theme).palette.primaryDark[800],
//                 // }),
//             };
//         }}>
//             {props.children}
//         </Typography>
//     )
// }
