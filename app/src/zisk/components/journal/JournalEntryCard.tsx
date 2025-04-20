import { Close, Delete, Edit, MoreVert } from '@mui/icons-material'
import { Box, ClickAwayListener, Fade, IconButton, Paper, Popper, Stack, Typography } from '@mui/material'
import AvatarIcon from '@/components/icon/AvatarIcon'
import { useContext } from 'react'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { getPriceString } from '@/utils/string'
import { Category, JOURNAL_ENTRY, NonspecificEntry, TRANSFER_ENTRY } from '@/types/schema'
import { JournalEntrySelection } from './JournalEditor'
import { JournalContext } from '@/contexts/JournalContext'
import { PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO } from '@/constants/journal'
import { calculateNetAmount } from '@/utils/journal'
import { useGetPriceStyle } from '@/hooks/useGetPriceStyle'

export const JOURNAL_ENTRY_LOUPE_SEARCH_PARAM_KEY = 'z'

interface JournalEntryCardProps extends JournalEntrySelection {
	entry: NonspecificEntry
	onClose: () => void
	onDelete: () => void
}

const JournalEntryNumber = (props: { value: string | number | null | undefined }) => {
	const { snackbar } = useContext(NotificationsContext)

	const entryNumber = Number(props.value ?? 0)
	const entryNumberString = `#${entryNumber}`
	const entryLink = `?${JOURNAL_ENTRY_LOUPE_SEARCH_PARAM_KEY}=${entryNumber}`

	const copyText = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		e.preventDefault() // Prevent the default anchor tag behavior
		if (typeof window === 'undefined') {
			return
		}
		window?.navigator?.clipboard
			.writeText(entryNumberString)
			.then(() => {
				snackbar({ message: 'Copied to clipboard.' })
			})
			.catch((err) => {
				console.error('Failed to copy journal entry number to clipboard: ', err)
			})
	}

	if (!entryNumber) {
		return <></>
	}

	return (
		<a onClick={copyText} href={entryLink} style={{ textDecoration: 'none' }}>
			<Typography variant="button">{entryNumberString}</Typography>
		</a>
	)
}

export default function JournalEntryCard(props: JournalEntryCardProps) {
	const { entry, anchorEl } = props
	const { getCategoriesQuery, editJournalEntry } = useContext(JournalContext)

	const getPriceStyle = useGetPriceStyle()

	const netAmount = calculateNetAmount(entry)
	const categoryId: string | undefined = entry?.categoryId
	const category: Category | undefined = categoryId ? getCategoriesQuery.data[categoryId] : undefined
	const memo = entry?.memo || PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO

	const handleDeleteEntry = () => {
		props.onDelete()
	}

	const handleEditJournalEntry = (entry: NonspecificEntry) => {
		if (entry.kind === JOURNAL_ENTRY.value || entry.kind === TRANSFER_ENTRY.value) {
			editJournalEntry(entry)
		} else {
			// TODO could add logic for editing a tentative entry?
		}
		props.onClose()
	}

	return (
		<Popper
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			// onClose={props.onClose}
			// anchorOrigin={{
			// 	vertical: 'top',
			// 	horizontal: 'center',
			// }}
			// transformOrigin={{
			// 	vertical: 'top',
			// 	horizontal: 'center',
			// }}
			transition
		>
			{({ TransitionProps }) => (
				<ClickAwayListener onClickAway={props.onClose}>
					<Fade {...TransitionProps} timeout={350}>
						<Paper>
							<Stack gap={2} sx={{ minWidth: '400px' }}>
								<Box p={1} mb={2}>
									<Stack direction="row" justifyContent="space-between" alignItems={'center'} sx={{ mb: 2 }}>
										<Box px={1}>
											<JournalEntryNumber value={null} />
										</Box>
										<Stack direction="row" gap={0.5}>
											<IconButton size="small" onClick={() => handleEditJournalEntry(entry)}>
												<Edit fontSize="small" />
											</IconButton>

											<IconButton type="submit" size="small" onClick={() => handleDeleteEntry()}>
												<Delete fontSize="small" />
											</IconButton>

											<IconButton size="small">
												<MoreVert fontSize="small" />
											</IconButton>

											<IconButton size="small" sx={{ ml: 1 }} onClick={() => props.onClose()}>
												<Close fontSize="small" />
											</IconButton>
										</Stack>
									</Stack>
									<Stack sx={{ textAlign: 'center' }} alignItems="center">
										<Typography
											variant="h3"
											sx={{
												...getPriceStyle(netAmount),
												mb: 0.5,
											}}>
											{getPriceString(netAmount)}
										</Typography>
										<Stack direction="row" gap={1}>
											<AvatarIcon avatar={category?.avatar} />
											<Typography>{memo}</Typography>
										</Stack>
									</Stack>
								</Box>
								{/* <Paper square variant='outlined' sx={{ p: 2, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
									Hello
								</Paper> */}
							</Stack>
						</Paper>
					</Fade>
				</ClickAwayListener>
			)}
		</Popper>
	)
}
