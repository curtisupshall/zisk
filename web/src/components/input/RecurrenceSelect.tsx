import { dayOfWeekFromDate, deserializeRecurrenceCadence, generateDeafultRecurringCadences, getFrequencyLabel, getMonthlyCadenceLabel, getMonthlyRecurrencesFromDate, getRecurringCadenceString, serializeRecurrenceCadence } from "@/utils/recurrence"
import { CadenceFrequency, DayOfWeek, MonthlyCadence, RecurringCadence } from "@/types/schema"
import { ArrowDownward, ArrowUpward } from "@mui/icons-material"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Typography
} from "@mui/material"
import { ChangeEvent, useEffect, useMemo, useState } from "react"
import DaysOfWeekPicker from "../pickers/DaysOfWeekPicker"
import dayjs from "dayjs"
import { sentenceCase } from "@/utils/string"

enum RecurrenceDefaultOption {
    NON_RECURRING = 'NON_RECURRING',
    CUSTOM = 'CUSTOM'
}

const RECURRENCE_DEFAULT_OPTION_LABELS: Record<RecurrenceDefaultOption, string> = {
    [RecurrenceDefaultOption.CUSTOM]: 'Custom...',
    [RecurrenceDefaultOption.NON_RECURRING]: 'Does not recur'
}

interface CustomRecurrenceModalProps {
    open: boolean
    date: string
    onSubmit: (cadence: RecurringCadence) => void
    onClose: () => void
}

