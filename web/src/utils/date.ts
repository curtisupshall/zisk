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
export const getWeekOfMonth = (date: string) => {
    let day = dayjs(date)
    let weekNumber = 0
    for (let pivot = dayjs(date); pivot.month() === day.month(); pivot = pivot.subtract(7, 'days')) {
        weekNumber ++;
    }

    return weekNumber;
}
