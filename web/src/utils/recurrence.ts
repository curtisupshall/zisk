import { CadenceFrequency, MonthlyCadence, WeekNumber } from "@/types/schema";
import { pluralize } from "@/utils/string";
import { getWeekOfMonth } from "./date";
import dayjs from "dayjs";

const FREQUENCY_LABELS: Record<CadenceFrequency, { label: string, suffix: string }> = {
    DAILY: { label: 'day', suffix: 's' },
    WEEKLY: { label: 'week', suffix: 's' },
    MONTHLY: { label: 'month', suffix: 's' },
    YEARLY: { label: 'year', suffix: 's' }
};

export const getFrequencyLabel = (frequency: CadenceFrequency, quantity: number ) => {
    const { label } = FREQUENCY_LABELS[frequency]
    
    return pluralize(quantity, label)
}

export const getMonthlyRecurrencesFromDate = (date: string): MonthlyCadence[] => {
    const weekNumber = getWeekOfMonth(date)
    console.log(`weekNumber for ${date} is ${weekNumber}`)
    const dayNumber = dayjs(date).date()

    const cadences: MonthlyCadence[] = [
        {
            frequency: 'MONTHLY',
            on: {
                day: dayNumber
            }
        },
    ]

    if (weekNumber <= 3) {
        cadences.push({
            frequency: 'MONTHLY',
            on: {
                week: WeekNumber.options[weekNumber - 1]
            }
        })
    } else {
        cadences.push(
            {
                frequency: 'MONTHLY',
                on: {
                    week: 'FOURTH'
                }
            },
            {
                frequency: 'MONTHLY',
                on: {
                    week: 'LAST'
                }
            },
        )
    }

    return cadences
}

export const getMonthlyCadenceLabel = (cadence: MonthlyCadence, date: string): string => {
    let labelParts = ['monthly on']
    if ('day' in cadence.on) {
        labelParts.push(`day ${cadence.on.day}`)
    } else {
        labelParts.push('the')
        switch (cadence.on.week) {
            case 'FIRST':
                labelParts.push('first')
                break
            case 'SECOND':
                labelParts.push('second')
                break
            case 'THIRD':
                labelParts.push('third')
                break
            case 'FOURTH':
                labelParts.push('fourth')
                break
            case 'LAST':
                labelParts.push('last')
                break
        }
        labelParts.push(dayjs(date).format('dddd'))
    }

    return labelParts.join(' ')
}
