import { Category, Insights, ReceiptLong, Settings } from '@mui/icons-material'
import { ReactNode } from 'react'

type NavMenuItem = {
	icon: ReactNode
	label: string
	description: string
	disabled?: boolean
	hidden?: boolean
	pathPattern: RegExp
}

export const APP_MENU: Record<string, NavMenuItem> = {
	'/journal': {
		icon: <ReceiptLong fontSize="small" />,
		label: 'Journal',
		description: 'Organize your expenses',
		// Regex matches on /journal, /journal, /journal/abc, /journal/abc/123 /journal/abc/123/123, /journal/abc/123/123/123
		pathPattern: /\/journal(\/.*)?$/,
	},
	'/analyze': {
		icon: <Insights fontSize="small" />,
		label: 'Analyze',
		description: 'Understand your spending',
		// disabled: true,
		pathPattern: /\/analyze(\/.*)?$/,
	},
	'/categories': {
		icon: <Category fontSize="small" />,
		label: 'Categories',
		description: 'Create spending categories',
		pathPattern: /\/categories(\/.*)?$/,
	},
	'/settings': {
		icon: <Settings fontSize="small" />,
		label: 'Settings',
		description: 'Manage journals and edit Zisk settings',
		pathPattern: /\/settings(\/.*)?$/,
	},
}
