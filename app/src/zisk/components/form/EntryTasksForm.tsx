import { Button, Checkbox, IconButton, InputBase, Link, Stack, Typography } from "@mui/material"
import { AddTask, CheckCircle, RadioButtonUnchecked } from "@mui/icons-material"
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { useContext, useRef } from "react"
import { JournalContext } from "@/contexts/JournalContext"
import { makeEntryTask } from "@/utils/journal"
import { EntryTask } from "@/schema/models/EntryTask"
import { JournalEntry } from "@/schema/documents/JournalEntry"

export default function EntryTasksForm() {
    const journalContext = useContext(JournalContext)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const { setValue, control } = useFormContext<JournalEntry>()
    const tasks: EntryTask[] | undefined = useWatch({ control, name: 'tasks' })
    const entryTasksFieldArray = useFieldArray({
        control,
        name: 'tasks',
    })

    const handleAddTask = async (focusInput = true) => {
        if (!journalContext.journal) {
            return
        }
        
        const journalId = journalContext.journal._id
        const newTask = makeEntryTask({})
        const newIndex = tasks ? tasks.length : 0

        if (tasks) {
            entryTasksFieldArray.append(newTask)
        } else {
            setValue('tasks', [newTask])
        }

        // Focus the new input after a short delay to ensure the element is rendered
        if (focusInput) {
            setTimeout(() => {
                inputRefs.current[newIndex]?.focus()
            }, 0)
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        const input = event.currentTarget
        const isLastRow = index === (tasks?.length ?? 0) - 1
        
        if (input.value === '') {
            if (event.key === 'Backspace' || (event.key === 'Delete' && !isLastRow)) {
                event.preventDefault()
                entryTasksFieldArray.remove(index)
                
                // Focus the previous input if it exists
                setTimeout(() => {
                    if (index > 0) {
                        inputRefs.current[index - 1]?.focus()
                    }
                }, 0)
            }
        }
        
        if (event.key === 'Enter') {
            event.preventDefault()
            const currentIndex = index
            handleAddTask(false)
            
            // Focus the new input after it's created
            setTimeout(() => {
                inputRefs.current[currentIndex + 1]?.focus()
            }, 0)
        }
    }

    return (
        <Stack gap={0.5}>
            <Button
                component='a'
                onClick={() => handleAddTask()}
                sx={(theme) => ({
                    mx: -1,
                    mt: -2,
                    display: 'flex',
                    justifyContent: 'space-between',
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
                <Typography component='span' variant='body2' sx={{ fontWeight: 500 }}>Tasks</Typography>
                <IconButton sx={{ m: -1, color: 'inherit' }} disableTouchRipple>
                    <AddTask />
                </IconButton>
            </Button>
            {entryTasksFieldArray.fields.length === 0 ? (
                <Typography sx={{ mt: -1 }} variant='body2' color='textSecondary'>
                    <span>No tasks — </span>
                    <Link onClick={() => handleAddTask()}>Add one</Link>
                </Typography>
            ) : (
                <Stack mt={0} ml={-1} mr={2} gap={0} mb={-1}>
                    {entryTasksFieldArray.fields.map((task, index) => (
                        <Stack direction='row' spacing={0} alignItems={'center'} sx={{ width: '100%' }} key={task._id}>
                            <Controller
                                control={control}
                                name={`tasks.${index}.completedAt`}
                                render={({ field: { value, onChange } }) => (
                                    <Checkbox
                                        checked={Boolean(value)}
                                        onChange={(event) => {
                                            onChange(event.target.checked ? new Date().toISOString() : null)
                                        }}
                                        icon={<RadioButtonUnchecked />}
                                        checkedIcon={<CheckCircle />}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name={`tasks.${index}.memo`}
                                render={({ field: { value, onChange, ...rest } }) => (
                                    <InputBase
                                        value={value}
                                        onChange={onChange}
                                        inputRef={el => inputRefs.current[index] = el}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                                        {...rest}
                                        placeholder='Task...'
                                        size='small'
                                        fullWidth
                                        sx={{ 
                                            textDecoration: tasks?.[index]?.completedAt ? 'line-through' : 'none'
                                        }}
                                    />
                                )}
                            />
                        </Stack>
                    ))}
                </Stack>
            )}
        </Stack>
    )
}
