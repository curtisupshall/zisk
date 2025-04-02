import { DialogContent, DialogTitle, Grow, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import JournalEntryForm from '../form/JournalEntryForm'
import { FormProvider, useWatch } from 'react-hook-form'
import { useCallback, useContext, useEffect } from 'react'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { Category, JournalEntry, ReservedTagKey, TransferEntry } from '@/types/schema'
import { JournalContext } from '@/contexts/JournalContext'
import DetailsDrawer from '../layout/DetailsDrawer'
import AvatarIcon from '../icon/AvatarIcon'
import { deleteJournalOrTransferEntry, updateJournalOrTransferEntry } from '@/database/actions'
import { PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO } from '@/constants/journal'
import { useDebounce } from '@/hooks/useDebounce'
import useUnsavedChangesWarning from '@/hooks/useUnsavedChangesWarning'
import { useQueryClient } from '@tanstack/react-query'
import { Delete, Flag, LocalOffer, Pending, Update } from '@mui/icons-material'
import { enumerateJournalEntryReservedTag, journalEntryHasUserDefinedTags, journalOrTransferEntryIsTransferEntry } from '@/utils/journal'
import useKeyboardAction from '@/hooks/useKeyboardAction'
import { KeyboardActionName } from '@/constants/keyboard'
import { RESERVED_TAGS } from '@/constants/tags'

interface EditJournalEntryModalProps {
	open: boolean
	onClose: () => void
}

const JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY = 'JOURNAL_ENTRY'

export default function JournalEntryModal(props: EditJournalEntryModalProps) {
	const { snackbar } = useContext(NotificationsContext)
	const { journal, journalEntryForm, getCategoriesQuery } = useContext(JournalContext)
	const queryClient = useQueryClient()
	const { disableUnsavedChangesWarning, enableUnsavedChangesWarning } = useUnsavedChangesWarning()

	const handleSaveFormWithCurrentValues = useCallback(async () => {
		if (!journal) {
			return Promise.resolve()
		}
		const formData: JournalEntry | TransferEntry = journalEntryForm.getValues()
		return updateJournalOrTransferEntry(formData)
			.then(() => {
				console.log('Put journal entry.', formData)
				disableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
			})
			.catch((error: any) => {
				console.error(error)
				snackbar({ message: 'Failed to update journal entry' })
			})
	}, [journal]);

	const currentFormState = useWatch({ control: journalEntryForm.control })

	const children = useWatch({ control: journalEntryForm.control, name: 'children' }) ?? []
	const memo = currentFormState.memo ?? ''
	const categoryId = useWatch({ control: journalEntryForm.control, name: 'categoryId' })
	const category: Category | undefined = categoryId ? getCategoriesQuery.data[categoryId] : undefined

	const hasTags = journalEntryHasUserDefinedTags(currentFormState as JournalEntry)
	const childHasTags = children.some(journalEntryHasUserDefinedTags)

	// Reserved Tags
	const { parent: parentReservedTags, children: childReservedTags }
		= enumerateJournalEntryReservedTag(currentFormState as JournalEntry)

	const isFlagged = parentReservedTags.has(ReservedTagKey.Enum.FLAGGED)
	const isApproximate = parentReservedTags.has(ReservedTagKey.Enum.APPROXIMATE)
	const isPending = parentReservedTags.has(ReservedTagKey.Enum.PENDING)

	const childIsFlagged = childReservedTags.has(ReservedTagKey.Enum.FLAGGED)
	const childIsApproximate = childReservedTags.has(ReservedTagKey.Enum.APPROXIMATE)
	const childIsPending = childReservedTags.has(ReservedTagKey.Enum.PENDING)

	const [debouncedhandleSaveFormWithCurrentValues, flushSaveFormDebounce] = useDebounce(handleSaveFormWithCurrentValues, 1000)

	const refreshJournalEntriesQuery = () => {
		queryClient.invalidateQueries({ predicate: query => query.queryKey[0] === 'journalEntries' })
	}

	const refreshTransferEntriesQuery = () => {
		queryClient.invalidateQueries({ predicate: query => query.queryKey[0] === 'transferEntries' })
	}

	const handleClose = () => {
		props.onClose();
		if (!journalEntryForm.formState.isDirty) {
			return
		}
		flushSaveFormDebounce()
		handleSaveFormWithCurrentValues().then(() => {
			refreshJournalEntriesQuery()
			refreshTransferEntriesQuery()
			snackbar({ message: 'Saved entry.' })
			disableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
		})
	}

	const handleDelete = useCallback(async () => {
		const formData: JournalEntry | TransferEntry = journalEntryForm.getValues()
		deleteJournalOrTransferEntry(formData._id).then(() => {
			refreshJournalEntriesQuery()
			refreshTransferEntriesQuery()
			snackbar({ message: 'Deleted journal entry.' })
			disableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
			props.onClose()
		}).catch((error: any) => {
			console.error(error)
			snackbar({ message: 'Failed to delete journal entry' })
		})
	}, [journal])

	const toggleReservedTag = (entryId: string | null, reservedTag: ReservedTagKey) => {
		const formData: JournalEntry | TransferEntry = journalEntryForm.getValues()

		let name: 'tagIds' | `children.${number}.tagIds`
		let existingTagIds: string[] = []
		if (!entryId || entryId === formData._id || journalOrTransferEntryIsTransferEntry(formData)) {
			// If no particular entry/child is targeted, target the root entry
			entryId = formData._id
			name = 'tagIds'
			existingTagIds = formData.tagIds ?? []
		} else {
			const childrenIds = (formData as JournalEntry).children?.map((child) => child._id) ?? []
			const childIndex: number = childrenIds.findIndex((childId) => childId === entryId)
			name = `children.${childIndex}.tagIds`
			existingTagIds = formData.children?.[childIndex]?.tagIds ?? []
		}

		let newTags: string[]
		if (existingTagIds.includes(RESERVED_TAGS[reservedTag]._id)) {
			newTags = existingTagIds.filter((tagId) => tagId !== RESERVED_TAGS[reservedTag]._id)
		} else {
			newTags = [...existingTagIds, RESERVED_TAGS[reservedTag]._id]
		}

		journalEntryForm.setValue(name, newTags, { shouldDirty: true })
	}

	const handleReservedTagKeyboardAction = (event: KeyboardEvent, reservedTag: ReservedTagKey) => {
		const target = event.target as HTMLElement
		const journalEntryIdElement = target.closest("[data-journalEntryId]");
		let journalEntryId: string | null = null
		if (journalEntryIdElement) {
			journalEntryId = journalEntryIdElement.getAttribute("data-journalEntryId");
		}
		toggleReservedTag(journalEntryId, reservedTag)
	}

	useKeyboardAction(KeyboardActionName.TOGGLE_JOURNAL_ENTRY_APPROXIMATE_RESERVED_TAG, (event) => {
		handleReservedTagKeyboardAction(event, RESERVED_TAGS.APPROXIMATE._id)
	}, { ignoredByEditableTargets: false })

	useKeyboardAction(KeyboardActionName.TOGGLE_JOURNAL_ENTRY_PENDING_RESERVED_TAG, (event) => {
		handleReservedTagKeyboardAction(event, RESERVED_TAGS.PENDING._id)
	}, { ignoredByEditableTargets: false })

	useKeyboardAction(KeyboardActionName.TOGGLE_JOURNAL_ENTRY_FLAGGED_RESERVED_TAG, (event) => {
		handleReservedTagKeyboardAction(event, RESERVED_TAGS.FLAGGED._id)
	}, { ignoredByEditableTargets: false })

	useEffect(() => {
		if (props.open) {
			// Prevents the user from closing the browser tab with potentially unsaved changes
			enableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
		}
	}, [props.open])

	useEffect(() => {
		if (!journalEntryForm.formState.isDirty) {
			return
		}
		debouncedhandleSaveFormWithCurrentValues()
		enableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
	}, [currentFormState])

	return (
		<FormProvider {...journalEntryForm}>
			<DetailsDrawer
				open={props.open}
				onClose={handleClose}
				actions={
					<>
						<Tooltip title='Delete Entry'>
							<IconButton onClick={() => handleDelete()}>
								<Delete />
							</IconButton>
						</Tooltip>
					</>
				}
			>
				<DialogTitle>
					<Stack direction='row' gap={1} alignItems='center'>
						<AvatarIcon avatar={category?.avatar}/>
						<Typography variant='inherit'>
							{memo.trim() || PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO}
						</Typography>
						<Stack ml={1} direction='row' gap={0.5} alignItems='center'>
							{(isFlagged || childIsFlagged) && (
								<Grow key="FLAGGED" in>									
									<Tooltip title={isFlagged ? 'Flagged' : 'Sub-entry is flagged'}>
										<Flag fontSize='small' sx={{ cursor: 'pointer' }} />
									</Tooltip>
								</Grow>
							)}
							{(hasTags || childHasTags) && (
								<Grow key="TAGS" in>
									<Tooltip title='Tags applied'>
										<LocalOffer fontSize='small' sx={{ cursor: 'pointer' }} />
									</Tooltip>
								</Grow>
							)}
							{(isApproximate || childIsApproximate) && (
								<Grow key="APPROXIMATE" in>
									<Tooltip title={isApproximate ? 'Approximation' : 'Sub-entry is approximation'}>
										<Update fontSize='small' sx={{ cursor: 'pointer' }} />
									</Tooltip>
								</Grow>
							)}
							{(isPending || childIsPending) && (
								<Grow key="PENDING" in>
									<Tooltip title={isApproximate ? 'Pending' : 'Sub-entry is pending'}>
										<Pending fontSize='small' sx={{ cursor: 'pointer' }} />
									</Tooltip>
								</Grow>
							)}
						</Stack>
					</Stack>
				</DialogTitle>
				<DialogContent sx={{ overflow: 'initial' }}>
					<JournalEntryForm />
				</DialogContent>
			</DetailsDrawer>
		</FormProvider>
	)
}
