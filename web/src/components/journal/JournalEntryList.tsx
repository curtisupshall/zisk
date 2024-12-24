import {
	alpha,
	Avatar,
	Button,
	Chip,
	Grid2 as Grid,
	ListItemText,
	Stack,
	Table,
	TableBody as MuiTableBody,
	TableCell as MuiTableCell,
	TableRow as MuiTableRow,
	Typography,
	useMediaQuery,
	useTheme,
	TableRowProps,
	TableCellProps,
	TableBodyProps,
	Grow,
} from '@mui/material'
import React, { useContext } from 'react'

import { Category, JournalEntry } from '@/types/schema'
import dayjs from 'dayjs'
import AvatarIcon from '@/components/icon/AvatarIcon'
import { getPriceString } from '@/utils/string'
import CategoryChip from '../icon/CategoryChip'
import QuickJournalEditor from './QuickJournalEditor'
import { Flag, LocalOffer } from '@mui/icons-material'
import { JournalContext } from '@/contexts/JournalContext'
import { PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO } from '@/constants/journal'
import { calculateNetAmount, journalEntryHasTags, journalEntryIsFlagged } from '@/utils/journal'

const TableRow = (props: TableRowProps) => {
	const { sx, ...rest } = props
	return (
		<MuiTableRow
			hover
			// component={TableRowButton}
			sx={{
				borderTopLeftRadius: '64px',
				borderBottomLeftRadius: '64px',
				overflow: 'hidden',
				'& > *:first-of-type': {
					borderTopLeftRadius: '64px',
					borderBottomLeftRadius: '64px',
				},
				userSelect: 'none',
				cursor: 'pointer',
				...sx,
			}}
			{...rest}
		/>
	)
}

const TableCell = (props: TableCellProps) => {
	const { sx, ...rest } = props
	return (
		<MuiTableCell
			{...rest}
			sx={{
				alignItems: 'center',
				px: 1,
				...sx,
			}}
		/>
	)
}

const TableBody = (props: TableBodyProps) => {
	const { sx, ...rest } = props
	return (
		<MuiTableBody
			{...rest}
			sx={{
				...sx,
				'& > tr:last-of-type td': {
					borderBottom: 'none',
				},
			}}
		/>
	)
}

interface JournalEntryListProps {
	journalRecordGroups: Record<string, JournalEntry[]>
	onClickListItem: (event: any, entry: JournalEntry) => void
	onDoubleClickListItem: (event: any, entry: JournalEntry) => void
}

const JournalEntryDate = ({ day, isToday }: { day: dayjs.Dayjs; isToday: boolean }) => {
	// const theme = useTheme();
	// const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Stack
			component={Button}
			direction="row"
			alignItems="center"
			gap={1.5}
			sx={{
				py: 0,
				px: 2,
				// pt: 0,
				color: isToday ? undefined : 'unset',
				// px: 1,
				// ml: 1,
				my: 1,
				ml: 1,
			}}>
			<Avatar
				sx={(theme) => ({
					background: isToday ? theme.palette.primary.main : 'transparent',
					color: isToday ? theme.palette.primary.contrastText : 'inherit',
					minWidth: 'unset',
					m: -1,
					width: theme.spacing(3.5),
					height: theme.spacing(3.5),
				})}>
				{day.format('D')}
			</Avatar>
			<Typography
				sx={(theme) => ({ height: theme.spacing(3.5), lineHeight: theme.spacing(3.5) })}
				variant="overline"
				color={isToday ? 'primary' : undefined}>
				{day.format('MMM')},&nbsp;{day.format('ddd')}
			</Typography>
		</Stack>
	)
}

export default function JournalEntryList(props: JournalEntryListProps) {
	const theme = useTheme()
	const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
	const { getCategoriesQuery } = useContext(JournalContext)

	return (
		<Grid
			container
			columns={12}
			sx={{
				'--Grid-borderWidth': '1px',
				borderColor: 'divider',
				'& > div': {
					borderBottom: 'var(--Grid-borderWidth) solid',
					borderColor: 'divider',

					'&.date-cell': {
						borderWidth: {
							xs: '0',
							sm: '1px',
						},
					},
				},
			}}>
			{Object.entries(props.journalRecordGroups)
				.sort(([dateA, _a], [dateB, _b]) => {
					return new Date(dateA).getTime() - new Date(dateB).getTime()
				})
				.map(([date, entries]) => {
					const day = dayjs(date)
					const isToday = day.isSame(dayjs(), 'day')

					return (
						<React.Fragment key={date}>
							<Grid size={{ xs: 12, sm: 2 }} className="date-cell">
								<JournalEntryDate day={day} isToday={isToday} />
							</Grid>
							<Grid size={{ xs: 12, sm: 10 }}>
								{entries.length > 0 && (
									<Table size="small">
										<TableBody>
											{entries.map((entry) => {
												const { categoryIds } = entry
												const categoryId: string | undefined = categoryIds?.[0]
												const category: Category | undefined = categoryId
													? getCategoriesQuery.data[categoryId]
													: undefined
												const netAmount = calculateNetAmount(entry)
												const isNetPositive = netAmount > 0
												const isFlagged = journalEntryIsFlagged(entry)
												const hasTags = journalEntryHasTags(entry)

												return (
													<TableRow
														key={entry._id}
														onClick={(event) => props.onClickListItem(event, entry)}
														onDoubleClick={(event) => props.onDoubleClickListItem(event, entry)}
													>
														<TableCell sx={{ width: '0%', borderBottom: 'none' }}>
															<AvatarIcon avatar={category?.avatar} compact={isSmall} />
														</TableCell>
														<TableCell sx={{ width: '40%' }}>
															<ListItemText>{entry.memo || PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO}</ListItemText>
														</TableCell>
														<TableCell sx={{ width: '0%' }}>
															<Stack direction='row'>
																<Grow in={isFlagged}>
																	<Flag sx={{ display: 'block' }} />
																</Grow>
																<Grow in={hasTags}>
																	<LocalOffer sx={{ display: 'block' }} />
																</Grow>
															</Stack>
														</TableCell>
														<TableCell align="right" sx={{ width: '10%' }}>
															<Typography
																sx={(theme) => ({
																	color: isNetPositive
																		? theme.palette.success.main
																		: undefined,
																})}>
																{getPriceString(netAmount)}
															</Typography>
														</TableCell>
														<TableCell>
															{category ? (
																<CategoryChip category={category} />
															) : (
																<Chip
																	sx={(theme) => ({
																		backgroundColor: alpha(
																			theme.palette.grey[400],
																			0.125
																		),
																	})}
																	label="Uncategorized"
																/>
															)}
														</TableCell>
													</TableRow>
												)
											})}
										</TableBody>
									</Table>
								)}
								{isToday && <QuickJournalEditor onAdd={isSmall ? () => {} : undefined} />}
							</Grid>
						</React.Fragment>
					)
				})}
		</Grid>
	)
}
