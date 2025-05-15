import { MouseEvent, useContext, useEffect, useMemo, useState } from 'react'
import { Box, Collapse, Divider, Paper, Stack } from '@mui/material'
import JournalHeader from './ribbon/JournalHeader'
import JournalEntryCard from './JournalEntryCard'
import { deleteJournalEntry } from '@/database/actions'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import JournalEntryList from './JournalEntryList'
import { JournalContext } from '@/contexts/JournalContext'
import { JournalSliceContext } from '@/contexts/JournalSliceContext'
import { getDatabaseClient } from '@/database/client'
import SpendChart from '../chart/SpendChart'
import CategorySpreadChart from '../chart/CategorySpreadChart'
import { useSearch } from '@tanstack/react-router'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { useBeginEditingJournalEntry } from '@/store/app/useJournalEntryEditModalState'

export interface JournalEntrySelection {
	entry: JournalEntry | null
	anchorEl: HTMLElement | null
}

export default function JournalEditor() {
	const [selectedEntry, setSelectedEntry] = useState<JournalEntrySelection>({
		entry: null,
		anchorEl: null,
	})

	const { snackbar } = useContext(NotificationsContext)
	const journalContext = useContext(JournalContext)
	const journalSliceContext = useContext(JournalSliceContext)

	const beginEditingJournalEntry = useBeginEditingJournalEntry()

	const { tab } = useSearch({ from: '/_mainLayout/journal/$view/$' })

	const journalGroups: Record<string, JournalEntry[]> = useMemo(() => {
		const entries: Record<string, JournalEntry> = {
			...journalSliceContext.getJournalEntriesQuery.data,
			// ...journalSliceContext.getTentativeJournalEntryRecurrencesQuery.data,
		}
		const groups = Object.values(entries).reduce(
			(acc: Record<JournalEntry['_id'], JournalEntry[]>, entry: JournalEntry) => {
				const { date } = entry
				if (!date) {
					return acc
				}
				if (acc[date]) {
					acc[date].push(entry)
				} else {
					acc[date] = [entry]
				}

				return acc
			}, {}
		)

		return groups
	}, [
		journalSliceContext.getJournalEntriesQuery.data,
		// journalSliceContext.getTentativeJournalEntryRecurrencesQuery.data,
	])

	const handleClickListItem = (event: MouseEvent<any>, entry: JournalEntry) => {
		setSelectedEntry({
			anchorEl: event.currentTarget,
			entry: entry,
		})
	}

	const handleDoubleClickListItem = (_event: MouseEvent<any>, entry: JournalEntry) => {
		beginEditingJournalEntry(entry)
	}

	const handleDeselectListItem = () => {
		setSelectedEntry((prev) => {
			const next = {
				...prev,
				anchorEl: null,
			}
			return next
		})
	}

	const handleDeleteEntry = async (entry: JournalEntry | null) => {
		if (!entry) {
			return
		}

		try {
			await deleteJournalEntry(entry._id)
			journalSliceContext.refetchAllDependantQueries()
			handleDeselectListItem()
			snackbar({
				message: 'Deleted 1 entry',
				action: {
					label: 'Undo',
					onClick: async () => {
						// undeleteJournalEntry(record)
						// 	.then(() => {
						// 		journalContext.getCategoriesQuery.refetch()
						// 		snackbar({ message: 'Category restored' })
						// 	})
						// 	.catch((error) => {
						// 		console.error(error)
						// 		snackbar({ message: 'Failed to restore category: ' + error.message })
						// 	})
					},
				},
			})
		} catch {
			snackbar({ message: 'Failed to delete entry' })
		}
	}

	// show all docs
	useEffect(() => {
		const db = getDatabaseClient()
	    db.allDocs({ include_docs: true }).then((result) => {
	        console.log('all docs', result);
	    })
	}, []);

	return (
		<>
			{selectedEntry.entry && (
				<JournalEntryCard
					entry={selectedEntry.entry}
					anchorEl={selectedEntry.anchorEl}
					onClose={() => handleDeselectListItem()}
					onDelete={() => handleDeleteEntry(selectedEntry.entry)}
				/>
			)}
			<Stack direction="row" sx={{ gap: 2, overflow: 'hidden', flex: 1, pr: 2, pb: { sm: 0, md: 2 } }}>
				<Stack
					sx={{
						overflow: 'hidden',
						flex: 2,
						gap: 0,
					}}
				>
					{/* <Grid columns={12} container>
						<Grid size={4}> */}
					<Collapse in={false}>
						<Stack direction='row' gap={2} mb={2}>
							<SpendChart />
							<CategorySpreadChart />
						</Stack>
					</Collapse>
						{/* </Grid>
					</Grid> */}
					
					<Stack
						component={Paper}
						sx={(theme) => ({
							flex: 1,
							borderTopLeftRadius: theme.spacing(2),
							borderTopRightRadius: theme.spacing(2),
							borderBottomLeftRadius: { sm: 0, md: theme.spacing(2) },
							borderBottomRightRadius: { sm: 0, md: theme.spacing(2) },
							overflow: 'hidden',
						})}
					>
						<JournalHeader />
						<Divider />
						<Box sx={{
							flex: 1,
							overflowY: 'auto',
						}}>
							<JournalEntryList
								journalRecordGroups={tab === 'journal' ? journalGroups : {}}
								onClickListItem={handleClickListItem}
								onDoubleClickListItem={handleDoubleClickListItem}
							/>
							<Stack component='footer'></Stack>
						</Box>
					</Stack>
				</Stack>
				{/* <Stack
					component={Paper}
					sx={(theme) => ({
						borderTopLeftRadius: theme.spacing(2),
						borderTopRightRadius: theme.spacing(2),
						overflow: 'hidden',
						flex: 1,
					})}>
					<Stack component='header'>
						<Stack
							direction="row"
							justifyContent="space-between"
							sx={{ flex: 0, py: 1, px: 2 }}
							alignItems="center"
							gap={1}
						>
							<Typography>Analysis</Typography>
							<IconButton><Close /></IconButton>
						</Stack>
					</Stack>
					<Divider />
					<Box sx={{
						flex: 1,
						overflowY: 'auto',
					}}>
						
					</Box>
				</Stack> */}
				
			</Stack>
		</>
	)
}
