import { getWeekOfMonth } from "./date";
import dayjs from "dayjs";
import { DAYS_OF_WEEK_NAMES } from "@/constants/date";
import { CadenceFrequency, DayOfWeek, MonthlyCadence, RecurringCadence, WeekNumber } from "@/schema/support/recurrence";
import { EntryRecurrency } from "@/schema/models/EntryRecurrence";

const FREQUENCY_LABELS: Record<CadenceFrequency, { singular: string, plural: string, adverb: string }> = {
    D: { singular: 'day', plural: 'days', adverb: 'daily' },
    W: { singular: 'week', plural: 'weeks', adverb: 'weekly' },
    M: { singular: 'month', plural: 'months', adverb: 'monthly' },
    Y: { singular: 'year', plural: 'years', adverb: 'annually' },
};

export const generateDeafultRecurringCadences = (date: string): RecurringCadence[] => {
    const weekNumber = getWeekOfMonth(date)
    return [
        {
            frequency: CadenceFrequency.enum.D,
            interval: 1,
        },
        {
            frequency: CadenceFrequency.enum.W,
            interval: 1,
            days: [dayOfWeekFromDate(date)]
        },
        {
            frequency: CadenceFrequency.enum.M,
            interval: 1,
            on: {
                week: WeekNumber.options[weekNumber - 1]
            }
        },
        {
            frequency: CadenceFrequency.enum.Y,
            interval: 1,
        }
    ]
}

export const dayOfWeekFromDate = (date: string): DayOfWeek => {
    return dayjs(date).format('ddd').substring(0, 2).toUpperCase() as DayOfWeek
}

export const getFrequencyLabel = (frequency: CadenceFrequency, quantity: number ) => {
    const { singular, plural } = FREQUENCY_LABELS[frequency]

    return quantity === 1 ? singular : plural
}

export const getMonthlyRecurrencesFromDate = (date: string): MonthlyCadence[] => {
    const weekNumber = getWeekOfMonth(date)
    const dayNumber = dayjs(date).date()

    const cadences: MonthlyCadence[] = [
        {
            frequency: CadenceFrequency.enum.M,
            on: {
                day: dayNumber
            }
        },
    ]

    if (weekNumber <= 3) {
        cadences.push({
            frequency: CadenceFrequency.enum.M,
            on: {
                week: WeekNumber.options[weekNumber - 1]
            }
        })
    } else {
        cadences.push(
            {
                frequency: CadenceFrequency.enum.M,
                on: {
                    week: WeekNumber.enum.FOURTH
                }
            },
            {
                frequency: CadenceFrequency.enum.M,
                on: {
                    week: WeekNumber.enum.LAST
                }
            },
        )
    }

    return cadences
}

export const sortDaysOfWeek = (days: DayOfWeek[]): DayOfWeek[] => {
    return days.sort((a, b) => 
        Object.keys(DAYS_OF_WEEK_NAMES).indexOf(a) - 
        Object.keys(DAYS_OF_WEEK_NAMES).indexOf(b)
    ) as DayOfWeek[];
};

/**
 * Returns true if the given array exactly contains all five weekdays,
 * namely MO, TU, WE, TH, FR
 */
export const isSetOfWeekdays = (days: DayOfWeek[]): boolean => {
    const weekdays = new Set<DayOfWeek>(['MO', 'TU', 'WE', 'TH', 'FR']);
    return days.length === weekdays.size && new Set(days).size === weekdays.size && days.every(day => weekdays.has(day));
};

export const getMonthlyCadenceLabel = (cadence: MonthlyCadence, date: string): string => {
    let labelParts = []
    if ('day' in cadence.on) {
        labelParts.push(`day ${cadence.on.day}`)
    } else {
        labelParts.push('the')
        switch (cadence.on.week) {
            case WeekNumber.enum.FIRST:
                labelParts.push('first')
                break
            case WeekNumber.enum.SECOND:
                labelParts.push('second')
                break
            case WeekNumber.enum.THIRD:
                labelParts.push('third')
                break
            case WeekNumber.enum.FOURTH:
                labelParts.push('fourth')
                break
            case WeekNumber.enum.LAST:
                labelParts.push('last')
                break
        }
        labelParts.push(dayjs(date).format('dddd'))
    }

    return labelParts.join(' ')
}

