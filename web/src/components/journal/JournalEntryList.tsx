import {
	alpha,
	Avatar,
	Button,
	Chip,
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
	Checkbox,
} from '@mui/material'
import React, { useContext, useMemo } from 'react'

import { Category, JournalEntry } from '@/types/schema'
import dayjs from 'dayjs'
import AvatarIcon from '@/components/icon/AvatarIcon'
import { getPriceString } from '@/utils/string'
import AvatarChip from '../icon/AvatarChip'
import QuickJournalEditor from './QuickJournalEditor'
import { Flag, LocalOffer } from '@mui/icons-material'
import { JournalContext } from '@/contexts/JournalContext'
import { PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO } from '@/constants/journal'
import { calculateNetAmount, journalEntryHasTags, journalEntryIsFlagged } from '@/utils/journal'
import { useGetPriceStyle } from '@/hooks/useGetPriceStyle'
import { JournalEntryContext } from '@/contexts/JournalEntryContext'
import clsx from 'clsx'

interface JournalTableRowProps extends TableRowProps {
	dateRow?: boolean
	buttonRow?: boolean
	border?: boolean
}

const TableRow = ({ sx, dateRow, buttonRow, border, ...rest }: JournalTableRowProps) => {
	return (
	  <MuiTableRow
		hover={!dateRow && !buttonRow}
		sx={{
			'& td': {
		  		...(dateRow || buttonRow ? {
					cursor: 'default',
				} : {}),
				...(dateRow ? {
					// verticalAlign: 'top',
					width: '0%',
				} : {}),
				...(!border ? {
					// border: 0,
				} : {})
			},
		  userSelect: 'none',
		  cursor: 'pointer',
		  ...sx,
		}}
		{...rest}
	  />
	);
  };

interface JournalTableCellProps extends Omit<TableCellProps, 'colSpan'> {
	selectCheckbox?: boolean
	colSpan?: string | number
}

const TableCell = (props: JournalTableCellProps) => {
	const { sx, className, colSpan, selectCheckbox, ...rest } = props

	return (
		<MuiTableCell
			{...rest}
			colSpan={colSpan as number}
			className={clsx(
				className,
				{
					'--selectCheckbox': selectCheckbox,
				}
			)}
			sx={{
				border: 0,
				alignItems: 'center',
				px: 1,
				'&.--selectCheckbox': {
					borderTopLeftRadius: '64px',
					borderBottomLeftRadius: '64px',
					overflow: 'hidden',
					position: 'relative',

					'&::after': {
						position: 'absolute',
						inset: 0,
						borderBottomWidth: '1px',
						borderBottomStyle: 'solid',
						borderImage: `linear-gradient(
							to right,
							rgba(0,0,0,0),
							red
						) 1 100%
						`,
					},
				},
				...sx,
			}}
		/>
	)
}

type JournalTableBodyProps = TableBodyProps

const TableBody = (props: JournalTableBodyProps) => {
	const { sx, ...rest } = props

	return (
		<MuiTableBody
			{...rest}
			sx={(theme) => ({
				borderBottom: `1px solid ${theme.palette.divider}`,
				'&::before, &::after': {
					content: `""`,
					display: 'table-row',
					height: theme.spacing(1)
				},
				...sx as any
			})}
		/>
	)
}

interface JournalEntryDateProps {
	day: dayjs.Dayjs
	isToday: boolean
	onClick?: () => void
}

const JournalEntryDate = (props: JournalEntryDateProps) => {
	const { day, isToday, onClick } = props
	// const theme = useTheme();
	// const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Stack
			component={Button}
			onClick={onClick}
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
				my: 0,
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
				sx={(theme) => ({ height: theme.spacing(3.5), lineHeight: theme.spacing(3.5), width: '7ch' })}
				variant="overline"
				color={isToday ? 'primary' : undefined}>
				{day.format('MMM')},&nbsp;{day.format('ddd')}
			</Typography>
		</Stack>
	)
}

interface JournalEntryListProps {
	journalRecordGroups: Record<string, JournalEntry[]>
	onClickListItem: (event: any, entry: JournalEntry) => void
	onDoubleClickListItem: (event: any, entry: JournalEntry) => void
}

export default function JournalEntryList(props: JournalEntryListProps) {
	const theme = useTheme()
	const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
	const { getCategoriesQuery, createJournalEntry } = useContext(JournalContext)
	const journalEntryContext = useContext(JournalEntryContext)
	const getPriceStyle = useGetPriceStyle()


	const currentDayString = useMemo(() => dayjs().format('YYYY-MM-DD'), [])

	const displayedJournalDates: Set<string> = new Set(Object.keys(props.journalRecordGroups))

	if (journalEntryContext.view === 'month') {
		if (dayjs(journalEntryContext.date).isSame(currentDayString, 'month')) {
			displayedJournalDates.add(currentDayString)
		} else {
			displayedJournalDates.add(dayjs(journalEntryContext.date).startOf('month').format('YYYY-MM-DD'))
		}
	}

	return (
		<Table size="small">
			{Array.from(displayedJournalDates)
				.sort(([dateA, _a], [dateB, _b]) => {
					return new Date(dateA).getTime() - new Date(dateB).getTime()
				})
				.map((date: string) => {
					const entries = props.journalRecordGroups[date] ?? []
					const day = dayjs(date)
					const isToday = day.isSame(dayjs(), 'day')
					const showQuckEditor = isToday || !entries.length

					return (
						<TableBody key={date}>
							<TableRow dateRow border sx={{ verticalAlign: entries.length > 1 ? 'top' : undefined }}>
								<TableCell rowSpan={entries.length + (showQuckEditor ? 2 : 1)}>
									<JournalEntryDate
										day={day}
										isToday={isToday}
										onClick={() => createJournalEntry(day.format('YYYY-MM-DD'))}
									/>
								</TableCell>
							</TableRow>
							
							{entries.map((entry, index) => {
								const { categoryIds } = entry
								const categoryId: string | undefined = categoryIds?.[0]
								const category: Category | undefined = categoryId
									? getCategoriesQuery.data[categoryId]
									: undefined
								const netAmount = calculateNetAmount(entry)
								const isFlagged = journalEntryIsFlagged(entry)
								const hasTags = journalEntryHasTags(entry)

								return (
									<TableRow
										border={index === entries.length - 1 && !showQuckEditor}
										key={entry._id}
										onClick={(event) => props.onClickListItem(event, entry)}
										onDoubleClick={(event) => props.onDoubleClickListItem(event, entry)}
									>
										{/* {index === 0 && (
											<TableCell rowSpan={entries.length} dateCell>
												<JournalEntryDate
													day={day}
													isToday={isToday}
													onClick={() => createJournalEntry(day.format('YYYY-MM-DD'))}
												/>
											</TableCell>
										)} */}
										<TableCell sx={{ width: '0%' }} selectCheckbox>
											<Checkbox
												sx={{ m: -1 }}
												icon={<AvatarIcon avatar={category?.avatar} />}
											/>
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
											<Typography sx={{ ...getPriceStyle(netAmount) }}>
												{getPriceString(netAmount)}
											</Typography>
										</TableCell>
										<TableCell>
											{category ? (
												<AvatarChip avatar={category.avatar} label={category.label} />
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
										
							{showQuckEditor && (
								<TableRow border buttonRow>
									<TableCell colSpan="100%">
										<QuickJournalEditor onAdd={isSmall ? () => {} : undefined} />
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					)
				})
			}
		</Table>
	)
}
