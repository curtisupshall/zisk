import { JournalEntry } from "@/schema/documents/JournalEntry"
import { EditNote } from "@mui/icons-material"
import { Button, FormHelperText, Grow, Link, Stack, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"

export default function EntryNoteForm() {
    const { control, setValue } = useFormContext<JournalEntry>()
    const notes = useWatch({ control, name: 'notes' })
    const [hasNotes, setHasNotes] = useState<boolean>(Boolean(notes))

    const handleAddNote = () => {
        setHasNotes(true)
        setValue('notes', '')
    }

    const handleRemoveNotes = () => {
        setHasNotes(false)
        setValue('notes', '')
    }

    if (!hasNotes) {
        return (
            <Button
                component='a'
                onClick={() => handleAddNote()}
                sx={(theme) => ({
                    mx: -1,
                    mt: -2,
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: 1,
                    alignItems: 'center',
                    width: '100%',
                    textAlign: 'left',
                    color: 'inherit',
                    '&:hover, &:focus, &:focus-within, &.--open': {
                        color: theme.palette.primary.main
                    },
                    background: 'none',
                })}
                disableRipple
                tabIndex={-1}
            >
                <EditNote />
                <Typography component='span' variant='body2' sx={{ fontWeight: 500 }}>Add a note</Typography>
            </Button>
        )
    }

    return (
        <Grow in>
            <Stack mt={-1}>
                <Controller
                    name='notes'
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label='Notes'
                            variant='filled'
                            slotProps={{
                                inputLabel: { shrink: true },
                            }}
                            autoFocus
                            multiline
                            rows={4}
                        />
                    )}
                />
                <FormHelperText sx={{ ml: 0 }}>
                    <Link
                        onClick={() => handleRemoveNotes()}
                        sx={{ ml: 0, color: 'inherit' }}
                    >
                        Remove
                    </Link>
                </FormHelperText>
            </Stack>
        </Grow>
    )
}