export const getRecurrencyString = (recurrency: EntryRecurrency, date: string): string | undefined => {
    const { cadence, ends } = recurrency

    if (ends && 'afterNumOccurrences' in ends && ends.afterNumOccurrences === 1) {
        return 'Once'
    }

    const cadenceStringParts = []
    if (cadence.interval === 1) {
        cadenceStringParts.push(FREQUENCY_LABELS[cadence.frequency].adverb)
    } else if (cadence.interval > 1) {
        cadenceStringParts.push(
            'every',
            String(cadence.interval),
            FREQUENCY_LABELS[cadence.frequency].plural)
    } else {
        return undefined
    }

    switch (cadence.frequency) {
        case CadenceFrequency.enum.W:
            cadenceStringParts.push(
                'on',
                isSetOfWeekdays(cadence.days)
                    ? 'weekdays'
                    : sortDaysOfWeek(cadence.days)
                        .map((day: DayOfWeek) => DAYS_OF_WEEK_NAMES[day])
                        .join(', ')
            )
            break
        case CadenceFrequency.enum.M:
            cadenceStringParts.push(
                'on',
                getMonthlyCadenceLabel(cadence, date)
            )
            break
        case CadenceFrequency.enum.Y:
            cadenceStringParts.push(
                'on',
                dayjs(date).format('MMMM D')
            )
            break
        case CadenceFrequency.enum.D:
        default:
            break
    }

    const stringParts = [
        cadenceStringParts.join(' ')
    ]
    if (ends) {
        if ('onDate' in ends) {
            const endDay = dayjs(ends.onDate)
            const formattedDate: string = dayjs().isSame(endDay, 'year')
                ? endDay.format('MMM D')
                : endDay.format('MMM D, YYYY')
                stringParts.push(`until ${formattedDate}`)
        } else if ('afterNumOccurrences' in ends && ends.afterNumOccurrences > 1) {
            stringParts.push(`${ends.afterNumOccurrences} times`)
        }
    }

    return stringParts.join(', ');
}

/**
 * @TODO optimization target
 */
export const serializeEntryRecurrency = (recurrency: EntryRecurrency): string => {
    return JSON.stringify(recurrency)
}

export const deserializeEntryRecurrency = (recurrency: string): EntryRecurrency | undefined => {
    if (!recurrency) {
        return undefined
    }
    let parsed: EntryRecurrency
    try {
        parsed = JSON.parse(recurrency) as EntryRecurrency
    } catch (_error: any) {
        return undefined
    }
    return parsed
}

export const updateRecurrencyNewDate = (recurrency: EntryRecurrency | undefined, date: string): EntryRecurrency | undefined => {
    if (!recurrency || !date) {
        return
    }

    let newCadence: RecurringCadence | undefined = undefined
    const { cadence } = recurrency

    if (cadence.frequency === CadenceFrequency.enum.W) {
        const dateWeekday = dayOfWeekFromDate(date)
        if (cadence.days.includes(dateWeekday)) {
            // New date's day of week is already included; no change needed
            return;
        } else if (cadence.days.length > 1) {
            // Custom recurrence includes more than one day; don't change
            return
        } else {
            // Replace the day of week
            newCadence = { ...cadence, days: [dateWeekday] }
        }
    } else if (cadence.frequency === CadenceFrequency.enum.M) {
        if ('day' in cadence.on) {
            newCadence = {
                ...cadence,
                on: { day: dayjs(date).date() }
            }
        } else {
            const weekNumber = getWeekOfMonth(date)
            newCadence = {
                ...cadence,
                on: { week: WeekNumber.options[weekNumber - 1] }
            }
        }
    }

    return newCadence
        ? {
            kind: 'zisk:recurrence',
            cadence: newCadence,
            ends: null, // TODO!!
        }
        : undefined
}