function CustomRecurrenceModal(props: CustomRecurrenceModalProps) {
    const { onSubmit, ...rest } = props
    const [interval, setInterval] = useState<string | number>(1)
    const [frequency, setFrequency] = useState<CadenceFrequency>('M')
    const [selectedWeekDays, setSelectedWeekDays] = useState<Set<DayOfWeek>>(new Set<DayOfWeek>())
    const [monthlyCadenceOptions, setMonthlyCadenceOptions] = useState<MonthlyCadence[]>([])
    const [selectedMonthlyCadenceOption, setSelectedMonthlyCadenceOption] = useState<number>(0)

    const handleChangeFrequency = (event: SelectChangeEvent<CadenceFrequency>) => {
        setFrequency(event.target.value as CadenceFrequency)
    }

    const handleChangeInterval = (event: ChangeEvent<HTMLInputElement>) => {
        setInterval(event.target.value)
    }

    const incrementInterval = () => {
        setInterval((prev) => (Number(prev || 0) + 1))
    }

    const decrementInterval = () => {
        if (Number(interval) > 1) {
            setInterval((prev) => Number(prev) - 1)
        } else {
            setInterval(1)
        }
    }

    const handleSubmit = () => {
        let response: RecurringCadence
        switch (frequency) {
            case 'Y':
                response = {
                    frequency: 'Y',
                    interval: Number(interval),
                }
                break
            case 'D':
                response = {
                    frequency: 'D',
                    interval: Number(interval),
                }
                break
            case 'W': {
                response = {
                    frequency: 'W',
                    interval: Number(interval),
                    days: Array.from(selectedWeekDays),
                }
                break
            }
            case 'M':
            default:
                response = {
                    ...monthlyCadenceOptions[selectedMonthlyCadenceOption],
                    interval: Number(interval),
                }
                break
        }
        onSubmit(response)
    }

    useEffect(() => {
        setSelectedMonthlyCadenceOption(0)
        setMonthlyCadenceOptions(getMonthlyRecurrencesFromDate(props.date))
        setSelectedWeekDays(new Set<DayOfWeek>([dayOfWeekFromDate(props.date)]))
    }, [props.date])

    return (
        <Dialog {...rest} maxWidth='xs' fullWidth>
            <DialogTitle>Custom recurrence</DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    <Stack direction='row' spacing={0.5} alignItems={'center'}>
                        <Typography sx={{ pr: 1 }}>Repeats every</Typography>
                        <TextField
                            hiddenLabel
                            value={interval}
                            onChange={handleChangeInterval}
                            size='small'
                            autoComplete="new-password"
                            type='number'
                            variant='filled'
                            onBlur={() => {
                                if (!interval || Number(interval) <= 0) {
                                    setInterval(1)
                                }
                            }}
                            slotProps={{
                                htmlInput: {
                                    sx: {
                                        width: '3ch',
                                        textAlign: 'center',
                                        '&::-webkit-inner-spin-button,::-webkit-outer-spin-button': {
                                            '-webkit-appearance': 'none',
                                            margin: 0,
                                        }
                                    }
                                }
                            }}
                        />
                        <Stack spacing={0}>
                            <IconButton size="small" onClick={() => incrementInterval()}>
                                <ArrowUpward />
                            </IconButton>
                            <IconButton size="small" onClick={() => decrementInterval()}>
                                <ArrowDownward />
                            </IconButton>
                        </Stack>
                        <Select
                            hiddenLabel
                            variant="filled"
                            size='small'
                            value={frequency}
                            onChange={handleChangeFrequency}
                        >
                            {CadenceFrequency.options.map((frequency: CadenceFrequency) => {
                                return (
                                    <MenuItem value={frequency} key={`${frequency}-${interval}`}>
                                        {getFrequencyLabel(frequency, Number(interval || 0))}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    </Stack>
                    {frequency === 'M' && (
                        <Select
                            hiddenLabel
                            fullWidth
                            variant="filled"
                            size='small'
                            value={selectedMonthlyCadenceOption}
                            onChange={(event) => setSelectedMonthlyCadenceOption(Number(event.target.value))}
                        >
                            {monthlyCadenceOptions.map((option: MonthlyCadence, index: number) => {
                                const label = [
                                    'monthly on',
                                    getMonthlyCadenceLabel(option, props.date)
                                ].join(' ')

                                return (
                                    <MenuItem value={index} key={label}>
                                        {label}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    )}
                    {frequency === 'W' && (
                        <DaysOfWeekPicker
                            value={selectedWeekDays}
                            onChange={setSelectedWeekDays}
                        />
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Cancel</Button>
                <Button variant='contained' color='primary' onClick={() => handleSubmit()}>Done</Button>
            </DialogActions>
        </Dialog>
    )
}

interface RecurrenceSelectProps {
    date: string
    value: RecurringCadence | undefined
    onChange: (cadence: RecurringCadence | undefined) => void
}

export default function RecurrenceSelect(props: RecurrenceSelectProps) {
    const [showCustomRecurrenceDialog, setShowCustomRecurrenceDialog] = useState<boolean>(true)
    const [customCadence, setCustomCadence] = useState<RecurringCadence | undefined>(undefined)

    const selectOptions: string[] = useMemo(() => {
        const today = dayjs().format('YYYY-MM-DD')
        const options: string[] = [
            RecurrenceDefaultOption.NON_RECURRING,
            
        ]
        generateDeafultRecurringCadences(props.date ?? today).forEach((cadence) => {
            options.push(serializeRecurrenceCadence(cadence));
        })
        if (customCadence) {
            options.push(serializeRecurrenceCadence(customCadence))
        }
        options.push(
            RecurrenceDefaultOption.CUSTOM,
        );
        return options
    }, [props.date, props.value, customCadence])

    const handleChange = (event: SelectChangeEvent<string>) => {
        event.preventDefault()
        const { value } = event.target
        if (value === RecurrenceDefaultOption.CUSTOM) {
            setShowCustomRecurrenceDialog(true)
            return
        } else if (value === RecurrenceDefaultOption.NON_RECURRING) {
            props.onChange(undefined)
            return
        }
        props.onChange(deserializeRecurrenceCadence(value))
    }

    const handleSubmitCustomRecurrenceForm = (value: RecurringCadence) => {
        setCustomCadence(value)
        props.onChange(value)
        setShowCustomRecurrenceDialog(false)
    }

    /**
     * Ensures that if the component receives a cadence that is not among the list
     * of defaults, then it will be represented by the custom cadence.
     */
    useEffect(() => {
        if (!props.value) {
            return
        }
        const serialized = serializeRecurrenceCadence(props.value)
        if (!selectOptions.includes(serialized)) {
            setCustomCadence(props.value)
        }
    }, [props.value, selectOptions])

    return ( 
        <>
            <CustomRecurrenceModal
                open={showCustomRecurrenceDialog}
                date={props.date}
                onClose={() => setShowCustomRecurrenceDialog(false)}
                onSubmit={handleSubmitCustomRecurrenceForm}
            />
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                    fullWidth
                    hiddenLabel
                    variant='filled'
                    displayEmpty
                    {...props}
                    onChange={handleChange}
                    value={props.value ? serializeRecurrenceCadence(props.value) : RecurrenceDefaultOption.NON_RECURRING}
                >
                    {selectOptions.map((option: string | RecurrenceDefaultOption) => {
                        let label: string = ''
                        if (option in RECURRENCE_DEFAULT_OPTION_LABELS) {
                            label = RECURRENCE_DEFAULT_OPTION_LABELS[option as RecurrenceDefaultOption]
                        } else {
                            let cadence: RecurringCadence | undefined = deserializeRecurrenceCadence(option)
                            if (cadence) {
                                label = getRecurringCadenceString(cadence, props.date) ?? ''
                            }
                        }
                        return (
                            <MenuItem key={option} value={option}>
                                {sentenceCase(label)}
                            </MenuItem>
                        )
                    })}
                </Select>
            </FormControl>
        </>
    )
}
