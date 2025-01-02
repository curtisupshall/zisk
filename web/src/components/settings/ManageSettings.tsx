import {
	Paper,
	Stack,
	Typography,
	Tabs,
	Tab,
} from '@mui/material'
import Link from 'next/link'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import JournalSettings from './JournalSettings'
import SyncingSettings from './SyncingSettings'

const SETTINGS_TABS = {
	'syncing': {
		label: 'Syncing',
	},
	'appearance': {
		label: 'Appearance & Behavior',
	},
	'account': {
		label: 'Account',
	},
	'journal': {
		label: 'Journal'
	},
}

const DEFAULT_TAB = Object.keys(SETTINGS_TABS)[0]

export default function ManageSettings() {
	const router = useRouter()
	const [tab] = (router.query['page'] as string) ?? DEFAULT_TAB

	const tabIndex = useMemo(() => {
		return Object.keys(SETTINGS_TABS).indexOf(tab)
	}, [tab])

	return (
		<>
			<Stack mb={4} gap={0.5}>
				<Typography variant='h4'>Settings</Typography>
				<Tabs value={tabIndex} sx={{ mx: -1 }}>
					{Object.entries(SETTINGS_TABS).map(([key, tab]) => {
						const href = `/settings/${key}`
						return (
							<Tab
								component={Link}
								href={href}
								key={key}
								label={tab.label}
								sx={{
									px: 1,
								}}
							/>
						)
					})}
				</Tabs>
			</Stack>

			<Paper sx={(theme) => ({ p: 3, borderRadius: theme.spacing(1) })}>
				{tab === 'syncing' && (
					<SyncingSettings />
				)}
				{tab === 'journal' && (
					<JournalSettings />
				)}
			</Paper>
		</>
	)
}
