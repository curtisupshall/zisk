import { DialogContent, DialogTitle, Grow, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import JournalEntryForm from '../form/JournalEntryForm'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useCallback, useContext, useEffect } from 'react'
import { NotificationsContext } from '@/contexts/NotificationsContext'
import { JournalContext } from '@/contexts/JournalContext'
import DetailsDrawer from '../layout/DetailsDrawer'
import AvatarIcon from '../icon/AvatarIcon'
import { deleteJournalEntry, updateJournalEntry } from '@/database/actions'
import { PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO } from '@/constants/journal'
import { useDebounce } from '@/hooks/useDebounce'
import useUnsavedChangesWarning from '@/hooks/useUnsavedChangesWarning'
import { useQueryClient } from '@tanstack/react-query'
import { Delete, Flag, LocalOffer, Pending, Update } from '@mui/icons-material'
import { enumerateJournalEntryStatuses, journalEntryHasTags, journalEntryHasTasks } from '@/utils/journal'
import useKeyboardAction from '@/hooks/useKeyboardAction'
import { KeyboardActionName } from '@/constants/keyboard'
import { StatusVariant } from '@/schema/models/EntryStatus'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { Category } from '@/schema/documents/Category'
import { useCategories } from '@/store/orm/categories'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBeginEditingJournalEntry, useCloseEntryEditModal, useEntryEditModalInitialValues, useEntryEditModalOpen, useOpenEntryEditModalForCreate } from '@/store/app/useJournalEntryEditModalState'

export default function JournalEntryModal() {
	const { snackbar } = useContext(NotificationsContext)

	const beginEditingJournalEntry = useBeginEditingJournalEntry()
	const closeEntryEditModal = useCloseEntryEditModal()
	const openEntryEditModalForCreate = useOpenEntryEditModalForCreate()
	const entryEditModalOpen = useEntryEditModalOpen()
	const entryEditModalInitialValues = useEntryEditModalInitialValues()

	const categories = useCategories()

	const { activeJournal } = useContext(JournalContext)

	const journalEntryForm = useForm<JournalEntry>({
		defaultValues: {},
		resolver: zodResolver(JournalEntry),
	})
	
	const { disableUnsavedChangesWarning, enableUnsavedChangesWarning } = useUnsavedChangesWarning()

	const handleSaveFormWithCurrentValues = useCallback(async () => {
		if (!activeJournal) {
			return Promise.resolve()
		}
		const formData: JournalEntry = journalEntryForm.getValues()
		return updateJournalEntry(formData)
			.then(() => {
				console.log('Put journal entry.', formData)
				// disableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
			})
			.catch((error: any) => {
				console.error(error)
				snackbar({ message: 'Failed to update journal entry' })
			})
	}, [activeJournal]);

	const currentFormState = useWatch({ control: journalEntryForm.control })

	const children = useWatch({ control: journalEntryForm.control, name: 'children' }) ?? []
	const memo = currentFormState.memo ?? ''
	const categoryId = useWatch({ control: journalEntryForm.control, name: 'categoryId' })
	const category: Category | undefined = categoryId ? categories[categoryId] : undefined

	const hasTags = journalEntryHasTags(currentFormState as JournalEntry)
	const childHasTags = children.some((child) => journalEntryHasTags(child as JournalEntry))

	// Reserved Tags
	const { parent: parentReservedTags, children: childReservedTags }
		= enumerateJournalEntryStatuses(currentFormState as JournalEntry)

	const isFlagged = parentReservedTags.has(StatusVariant.enum.FLAGGED)
	const isApproximate = parentReservedTags.has(StatusVariant.enum.APPROXIMATE)
	const isPending = parentReservedTags.has(StatusVariant.enum.PENDING)

	const childIsFlagged = childReservedTags.has(StatusVariant.enum.FLAGGED)
	const childIsApproximate = childReservedTags.has(StatusVariant.enum.APPROXIMATE)
	const childIsPending = childReservedTags.has(StatusVariant.enum.PENDING)


	const handleClose = () => {
		closeEntryEditModal()
		// if (!journalEntryForm.formState.isDirty) {
		// 	return
		// }
		// flushSaveFormDebounce()
		// handleSaveFormWithCurrentValues().then(() => {
		// 	refreshJournalEntriesQuery()
		// 	refreshTransferEntriesQuery()
		// 	snackbar({ message: 'Saved entry.' })
		// 	disableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
		// })
		throw new Error("Saving journal entries isn't implemented!")
	}

	const handleDelete = useCallback(async () => {
		const formData: JournalEntry = journalEntryForm.getValues()
		// deleteJournalEntry(formData._id).then(() => {
		// 	refreshJournalEntriesQuery()
		// 	refreshTransferEntriesQuery()
		// 	snackbar({ message: 'Deleted journal entry.' })
		// 	disableUnsavedChangesWarning(JOURNAL_ENTRY_UNSAVED_CHANGES_WARNING_KEY)
		// 	props.onClose()
		// }).catch((error: any) => {
		// 	console.error(error)
		// 	snackbar({ message: 'Failed to delete journal entry' })
		// })
		throw new Error("Delete journal entires isn't implemented!")
	}, [activeJournal])

	const toggleEntryStatus = (entryId: string | null, status: StatusVariant) => {
		const formData: JournalEntry = journalEntryForm.getValues()

		let name: 'statusIds' | `children.${number}.statusIds`
		let existingStatuses: StatusVariant[] = []
		if (!entryId || entryId === formData._id) {
			// If no particular entry/child is targeted, target the root entry
			entryId = formData._id
			name = 'statusIds'
			existingStatuses = formData.statusIds ?? []
		} else {
			const childrenIds = formData.children?.map((child) => child._id) ?? []
			const childIndex: number = childrenIds.findIndex((childId) => childId === entryId)
			name = `children.${childIndex}.statusIds`
			existingStatuses = formData.children?.[childIndex]?.statusIds ?? []
		}

		let newStatuses: StatusVariant[]
		if (existingStatuses.includes(status)) {
			newStatuses = existingStatuses.filter((s) => s !== status)
		} else {
			newStatuses = [...existingStatuses, status]
		}

		journalEntryForm.setValue(name, newStatuses, { shouldDirty: true })
	}

	const handleEntryStatusKeyboardAction = (event: KeyboardEvent, status: StatusVariant) => {
		const target = event.target as HTMLElement
		const journalEntryIdElement = target.closest("[data-journalentryid]");
		let journalEntryId: string | null = null
		if (journalEntryIdElement) {
			journalEntryId = journalEntryIdElement.getAttribute("data-journalentryid");
		}
		toggleEntryStatus(journalEntryId, status)
	}

	useKeyboardAction(KeyboardActionName.TOGGLE_JOURNAL_ENTRY_APPROXIMATE_RESERVED_TAG, (event) => {
		handleEntryStatusKeyboardAction(event, StatusVariant.enum.APPROXIMATE)
	}, { ignoredByEditableTargets: false })

	useKeyboardAction(KeyboardActionName.TOGGLE_JOURNAL_ENTRY_PENDING_RESERVED_TAG, (event) => {
		handleEntryStatusKeyboardAction(event, StatusVariant.enum.PENDING)
	}, { ignoredByEditableTargets: false })

	useKeyboardAction(KeyboardActionName.TOGGLE_JOURNAL_ENTRY_FLAGGED_RESERVED_TAG, (event) => {
		handleEntryStatusKeyboardAction(event, StatusVariant.enum.FLAGGED)
	}, { ignoredByEditableTargets: false })

	return (
		<FormProvider {...journalEntryForm}>
			<DetailsDrawer
				open={entryEditModalOpen}
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
