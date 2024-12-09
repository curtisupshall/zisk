import { JournalMeta } from '@/types/schema'
import AvatarIcon from '@/components/icon/AvatarIcon'
import { getRelativeTime } from '@/utils/date'
import { Box, Dialog, DialogContent, Grid2 as Grid, Stack, Tab, Tabs, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { formatFileSize } from '@/utils/string'
import { PLACEHOLDER_UNNAMED_JOURNAL_NAME } from '@/constants/journal'

interface JournalDetailsAndActivityProps {
	journal: JournalMeta | null
	size: number | null
	lastActivity: string | null
	activity: never[]
}

type JournalProperty = {
	label: string
	value: string
}

interface ManageJournalModalProps {
	open: boolean
	onClose: () => void
	details: JournalDetailsAndActivityProps
}

const JOURNAL_TYPE_LABEL_MAP = {
	JOURNAL: 'Zisk Journal',
}

function JournalDetailsAndActivity(props: JournalDetailsAndActivityProps) {
	const [tab, setTab] = useState<number>(0)

	const properties: JournalProperty[] = useMemo(() => {
		return [
			{
				label: 'Type',
				value: props.journal?.type ? JOURNAL_TYPE_LABEL_MAP[props.journal?.type] : '',
			},
			{
				label: 'Last Activity',
				value: props.lastActivity ? getRelativeTime(props.lastActivity) : '',
			},
			{
				label: 'Version',
				value: props.journal ? String(props.journal.journalVersion) : '',
			},
			{
				label: 'Size',
				value: props.size === null ? '' : formatFileSize(props.size),
			},
			{
				label: 'Modified',
				value: props.journal?.updatedAt ? dayjs(props.journal.updatedAt).format('MMM D, YYYY') : '',
			},
			{
				label: 'Created',
				value: props.journal?.createdAt ? dayjs(props.journal.createdAt).format('MMM D, YYYY') : '',
			},
		]
	}, [props.activity, props.journal, props.size])

	return (
		<Stack>
			{props.journal && (
				<Stack direction="row" gap={2} alignItems={'center'}>
					<Box sx={{ '& > * ': { fontSize: '36px !important' } }}>
						<AvatarIcon avatar={props.journal.avatar} />
					</Box>
					<Typography variant="h5" sx={{ fontStyle: !props.journal?.journalName ? 'italic' : undefined }}>
						{props.journal.journalName || PLACEHOLDER_UNNAMED_JOURNAL_NAME}
					</Typography>
				</Stack>
			)}
			<Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
				<Tab label="Details" />
				{/* <Tab label="Activity" /> */}
			</Tabs>
			{tab === 0 && (
				<Grid container columns={12} spacing={2}>
					{properties.map((property) => (
						<Grid size={6} sx={{ display: 'flex', flexFlow: 'column nowrap' }} key={property.label}>
							<Typography variant="body1">{property.label}</Typography>
							<Typography variant="body2">{property.value || '--'}</Typography>
						</Grid>
					))}
				</Grid>
			)}
			{tab === 1 && (
				<>
					<Typography>Not available.</Typography>
				</>
			)}
		</Stack>
	)
}

export default function ManageJournalModal(props: ManageJournalModalProps) {
	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<DialogContent>
				<JournalDetailsAndActivity
					{...props.details}
				/>
			</DialogContent>
		</Dialog>
	)
}