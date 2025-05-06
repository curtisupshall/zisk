import {
    dayOfWeekFromDate,
    deserializeEntryRecurrency,
    generateDeafultRecurringCadences,
    getFrequencyLabel,
    getMonthlyCadenceLabel,
    getMonthlyRecurrencesFromDate,
    getRecurrencyString,
    serializeEntryRecurrency,
    updateRecurrencyNewDate
} from "@/utils/recurrence"
import { CadenceFrequency, DayOfWeek, MonthlyCadence, RecurringCadence } from "@/schema/support/recurrence"
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Typography
} from "@mui/material"
import { ChangeEvent, useEffect, useState } from "react"
import DaysOfWeekPicker from "../pickers/DaysOfWeekPicker"
import dayjs from "dayjs"
import { pluralize, sentenceCase } from "@/utils/string"
import { EntryRecurrency } from "@/schema/models/EntryRecurrence"

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
    initialValue: EntryRecurrency | undefined
    onSubmit: (recurrency: EntryRecurrency) => void
    onClose: () => void
}

enum RecurrencyEnd {
    NEVER = 'NEVER',
    ON_DATE = 'ON_DATE',
    AFTER_OCCURRENCES = 'AFTER_OCCURRENCES'
}

function CustomRecurrenceModal(props: CustomRecurrenceModalProps) {
    const { onSubmit, ...rest } = props
    const [totalOccurrenceCount, setTotalOccurrenceCount] = useState<string | number>(1) // TODO revisit default value here
    const [recurrencyEnds, setRecurrencyEnds] = useState<RecurrencyEnd>(RecurrencyEnd.NEVER)
    const [recurrencyEndDate, setRecurrencyEndDate] = useState<string>('') // TODO determine how to set the initial value
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

    const handleChangeTotalOccurrenceCount = (event: ChangeEvent<HTMLInputElement>) => {
        setTotalOccurrenceCount(event.target.value)
    }

    const incrementTotalOccurrenceCount = () => {
        setTotalOccurrenceCount((prev) => (Number(prev || 0) + 1))
    }

    const decrementTotalOccurrenceCount = () => {
        if (Number(totalOccurrenceCount) > 1) {
            setTotalOccurrenceCount((prev) => Number(prev) - 1)
        } else {
            setTotalOccurrenceCount(1)
        }
    }

    const handleSubmit = () => {
        let cadence: RecurringCadence
        let ends: EntryRecurrency['ends']
        switch (frequency) {
            case CadenceFrequency.enum.Y:
                cadence = {
                    frequency: CadenceFrequency.enum.Y,
                    interval: Number(interval),
                }
                break
            case CadenceFrequency.enum.D:
                cadence = {
                    frequency: CadenceFrequency.enum.D,
                    interval: Number(interval),
                }
                break
            case CadenceFrequency.enum.W: {
                cadence = {
                    frequency: CadenceFrequency.enum.W,
                    interval: Number(interval),
                    days: Array.from(selectedWeekDays),
                }
                break
            }
            case CadenceFrequency.enum.M:
            default:
                cadence = {
                    ...monthlyCadenceOptions[selectedMonthlyCadenceOption],
                    interval: Number(interval),
                }
                break
        }

        switch (recurrencyEnds) {
            case RecurrencyEnd.AFTER_OCCURRENCES:
                ends = {
                    afterNumOccurrences: Number(totalOccurrenceCount ?? 1) || 1
                }
                break
            case RecurrencyEnd.ON_DATE:
                ends = {
                    onDate: recurrencyEndDate
                }
                break
            case RecurrencyEnd.NEVER:
            default:
                ends = null
                break
        }
        onSubmit({
            kind: 'zisk:recurrence',
            cadence,
            ends,
            exceptions: undefined,
        })
    }

    useEffect(() => {
        setSelectedMonthlyCadenceOption(0)
        setMonthlyCadenceOptions(getMonthlyRecurrencesFromDate(props.date))
        setSelectedWeekDays(new Set<DayOfWeek>([dayOfWeekFromDate(props.date)]))
    }, [props.date])

    useEffect(() => {
        if (!props.open || !props.initialValue) {
            return
        }
        setInterval(props.initialValue.cadence.interval)
        setFrequency(props.initialValue.cadence.frequency)
        if (props.initialValue.cadence.frequency ===CadenceFrequency.enum.W) {
            setSelectedWeekDays(new Set<DayOfWeek>(props.initialValue.cadence.days))
        }
        if (props.initialValue.ends) {
            if ('onDate' in props.initialValue.ends) {
                setRecurrencyEnds(RecurrencyEnd.ON_DATE)
                setRecurrencyEndDate(props.initialValue.ends.onDate)
            } else if ('afterNumOccurrences' in props.initialValue.ends) {
                setRecurrencyEnds(RecurrencyEnd.AFTER_OCCURRENCES)
                setTotalOccurrenceCount(props.initialValue.ends.afterNumOccurrences)
            }
        } else {
            setRecurrencyEnds(RecurrencyEnd.NEVER)
        }
    }, [props.initialValue, props.open])

    return (
        <Dialog {...rest} maxWidth='xs' fullWidth>
            <DialogTitle>Custom recurrence</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <Stack direction='row' spacing={0.5} alignItems={'center'}>
                        <Typography variant='body2' sx={{ pr: 1 }}>Repeats every</Typography>
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
                        <Stack spacing={0} my={-1}>
                            <IconButton
                                size="small"
                                onClick={() => incrementInterval()}
                                sx={(theme) => ({
                                    width: theme.spacing(3),
                                    height: theme.spacing(3)
                                })}
                            >
                                <ArrowDropUp />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => decrementInterval()}
                                sx={(theme) => ({
                                    width: theme.spacing(3),
                                    height: theme.spacing(3)
                                })}
                            >
                                <ArrowDropDown />
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
                    {frequency === CadenceFrequency.enum.M && (
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
                    {frequency === CadenceFrequency.enum.W && (
                        <Stack gap={1}>
                            <Typography variant='body2'>Repeats on</Typography>
                            <DaysOfWeekPicker
                                value={selectedWeekDays}
                                onChange={setSelectedWeekDays}
                            />
                        </Stack>
                    )}
                    <Stack gap={0}>
                        <Typography variant='body2'>Ends</Typography>
                        <FormControl>
                            <RadioGroup
                                value={recurrencyEnds}
                                onChange={((_event, newValue: string) => {
                                    setRecurrencyEnds(newValue as RecurrencyEnd)
                                })}
                                sx={{ gap: 0.5 }}
                            >
                                <FormControlLabel
                                    value={RecurrencyEnd.NEVER}
                                    control={<Radio />}
                                    label={<Typography variant='body2'>Never</Typography>}
                                />
                                <FormControlLabel
                                    value={RecurrencyEnd.ON_DATE}
                                    control={<Radio />}
                                    label={
                                        <Stack direction='row' spacing={1} alignItems={'center'}>
                                            <Typography variant='body2' sx={{ minWidth: '5ch' }}>On</Typography>
                                                <Stack
                                                    direction='row'
                                                    spacing={0.5}
                                                    alignItems={'center'}
                                                    sx={{
                                                        my: -1,
                                                        opacity: recurrencyEnds === RecurrencyEnd.ON_DATE
                                                            ? undefined
                                                            : 0.5,
                                                    }}
                                                    my={-1}
                                                >
                                                    <TextField
                                                        size='small'
                                                        hiddenLabel
                                                        value={recurrencyEndDate}
                                                        onChange={(event) => setRecurrencyEndDate(event.target.value)}
                                                        placeholder='Date'
                                                        variant='filled'
                                                        disabled={recurrencyEnds !== RecurrencyEnd.ON_DATE}
                                                    />
                                            </Stack>
                                        </Stack>
                                    }
                                />
                                <FormControlLabel
                                    value={RecurrencyEnd.AFTER_OCCURRENCES}
                                    control={<Radio />}
                                    label={
                                        <Stack direction='row' spacing={1} alignItems={'center'}>
                                            <Typography variant='body2' sx={{ minWidth: '5ch' }}>After</Typography>
                                            <Stack
                                                direction='row'
                                                spacing={0.5}
                                                alignItems={'center'}
                                                sx={{
                                                    my: -1,
                                                    opacity: recurrencyEnds === RecurrencyEnd.AFTER_OCCURRENCES
                                                        ? undefined
                                                        : 0.5,
                                                }}
                                                my={-1}
                                            >
                                                <TextField
                                                    disabled={recurrencyEnds !== RecurrencyEnd.AFTER_OCCURRENCES}
                                                    hiddenLabel
                                                    value={totalOccurrenceCount}
                                                    onChange={handleChangeTotalOccurrenceCount}
                                                    size='small'
                                                    autoComplete="new-password"
                                                    type='number'
                                                    variant='filled'
                                                    onBlur={() => {
                                                        if (!interval || Number(interval) <= 0) {
                                                            setTotalOccurrenceCount(1)
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
                                                <Stack spacing={0} my={-1}>
                                                    <IconButton
                                                        disabled={recurrencyEnds !== RecurrencyEnd.AFTER_OCCURRENCES}
                                                        size="small"
                                                        onClick={() => incrementTotalOccurrenceCount()}
                                                        sx={(theme) => ({
                                                            width: theme.spacing(3),
                                                            height: theme.spacing(3),
                                                        })}
                                                    >
                                                        <ArrowDropUp />
                                                    </IconButton>
                                                    <IconButton
                                                        disabled={recurrencyEnds !== RecurrencyEnd.AFTER_OCCURRENCES}
                                                        size="small"
                                                        onClick={() => decrementTotalOccurrenceCount()}
                                                        sx={(theme) => ({
                                                            width: theme.spacing(3),
                                                            height: theme.spacing(3),
                                                        })}
                                                    >
                                                        <ArrowDropDown />
                                                    </IconButton>
                                                </Stack>
                                                <Typography variant='body2'>{pluralize(Number(totalOccurrenceCount) || 0, 'occurrence')}</Typography>
                                            </Stack>
                                        </Stack>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </Stack>
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
    value: EntryRecurrency | undefined
    onChange: (recurrency: EntryRecurrency | undefined) => void
}

const getRecurrencySelectOptions = (date: string, additional: (EntryRecurrency | undefined)[]) => {
    const today = dayjs().format('YYYY-MM-DD')
    const options: string[] = [
        RecurrenceDefaultOption.NON_RECURRING,
    ]
    generateDeafultRecurringCadences(date ?? today).forEach((cadence) => {
        options.push(serializeEntryRecurrency({
            kind: 'zisk:recurrence',
            cadence,
            ends: null,
        }));
    })
    additional.forEach((recurrency) => {
        if (recurrency) {
            const serialized = serializeEntryRecurrency(recurrency)
            if (!options.includes(serialized)) {
                options.push(serialized)
            }
        }
    })
    options.push(
        RecurrenceDefaultOption.CUSTOM,
    );
    return options
}

export default function RecurrenceSelect(props: RecurrenceSelectProps) {
    const [showCustomRecurrencyDialog, setShowCustomRecurrencyDialog] = useState<boolean>(false)
    const [customRecurrency, setCustomRecurrency] = useState<EntryRecurrency | undefined>(undefined)

    const handleChange = (event: SelectChangeEvent<string>) => {
        event.preventDefault()
        const { value } = event.target
        if (value === RecurrenceDefaultOption.CUSTOM) {
            setShowCustomRecurrencyDialog(true)
            return
        } else if (value === RecurrenceDefaultOption.NON_RECURRING) {
            props.onChange(undefined)
            return
        }

        const recurrency = deserializeEntryRecurrency(value)
        props.onChange(recurrency)
    }

    

    const handleSubmitCustomRecurrenceForm = (value: EntryRecurrency) => {
        setCustomRecurrency(value)
        props.onChange(value)
        setShowCustomRecurrencyDialog(false)
    }

    /**
     * When the date changes, select the recurrence that best approximates the
     * previous one.
     */
    useEffect(() => {
        const recurrency = updateRecurrencyNewDate(props.value, props.date)
        if (recurrency) {
            props.onChange(recurrency)
        }
    }, [props.date])

    const selectOptions: string[] = getRecurrencySelectOptions(props.date, [props.value, customRecurrency])

    return ( 
        <>
            <CustomRecurrenceModal
                open={showCustomRecurrencyDialog}
                date={props.date}
                initialValue={props.value}
                onClose={() => setShowCustomRecurrencyDialog(false)}
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
                    value={props.value ? serializeEntryRecurrency(props.value) : RecurrenceDefaultOption.NON_RECURRING}
                >
                    {selectOptions.map((option: string | RecurrenceDefaultOption) => {
                        let label: string = ''
                        if (option in RECURRENCE_DEFAULT_OPTION_LABELS) {
                            label = RECURRENCE_DEFAULT_OPTION_LABELS[option as RecurrenceDefaultOption]
                        } else {
                            let recurrency: EntryRecurrency | undefined = deserializeEntryRecurrency(option)
                            if (recurrency) {
                                label = getRecurrencyString(recurrency, props.date) ?? ''
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
