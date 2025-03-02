import { DayOfWeek } from "@/types/schema"
import { Stack, ToggleButton } from "@mui/material"


interface DaysOfWeekPickerProps {
    value: Set<DayOfWeek>
    onChange: (days: Set<DayOfWeek>) => void
}

const DAYS_OF_WEEK_NAMES: Record<DayOfWeek, string> = {
    'SUN': 'Sunday',
    'MON': 'Monday',
    'TUE': 'Tuesday',
    'WED': 'Wednesday',
    'THU': 'Thursday',
    'FRI': 'Friday',
    'SAT': 'Saturday',
}

export default function DaysOfWeekPicker(props: DaysOfWeekPickerProps) {
    const handleToggleDay = (day: DayOfWeek) => {
        const newSet = new Set<DayOfWeek>(Array.from(props.value))
        if (props.value.has(day)) {
            newSet.delete(day)
        } else {
            newSet.add(day)
        }
        props.onChange(newSet)
    }

    return (
        <Stack direction='row' alignItems='center' gap={0.5}>
            {(Object.entries(DAYS_OF_WEEK_NAMES) as [DayOfWeek, string][]).map(([value, label]) => {
                return (
                    <ToggleButton
                        sx={{ borderRadius: '50%', aspectRatio: 1, minHeight: 0, flex: '1 1 0' }}
                        color='primary'
                        value={value}
                        key={value}
                        selected={props.value.has(value)}
                        onChange={() => handleToggleDay(value)}
                    >
                        {value.charAt(0).toUpperCase()}
                    </ToggleButton>
                )
            })}
        </Stack>
    )
}