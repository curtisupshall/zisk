import {
	Paper,
	Stack,
	Typography,
	Tabs,
	Tab,
} from '@mui/material'
import Link from 'next/link'
import { useMemo } from 'react'

const SETTINGS_TABS = {
	'appearance': {
		label: 'Appearance & Behavior',
	},
	'account': {
		label: 'Account',
	},
	'journals': {
		label: 'Journals'
	}
}

export default function ManageSettings() {
	const tab = useMemo(() => {
		return 0
	}, [])

	return (
		<>
			<Stack mb={4} gap={2}>
				<Typography variant='h4'>Settings</Typography>
				<Tabs value={tab}>
					{Object.entries(SETTINGS_TABS).map(([key, tab]) => {
						const href = `/settings/${key}`
						return (
							<Tab component={Link} href={href} key={key} label={tab.label} />
						)
					})}
				</Tabs>
			</Stack>

			<Paper sx={(theme) => ({ borderRadius: theme.spacing(1) })}>
				Hello
			</Paper>
		</>
	)
}
