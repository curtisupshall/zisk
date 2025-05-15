import { dateViewIsAnnualPeriod, dateViewIsMonthlyPeriod, dateViewIsRange, dateViewIsWeeklyPeriod, getAbsoluteDateRangeFromDateView, getAnnualPeriodFromDate, getDateViewSymbol, getEmpiracleDateRangeFromJournalEntries, getMonthlyPeriodFromDate, getWeeklyPeriodFromDate } from '@/utils/date'
import {
	ArrowBack,
	ArrowDropDown,
	ArrowForward,
	CalendarToday,
} from '@mui/icons-material'
import { Button, IconButton, ListItemText, Menu, MenuItem, Popover, Stack, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import KeyboardShortcut from '../../text/KeyboardShortcut'
import useKeyboardAction from '@/hooks/useKeyboardAction'
import { JournalSliceContext } from '@/contexts/JournalSliceContext'
import { KeyboardActionName } from '@/constants/keyboard'
import { DateViewSymbol } from '@/schema/support/slice'
import { JournalEntry } from '@/schema/documents/JournalEntry'

const dateViewMenuOptionLabels: Record<DateViewSymbol, string> = {
    [DateViewSymbol.WEEKLY]: 'Week',
    [DateViewSymbol.MONTHLY]: 'Month',
    [DateViewSymbol.YEARLY]: 'Year',
    [DateViewSymbol.RANGE]: 'Date Range',
}

type JournalEditorDateViewSymbolWithKeystroke = Exclude<DateViewSymbol, DateViewSymbol.RANGE>;

const dateViewKeystrokes: Record<JournalEditorDateViewSymbolWithKeystroke, KeyboardActionName> = {
    [DateViewSymbol.WEEKLY]: KeyboardActionName.DATE_VIEW_WEEKLY,
    [DateViewSymbol.MONTHLY]: KeyboardActionName.DATE_VIEW_MONTHLY,
    [DateViewSymbol.YEARLY]: KeyboardActionName.DATE_VIEW_ANNUALLY,
}

const DATE_RANGE_SEPERATOR = '\u00A0\u2013\u00A0'

export default function JournalDateActions() {
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
    const [showDateViewPicker, setShowDateViewPicker] = useState<boolean>(false)

    const journalSliceContext = useContext(JournalSliceContext)
    
    const datePickerButtonRef = useRef<HTMLButtonElement | null>(null);
    const dateViewPickerButtonRef = useRef<HTMLButtonElement | null>(null);
	const hideTodayButton = dateViewIsRange(journalSliceContext.dateView)

    const theme = useTheme()

    const hideDateViewPicker = useMediaQuery(theme.breakpoints.down('md'))
    const hideNextPrevButtons = hideTodayButton || hideDateViewPicker
    const headingSize = useMediaQuery(theme.breakpoints.down('sm')) ? 'h6' : 'h5'

    const now = useMemo(() => dayjs(), [])

    useKeyboardAction(KeyboardActionName.DATE_VIEW_ANNUALLY, () => {
        journalSliceContext.switchDateView(DateViewSymbol.YEARLY)
    })
    useKeyboardAction(KeyboardActionName.DATE_VIEW_MONTHLY, () => {
        journalSliceContext.switchDateView(DateViewSymbol.MONTHLY)
    })
    useKeyboardAction(KeyboardActionName.DATE_VIEW_WEEKLY, () => {
        journalSliceContext.switchDateView(DateViewSymbol.WEEKLY)
    })
    useKeyboardAction(KeyboardActionName.JUMP_TO_TODAY_VIEW, () => {
        jumpToToday()
    })

    const [prevButtonTooltip, nextButtonTooltip] = useMemo(() => {
        if (dateViewIsMonthlyPeriod(journalSliceContext.dateView)) {
            return ['Previous month', 'Next month']
        } else if (dateViewIsAnnualPeriod(journalSliceContext.dateView)) {
            return ['Previous year', 'Next year']
        } else if (dateViewIsWeeklyPeriod(journalSliceContext.dateView)) {
            return ['Previous week', 'Next week']
        } else {
            return [undefined, undefined]
        }
    }, [journalSliceContext.dateView])

    /**
     * Supported formats include:
     * 
     * @example "2024" // Year view
     * @example "September" // Monthly view, in current year
     * @example "Dec 2024" // Monthly view, in past/future year
     * @example "Jan 1 - 7" // Weekly view in current year
     * @example "Sep 1 - 7, 2022" // Weekly view in past year
     * @example "Dec 31, 2023 - Jan 6, 2024" // Weekly view spanning multiple past/future years
     * @example "Jan 30 - Sep 2" // Date range in current year
     * @example "Jan 5 - Feb 3, 2021" // Date range in past/future year
     * @example "Nov 2020 - Feb 2021" // Date range spanning multiple years
     */
    const formattedDateString = useMemo(() => {
        const { dateView } = journalSliceContext
        let { startDate, endDate } = getAbsoluteDateRangeFromDateView(dateView)

        // Handle case where an incomplete range is given
        if (!startDate || !endDate) {
            const journalEntries: JournalEntry[] = Object.values(journalSliceContext.getJournalEntriesQuery.data ?? {})
            const { startDate: empiracleStartDate, endDate: empiracleEndDate } = getEmpiracleDateRangeFromJournalEntries(journalEntries)
            if (empiracleStartDate && empiracleEndDate) {
                startDate = empiracleStartDate
                endDate = empiracleEndDate
            }
            if (!startDate || !endDate) {
                const date = startDate ?? endDate
                if (!date) {
                    return dayjs(now).format('MMM D')
                }

                if (dayjs(date).isSame(now, 'year')) {
                    return dayjs(date).format('MMM D')
                } else {
                    return dayjs(date).format('MMM D, YYYY')
                }
            }
        }

        if (dateViewIsAnnualPeriod(dateView)) {
            return String(dateView.year)
        }

        const spansCurrentYear = startDate.isSame(now, 'year') && endDate.isSame(now, 'year')
        const spansSingleYear = startDate.isSame(endDate, 'year')
        const spansSingleMonth = startDate.isSame(endDate, 'month')

        if (dateViewIsMonthlyPeriod(dateView)) {
            if (spansCurrentYear) {
                return startDate.format('MMMM')
            }
            return startDate.format('MMM YYYY')
        }

        if (spansSingleYear) {
            const endFormat = spansCurrentYear ? 'D' : 'D, YYYY'
            
            if (spansSingleMonth) {
                return [
                    startDate.format('MMM D'),
                    endDate.format(endFormat),
                ].join(DATE_RANGE_SEPERATOR)
            }
            
            return [
                startDate.format('MMM D'),
                endDate.format(`MMM ${endFormat}`)
            ].join(DATE_RANGE_SEPERATOR)
        }

        const format = dateViewIsWeeklyPeriod(dateView) ? 'MMM D, YYYY' : 'MMM YYYY'
        return [
            startDate.format(format),
            endDate.format(format),
        ].join(DATE_RANGE_SEPERATOR)
    }, [journalSliceContext.dateView, journalSliceContext.getJournalEntriesQuery.data])

    // const calendarAvailableViews = useMemo((): DateView[] => {
    // 	switch (journalSliceContext.view) {
    // 		case 'year':
    // 			return ['year']
    // 		case 'week':
    // 			return ['year', 'month', 'day']
    // 		case 'month':
    // 		default:
    // 			return ['month', 'year']
    // 	}
    // }, [journalSliceContext.view])

    const formattedCurrentDay = useMemo(() => {
        return now.format('dddd, MMMM D')
    }, [])

    const currentDateViewSymbol: DateViewSymbol = useMemo(() => {
        return getDateViewSymbol(journalSliceContext.dateView)
    }, [journalSliceContext.dateView])

    // const handleChangeDatePickerDate = (value: dayjs.Dayjs) => {
    // 	journalSliceContext.setDate(value.format('YYYY-MM-DD'))
    // }

    const handlePrevPage = () => {
        if (dateViewIsRange(journalSliceContext.dateView)) {
            return
        }

        const absoluteDateRange = getAbsoluteDateRangeFromDateView(journalSliceContext.dateView)
        if (!absoluteDateRange.startDate) {
            return
        }

        const currentDate = dayjs(absoluteDateRange.startDate)
        let newDate: dayjs.Dayjs

        if (dateViewIsMonthlyPeriod(journalSliceContext.dateView)) {
            newDate = currentDate.subtract(1, 'month')
            journalSliceContext.onChangeDateView({
                year: newDate.year(),
                month: newDate.month() + 1, // Zero-indexed
            })
        } else if (dateViewIsWeeklyPeriod(journalSliceContext.dateView)) {
            newDate = currentDate.subtract(1, 'week')
            journalSliceContext.onChangeDateView({
                year: newDate.year(),
                month: newDate.month() + 1, // Zero-indexed
                day: newDate.date(),
            })
        } else if (dateViewIsAnnualPeriod(journalSliceContext.dateView)) {
            newDate = currentDate.subtract(1, 'year')
            journalSliceContext.onChangeDateView({
                year: newDate.year()
            })
        }
    }

    const handleNextPage = () => {
        if (dateViewIsRange(journalSliceContext.dateView)) {
            return
        }

        const absoluteDateRange = getAbsoluteDateRangeFromDateView(journalSliceContext.dateView)
        if (!absoluteDateRange.startDate) {
            return
        }

        const currentDate = dayjs(absoluteDateRange.startDate)
        let newDate: dayjs.Dayjs

        if (dateViewIsMonthlyPeriod(journalSliceContext.dateView)) {
            newDate = currentDate.add(1, 'month')
            journalSliceContext.onChangeDateView(getMonthlyPeriodFromDate(newDate))
        } else if (dateViewIsWeeklyPeriod(journalSliceContext.dateView)) {
            newDate = currentDate.add(1, 'week')
            journalSliceContext.onChangeDateView(getWeeklyPeriodFromDate(newDate))
        } else if (dateViewIsAnnualPeriod(journalSliceContext.dateView)) {
            newDate = currentDate.add(1, 'year')
            journalSliceContext.onChangeDateView(getAnnualPeriodFromDate(newDate))
        }
    }

    const handleChangeDateView = (view: DateViewSymbol) => {
		setShowDateViewPicker(false)
		journalSliceContext.switchDateView(view)
	}

    const jumpToToday = useCallback(() => {
        if (dateViewIsRange(journalSliceContext.dateView)) {
            return
        }

        const newDateView = { ...journalSliceContext.dateView, year: now.year() }

        if (dateViewIsMonthlyPeriod(newDateView)) {
            newDateView.month = now.month() + 1 // Zero-indexed
        } else if (dateViewIsWeeklyPeriod(newDateView)) {
            newDateView.month = now.month() + 1 // Zero-indexed
            newDateView.day = now.date()
        } else if (!dateViewIsAnnualPeriod(newDateView)) {
            return
        }

        journalSliceContext.onChangeDateView(newDateView)
    }, [journalSliceContext.dateView])

    return (
        <>
            <Menu
                open={showDateViewPicker}
                anchorEl={dateViewPickerButtonRef.current}
                onClose={() => setShowDateViewPicker(false)}
            >
                {Object.entries(dateViewMenuOptionLabels)
                    .filter(([key]) => {
                        return !(key === DateViewSymbol.RANGE && !(currentDateViewSymbol === key))
                    })
                    .map(([key, label]) => {
                        return (
                            <MenuItem
                                key={key}
                                onClick={() => handleChangeDateView(key as DateViewSymbol)}
                                aria-label={`View by ${label}`}
                                selected={key === currentDateViewSymbol}
                            >
                                <ListItemText>{label}</ListItemText>
                                {dateViewKeystrokes[key as JournalEditorDateViewSymbolWithKeystroke] && (
                                    <KeyboardShortcut
                                        name={dateViewKeystrokes[key as JournalEditorDateViewSymbolWithKeystroke]}
                                        sx={{ ml: 2 }}
                                    />
                                )}
                            </MenuItem>
                        )
                    })}
            </Menu>
            <Popover open={showDatePicker} onClose={() => setShowDatePicker(false)} anchorEl={datePickerButtonRef.current}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                        // views={calendarAvailableViews}
                        // onChange={(value) => {
                        //     // handleChangeDatePickerDate(value)
                        // }}
                    />
                </LocalizationProvider>
            </Popover>
            <Stack direction="row" alignItems="center" gap={1}>
                {!hideDateViewPicker && (
                    <Button
                        variant='text'
                        sx={(theme) => ({
                            py: 0.75,
                            backgroundColor: theme.palette.action.hover,
                            '&:hover': {
                                backgroundColor: theme.palette.action.selected,
                            },
                        })}
                        ref={dateViewPickerButtonRef}
                        onClick={() => setShowDateViewPicker((showing) => !showing)}
                        color="inherit"
                        endIcon={<ArrowDropDown />}
                    >
                        <Typography>
                            {dateViewMenuOptionLabels[currentDateViewSymbol]}
                        </Typography>
                    </Button>
                )}
                {!hideTodayButton && (
                    <Tooltip title={formattedCurrentDay}>
                        <IconButton color="inherit" onClick={() => jumpToToday()}>
                            <CalendarToday />
                        </IconButton>
                    </Tooltip>
                )}
                <Button
                    color="inherit"
                    endIcon={<ArrowDropDown />}
                    ref={datePickerButtonRef}
                    onClick={() => setShowDatePicker((showing) => !showing)}>
                    <Typography
                        variant={headingSize}
                        sx={{ fontWeight: 500 }}>
                        {formattedDateString}
                    </Typography>
                </Button>
                {!hideNextPrevButtons && (
                    <Stack direction="row">
                        <Tooltip title={prevButtonTooltip}>
                            <IconButton onClick={() => handlePrevPage()}>
                                <ArrowBack />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={nextButtonTooltip}>
                            <IconButton onClick={() => handleNextPage()}>
                                <ArrowForward />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )}
            </Stack>
        </>
    )
}
