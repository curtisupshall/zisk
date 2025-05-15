import { JournalEntry } from '@/schema/documents/JournalEntry'
import { WeekNumber } from '@/schema/support/recurrence'
import { AnnualPeriod, DateRange, DateView, DateViewSymbol, MonthlyPeriod, WeeklyPeriod } from '@/schema/support/slice'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(utc)

export const getRelativeTime = (timestamp: string | null): string => {
    return dayjs.utc(timestamp).fromNow()
}

export const formatJournalEntryDate = (date: string | undefined): string => {
    const day = dayjs(date)
    const now = dayjs()

    // show year if older than 11 months ago
    const showYear = now.diff(day, 'month') > 11
    return day.format(showYear ? 'ddd MMM D, YYYY' : 'ddd MMM D')
}

export const getAllDatesInMonth = (inputDate: string) => {
    const [year, month] = inputDate.split('-').map(Number);

    // Get the number of days in the month
    const endDate = new Date(year, month, 0); // The last day of the previous month (0th day of next month)
    const totalDays = endDate.getDate();

    // Generate the dates in 'YYYY-MM-DD' format
    const dates: string[] = [];
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month - 1, day);
        dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
}

export const sortDatesChronologically = (...dates: string[]) => {
    return dates.sort((a, b) => dayjs(a).isBefore(b) ? -1 : 1);
}

/**
 * Takes a date and gives the number of the week for the given month.
 * 
 * @param date The given date
 * @returns The week number of the month, namely 1-5, where 5 is always
 * interpreted as the "last week" of the month.
 * @example getWeekOfMonth('2024-01-1') // Output: 1
 * @example getWeekOfMonth('2024-01-8') // Output: 2
 * @example getWeekOfMonth('2024-01-15') // Output: 3
 * @example getWeekOfMonth('2024-01-22') // Output: 4
 * @example getWeekOfMonth('2024-01-29') // Output: 5 (the last week)
 */
export const getWeekOfMonth = (date: string): number => {
    let day = dayjs(date)
    let weekNumber = 0
    for (let pivot = dayjs(date); pivot.isSame(day, 'month'); pivot = pivot.subtract(7, 'days')) {
        weekNumber++;
    }

    return weekNumber;
}

export const getNthWeekdayOfMonthFromDate = (
    date: dayjs.Dayjs,
    targetWeekday: number,
    weekNumber: WeekNumber
): dayjs.Dayjs | undefined => {
    const month = date.month();
    const startOfMonth = date.startOf('month');

    // Find the first occurrence of the same weekday in the month
    let firstWeekday = startOfMonth;
    while (firstWeekday.day() !== targetWeekday) {
        firstWeekday = firstWeekday.add(1, 'day');
    }

    if (weekNumber === 'LAST') {
        let lastOccurrence = firstWeekday;
        while (lastOccurrence.add(7, 'day').month() === month) {
            lastOccurrence = lastOccurrence.add(7, 'day');
        }
        return lastOccurrence;
    } else {
        const weekOffsetMap: Omit<Record<WeekNumber, number>, 'LAST'> = {
            FIRST: 0,
            SECOND: 1,
            THIRD: 2,
            FOURTH: 3,
        };

        const result = firstWeekday.add(weekOffsetMap[weekNumber], 'week');
        return result.month() === month ? result : undefined;
    }
};

export const dateViewIsRange = (dateView: DateView): dateView is DateRange => {
    return 'before' in dateView || 'after' in dateView
}

export const dateViewIsWeeklyPeriod = (dateView: DateView): dateView is WeeklyPeriod => {
    return 'year' in dateView && 'month' in dateView && 'day' in dateView
}

export const dateViewIsMonthlyPeriod = (dateView: DateView): dateView is MonthlyPeriod => {
    return 'year' in dateView && 'month' in dateView && !('day' in dateView)
}

export const dateViewIsAnnualPeriod = (dateView: DateView): dateView is AnnualPeriod => {
    return 'year' in dateView && !('month' in dateView) && !('day' in dateView)
}

export const getDateViewSymbol = (dateView: DateView): DateViewSymbol => {
    if (dateViewIsWeeklyPeriod(dateView)) {
        return DateViewSymbol.WEEKLY
    } else if (dateViewIsMonthlyPeriod(dateView)) {
        return DateViewSymbol.MONTHLY
    } else if (dateViewIsAnnualPeriod(dateView)) {
        return DateViewSymbol.YEARLY
    }

    return DateViewSymbol.RANGE
}

export const getWeeklyPeriodFromDate = (date: dayjs.Dayjs): WeeklyPeriod => {
    return {
        year: date.year(),
        month: date.month() + 1, // Zero-indexed
        day: date.date(),
    }
}

export const getMonthlyPeriodFromDate = (date: dayjs.Dayjs): MonthlyPeriod => {
    return {
        year: date.year(),
        month: date.month() + 1, // Zero-indexed
    }
}

export const getAnnualPeriodFromDate = (date: dayjs.Dayjs): AnnualPeriod => {
    return {
        year: date.year(),
    }
}

export const getAbsoluteDateRangeFromDateView = (dateView: DateView) => {
    let startDate: dayjs.Dayjs | undefined = undefined
    let endDate: dayjs.Dayjs | undefined = undefined

    if (dateViewIsRange(dateView)) {
        endDate = dateView.before ? dayjs(dateView.before).subtract(1, 'day') : undefined
        startDate = dateView.after ? dayjs(dateView.after).add(1, 'day') : undefined
    } else if (dateViewIsWeeklyPeriod(dateView)) {
        startDate = dayjs([
            dateView.year,
            dateMonthNumberWithLeadingZero(dateView.month),
            dateMonthNumberWithLeadingZero(dateView.day),
        ].join('-'))
            .startOf('week')
        endDate = startDate.endOf('week')
    } else if (dateViewIsMonthlyPeriod(dateView)) {
        startDate = dayjs(`${dateView.year}-${dateView.month}-01`)
        startDate = dayjs([
            dateView.year,
            dateMonthNumberWithLeadingZero(dateView.month),
            '01',
        ].join('-'))
            .startOf('month')
        endDate = startDate.endOf('month')
    } else if (dateViewIsAnnualPeriod(dateView)) {
        startDate = dayjs(`${dateView.year}-01-01`)
        endDate = dayjs(`${dateView.year}-12-31`)
    }

    return { startDate, endDate }
}

export const getEmpiracleDateRangeFromJournalEntries = (journalEntries: JournalEntry[]) => {
    const dates = journalEntries
        .map((entry) => {
            return entry.date
        })
        .filter((date): date is string => {
            return Boolean(date)
        })

    const sortedDates = sortDatesChronologically(...dates)
    if (sortedDates.length <= 0) {
        return { startDate: undefined, endDate: undefined }
    }

    return { startDate: dayjs(sortedDates[0]), endDate: dayjs(sortedDates[sortedDates.length - 1]) }
}

/**
 * Converts numbers like `1` to '01'.
 */
export const dateMonthNumberWithLeadingZero = (dateOrMonth: number): string => {
    return dateOrMonth.toString().padStart(2, '0');
}
