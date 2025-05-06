import { Button, Checkbox, Grid2 as Grid, Grow, IconButton, Link, Stack, TextField, Typography } from "@mui/material"
import AmountField from "../input/AmountField"
import CategoryAutocomplete from "../input/CategoryAutocomplete"
import { Add, DeleteOutline, EditNote, LocalOffer, LocalOfferOutlined } from "@mui/icons-material"
import { useCallback, useContext, useRef, useState } from "react"
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form"
import SelectionActionModal from "../modal/SelectionActionModal"
import { JournalContext } from "@/contexts/JournalContext"
import { makeJournalEntry } from "@/utils/journal"
import { EntryTagPicker } from "../pickers/EntryTagPicker"
import { JournalEntry } from "@/schema/documents/JournalEntry"
import { StatusVariant } from "@/schema/models/EntryStatus"

export default function ChildJournalEntryForm() {
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [journalEntriesWithMemos, setJournalEntriesWithMemos] = useState<string[]>([])
    const selectionMenuAnchorRef = useRef<HTMLDivElement>(null);
    const journalContext = useContext(JournalContext)
    const [childEntryTaggingIndex, setChildEntryTaggingIndex] = useState<number>(-1)
    const [childEntryTaggingAnchorEl, setChildEntryTaggingAnchorEl] = useState<HTMLElement | null>(null)
    
    const { control, setValue, watch } = useFormContext<JournalEntry>()
    const children = useWatch({ control, name: 'children' }) ?? []
    const childEntriesFieldArray = useFieldArray({
        control,
        name: 'children',
    })

    const handleAddChildEntry = useCallback(() => {
        if (!journalContext.journal) {
            return
        }
        const newEntry: JournalEntry = makeJournalEntry({}, journalContext.journal._id)
        childEntriesFieldArray.prepend(newEntry)
    }, [children])

    const handleToggleSelected = (key: string) => {
        const isSelected = selectedRows.includes(key)
        if (isSelected) {
            setSelectedRows(selectedRows.filter((id) => id !== key))
        } else {
            setSelectedRows([...selectedRows, key])
        }
    }

    const handleRemoveChildEntries = (entryIds: string[]) => {
        const indices = entryIds.map((entryId) => childEntriesFieldArray.fields.findIndex((entry) => entry._id === entryId))
        if (indices.includes(childEntryTaggingIndex)) {
            setChildEntryTaggingAnchorEl(null)
        }
        childEntriesFieldArray.remove(indices)
        setSelectedRows(selectedRows.filter((id) => !entryIds.includes(id)))
    }

    const handleSelectAll = () => {    
        setSelectedRows(childEntriesFieldArray.fields.map((entry) => entry._id))
    }

    const handleDeselectAll = () => {
        setSelectedRows([])
    }

    const handleDeleteSelectedChildren = () => {
        handleRemoveChildEntries(selectedRows)
    }

    return (
        <>
            <SelectionActionModal
                anchorEl={selectionMenuAnchorRef.current}
                open={selectedRows.length > 0}
                numSelected={selectedRows.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                numTotalSelectable={childEntriesFieldArray.fields.length}
                actions={{
                    onDelete: handleDeleteSelectedChildren
                }}
            />

            <EntryTagPicker
                open={Boolean(childEntryTaggingAnchorEl)}
                anchorEl={childEntryTaggingAnchorEl}
                onClose={() => {
                    setChildEntryTaggingAnchorEl(null)
                    setChildEntryTaggingIndex(-1)
                }}
                value={(childEntryTaggingIndex >= 0 && children[childEntryTaggingIndex])
                    ? children[childEntryTaggingIndex].tagIds
                    : undefined
                }
                onChange={(_event, newValue) => {
                    if (childEntryTaggingIndex < 0) {
                        return
                    }
                    setValue(`children.${childEntryTaggingIndex}.tagIds`, newValue ?? [], { shouldDirty: true })
                }}
            />

            <Stack direction='row' alignItems={'center'} justifyContent={'space-between'} mt={4} mx={-2} px={2} ref={selectionMenuAnchorRef}>
                <Typography>Sub-Entries ({children.length})</Typography>
                <Button onClick={() => handleAddChildEntry()} startIcon={<Add />}>Add Row</Button>
            </Stack>
            {children.length === 0 && (
                <Typography variant='body2' color='textSecondary'>
                    No sub-entries. <Link onClick={() => handleAddChildEntry()}>Click to add one.</Link>
                </Typography>
            )}
            <Stack mt={2} mx={-1} gap={2}>
                {childEntriesFieldArray.fields.map((entry, index) => {
                    const childEntryId: string = watch(`children.${index}._id`)
                    const childStatusIds = watch(`children.${index}.statusIds`) ?? []
                    const childTagIds = watch(`children.${index}.tagIds`) ?? []
                    const isTagged = childTagIds.length > 0
                    const isApproximate = childStatusIds.some((status) => status === StatusVariant.enum.APPROXIMATE)
                    const hasMemo = journalEntriesWithMemos.includes(entry._id) || Boolean(entry.memo)
                    
                    return (
                        <Stack
                            direction='row'
                            alignItems={'flex-start'}
                            sx={{ width: '100%' }}
                            key={entry._id}
                            data-journalEntryId={childEntryId}
                        >
                            <Checkbox
                                checked={selectedRows.includes(entry._id)}
                                onChange={() => handleToggleSelected(entry._id)}
                            />
                            <Grid container columns={12} spacing={1} sx={{ flex: '1' }}>
                                <Grid size={4}>
                                    <div>Amount...</div>
                                    {/* <Controller
                                        control={control}
                                        name={`children.${index}.amount`}
                                        render={({ field }) => (
                                            <AmountField
                                                {...field}
                                                size="small"
                                                approximate={isApproximate}
                                            />
                                        )}
                                    /> */}
                                </Grid>
                                <Grid size={'grow'}>
                                    <CategoryAutocomplete
                                        size='small'
                                        value={entry.categoryId}
                                        onChange={(_event, newValue: string | string[] | null) => {
                                            if (!Array.isArray(newValue)) {
                                                childEntriesFieldArray.update(index, { ...entry, categoryId: newValue ?? undefined })
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid size='auto'>
                                    <Stack direction='row' spacing={-1} ml={-1}>
                                        <IconButton
                                            onClick={(event) => {
                                                setChildEntryTaggingIndex(index)
                                                setChildEntryTaggingAnchorEl(event.currentTarget)
                                            }}
                                        >
                                            {isTagged ? <LocalOffer /> : <LocalOfferOutlined />}
                                        </IconButton>
                                        <IconButton onClick={() => handleRemoveChildEntries([entry._id])}>
                                            <DeleteOutline />
                                        </IconButton>
                                    </Stack>
                                </Grid>
                                <Grid size={12}>
                                    {hasMemo ? (
                                        <Grow in>
                                            <div>
                                                <Controller
                                                    control={control}
                                                    name={`children.${index}.memo`}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            size="small"
                                                            label='Memo'
                                                            fullWidth
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </Grow>
                                    ) : (
                                        <Button
                                            component='a'
                                            onClick={() => setJournalEntriesWithMemos([...journalEntriesWithMemos, entry._id])}
                                            sx={(theme) => ({
                                                mx: -1,
                                                my: -1,
                                                display: 'flex',
                                                justifyContent: 'flex-start',
                                                gap: 1,
                                                alignItems: 'center',
                                                width: '100%',
                                                textAlign: 'left',
                                                color: theme.palette.text.secondary,
                                                '&:hover, &:focus, &:focus-within, &.--open': {
                                                    color: theme.palette.primary.main
                                                },
                                                background: 'none',
                                            })}
                                            disableRipple
                                            tabIndex={-1}
                                        >
                                            <EditNote />
                                            <Typography component='span' variant='body2' sx={{ fontWeight: 500 }}>Add a memo</Typography>
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>
                        </Stack>
                    )
                })}
            </Stack>
        </>
    )
}
