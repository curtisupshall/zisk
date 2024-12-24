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
