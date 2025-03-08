import { DAYS_OF_WEEK_NAMES } from "@/constants/date"
import { DayOfWeek } from "@/types/schema"
import { Stack, ToggleButton, Tooltip } from "@mui/material"

interface DaysOfWeekPickerProps {
    value: Set<DayOfWeek>
    onChange: (days: Set<DayOfWeek>) => void
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
                    <Tooltip title={label} key={value}>
                        <ToggleButton
                            sx={{
                                borderRadius: '50%',
                                aspectRatio: 1,
                                minHeight: 0,
                                minWidth: 0,
                                width: '28px',
                            }}
                            color='primary'
                            value={value}
                            selected={props.value.has(value)}
                            onChange={() => handleToggleDay(value)}
                        >
                            {value.charAt(0).toUpperCase()}
                        </ToggleButton>
                    </Tooltip>
                )
            })}
        </Stack>
    )
}
