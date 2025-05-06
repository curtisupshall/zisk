import { generateJournalEntryId, generateTaskId } from './id'
import dayjs from 'dayjs'
import { DEFAULT_AVATAR } from '@/components/pickers/AvatarPicker'
import { getAbsoluteDateRangeFromDateView, getNthWeekdayOfMonthFromDate } from './date'
import { StatusVariant } from '@/schema/models/EntryStatus'
import { CreateJournalEntry, JournalEntry } from '@/schema/documents/JournalEntry'
import { DateView } from '@/schema/support/slice'
import { CadenceFrequency, DayOfWeek, RecurringCadence } from '@/schema/support/recurrence'
import { Avatar } from '@/schema/models/Avatar'
import { ZiskDocument } from '@/schema/union/ZiskDocument'
import { Category } from '@/schema/documents/Category'
import { CreateEntryTask, EntryTask } from '@/schema/documents/EntryTask'
import { CreateEntryArtifact, EntryArtifact } from '@/schema/documents/EntryArtifact'

/**
 * Strips optional fields from a JournalEntry object
 */
export const simplifyJournalEntry = (entry: JournalEntry): JournalEntry => {
	if (!entry.tagIds?.length) {
		delete entry.tagIds
	}
	if (!entry.relatedEntryIds?.length) {
		delete entry.relatedEntryIds
	}
	if (!entry.categoryId) {
		delete entry.categoryId
	}
	if (!entry.notes) {
		delete entry.notes
	}

	return {
		...entry,
	}
}

export const parseJournalEntryAmount = (amount: string): number | undefined => {
	const sanitizedAmount = String(amount).replace(/[^0-9.-]/g, '');
	if (!amount || !sanitizedAmount) {
		return undefined;
	}

	const parsedAmount = parseFloat(sanitizedAmount)
	if (isNaN(parsedAmount)) {
		return parsedAmount
	} else if (amount.startsWith('+')) {
		return parsedAmount
	} else {
		return -parsedAmount
	}
}

export const serializeJournalEntryAmount = (amount: number): string => {
	const leadingSign = amount < 0 ? '' : '+'
	return `${leadingSign}${amount.toFixed(2)}`
}

export const calculateNetAmount = (_entry: JournalEntry): number => {

	return 0;

	// TODO fix after ZK-132

	// const children = (entry as JournalEntry).children ?? []
	// const netAmount: number = children.reduce(
	// 	(acc: number, child) => {
	// 		return acc + (parseJournalEntryAmount(child.amount) ?? 0)
	// 	},
	// 	parseJournalEntryAmount(entry.amount) ?? 0
	// )

	// return netAmount
}

export const makeJournalEntry = (formData: Partial<CreateJournalEntry>, journalId: string): JournalEntry => {
	const now = new Date().toISOString()

	// TODO fix after ZK-132

	const entry: JournalEntry = {
		_id: formData._id ?? generateJournalEntryId(),
		kind: 'zisk:entry',
		createdAt: now,
		date: formData.date ?? dayjs(now).format('YYYY-MM-DD'),
		memo: formData.memo ?? '',
		journalId,
		children: formData.children ?? [],
	}

	return entry
}

// export const makeTentativeJournalEntry = (
// 	formData: Partial<TentativeJournalEntry>,
// 	journalId: string,
// 	date: string,
// 	recurrenceOf: string
// ): TentativeJournalEntry => {
// 	const now = new Date().toISOString()

// 	const entry: TentativeJournalEntry = {
// 		_id: formData._id ?? generateJournalEntryId(),
// 		kind: 'TENTATIVE_JOURNAL_ENTRY_RECURRENCE',
// 		createdAt: now,
// 		date,
// 		amount: formData.amount || '',
// 		memo: formData.memo || '',
// 		recurrenceOf,
// 		journalId,
// 	}

// 	return entry
// }


export const makeEntryArtifact = (formData: CreateEntryArtifact, journalId: string): EntryArtifact => {
	const now = new Date().toISOString()

	const entryArtifact: EntryArtifact = {
		_id: formData._id ?? generateTaskId(),
		kind: 'zisk:artifact',
		originalFileName: formData.originalFileName ?? '',
    	contentType: formData.contentType ?? '',
		size: formData.size ?? 0,
		createdAt: now,
		journalId,
	}

	return entryArtifact
}

export const makeEntryTask = (formData: Partial<CreateEntryTask>): EntryTask => {
	const newTask: EntryTask = {
		_id: formData._id ?? generateTaskId(),
		kind: 'zisk:task',
		memo: formData.memo ?? '',
		completedAt: formData.completedAt ?? null,
	}

	return newTask
}

export const journalEntryHasTasks = (entry: JournalEntry): boolean => {
	if (!entry.tasks) {
		return false
	}
	return entry.tasks.length > 0
}
export const journalEntryHasTags = (entry: JournalEntry): boolean => {
	if (!entry.tagIds) {
		return false
	}
	return entry.tagIds.length > 0
}

/**
 * @deprecated infer directly via `kind` discriminator
 */
export const documentIsJournalEntry = (doc: ZiskDocument): doc is JournalEntry => {
	return 'kind' in doc && doc.kind === 'zisk:entry'
}

/**
 * @deprecated infer directly via `kind` discriminator
 */
export const documentIsCategory = (doc: ZiskDocument): doc is Category => {
	return 'kind' in doc && doc.kind === 'zisk:category'
}

export const generateRandomAvatar = (): Avatar => {
	const primaryColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
	return {
		...DEFAULT_AVATAR,
		primaryColor,
	}
}

export const enumerateJournalEntryStatuses = (
	entry: JournalEntry
): { parent: Set<StatusVariant>, children: Set<StatusVariant> } => {
	return {
		parent: new Set<StatusVariant>(entry.statusIds ?? []),
		children: new Set<StatusVariant>(entry.children?.flatMap((child) => child.statusIds ?? []) ?? []),
	}
}

function* generateDatesFromRecurringCadence(startDate: dayjs.Dayjs, cadence: RecurringCadence) {
	const { frequency, interval } = cadence
	let date = startDate.clone()

	function getWeekDates(day: dayjs.Dayjs): Record<DayOfWeek, dayjs.Dayjs> {
		const weekday = day.day() // 0 (Sunday) to 6 (Saturday)
		const startOfWeek = day.subtract(weekday, 'day') // Back up to Sunday
	  
		const result: Record<DayOfWeek, dayjs.Dayjs> = {} as Record<DayOfWeek, dayjs.Dayjs>
	  
		Object.values(DayOfWeek.enum).forEach((label, index) => {
			result[label] = startOfWeek.add(index, 'day');
		})
	  
		return result;
	  }

	switch (frequency) {
		case CadenceFrequency.enum.D:
			for(;;) {
				date = date.add(interval, 'days')
				yield date
			}
		case CadenceFrequency.enum.Y:
			for(;;) {
				date = date.add(interval, 'years')
				yield date
			}
		case CadenceFrequency.enum.W:
			for(;;) {
				const weekDates = getWeekDates(date.add(interval, 'weeks'))
				for (let i in cadence.days) {
					date = weekDates[cadence.days[i]]
					yield date
				}
			}
		case CadenceFrequency.enum.M:
			if ('day' in cadence.on) {
				for(;;) {
					date = date.startOf('month').add(interval, 'months')
					if (cadence.on.day <= date.daysInMonth()) {
						yield date.date(cadence.on.day)
					}	
				}
			} else if ('week' in cadence.on) {
				const dayOfWeek = date.day() // 0 = Sunday, 1 = Monday
				let month: dayjs.Dayjs = date.clone()
				let nthWeekday: dayjs.Dayjs | undefined

				for(;;) {
					month = month.add(interval, 'months').startOf('month')
					nthWeekday = getNthWeekdayOfMonthFromDate(month, dayOfWeek, cadence.on.week)
					if (nthWeekday) {
						date = nthWeekday
						yield date
					}
				}
			}
	}
}

/**
 * Given a set of nonspecific entries that are known to 
 */
export const getRecurrencesForDateView = (
	_recurringEntries: Record<string, JournalEntry>, _dateView: DateView
): Record<string, Set<string>> => {

	return {};

	// TODO fix after ZK-132

	// const { startDate: dateViewAbsoluteStart, endDate: dateViewAbsoluteEnd } = getAbsoluteDateRangeFromDateView(dateView)

	// // Filter all entry IDs which definitely don't occur in the given date view
	// const filteredEntryIds: string[] = []
	// Object.entries(recurringEntries).forEach(([entryId, entry]) => {
	// 	if (
	// 		dateViewAbsoluteStart
	// 		&& entry.recurs?.ends
	// 		&& 'onDate' in entry.recurs.ends
	// 		&& entry.recurs.ends.onDate
	// 		&& dayjs(entry.recurs.ends.onDate).isBefore(dateViewAbsoluteStart, 'day')
	// 	) {
	// 		// Entry recurrency ends before date view begins
	// 		return
	// 	} else if (!entry.recurs?.cadence) {
	// 		return
	// 	} else if (
	// 		entry.recurs.ends
	// 		&& 'afterNumOccurrences' in entry.recurs.ends
	// 		&& entry.recurs.ends.afterNumOccurrences === 1
	// 	) {
	// 		return
	// 	}

	// 	filteredEntryIds.push(entryId)
	// })

	// const recurrenceDates: Record<string, Set<string>> = Object.fromEntries(
	// 	filteredEntryIds.map((entryId) => {
	// 		return [entryId, new Set<string>([])]
	// 	})
	// )
	// filteredEntryIds.forEach((entryId) => {
	// 	const recurrency: EntryRecurrency = recurringEntries[entryId].recurs as EntryRecurrency
	// 	const startDate = dayjs(recurringEntries[entryId].date!)
	// 	const dateGenerator = generateDatesFromRecurringCadence(startDate, recurrency.cadence)
	// 	let date: dayjs.Dayjs | void
	// 	let numRemainingOccurrences: number = Infinity
	// 	let endDate: dayjs.Dayjs | undefined = undefined
	// 	if (recurrency.ends) {
	// 		if ('afterNumOccurrences' in recurrency.ends) {
	// 			numRemainingOccurrences = recurrency.ends.afterNumOccurrences
	// 		} else if ('onDate' in recurrency.ends) {
	// 			endDate = dayjs(recurrency.ends.onDate)
	// 		}
	// 	}

	// 	do {
	// 		date = dateGenerator.next().value
	// 		numRemainingOccurrences -= 1
	// 		if (date) {
	// 			if (date.isAfter(dateViewAbsoluteEnd, 'days')) {
	// 				return
	// 			} else if (date.isBefore(dateViewAbsoluteStart, 'days')) {
	// 				continue
	// 			} else {
	// 				recurrenceDates[entryId].add(date.format('YYYY-MM-DD'))
	// 			}
	// 		}
	// 	} while (
	// 		numRemainingOccurrences > 0
	// 		&& date
	// 		&& (!endDate || date.isBefore(endDate, 'days'))
	// 		// && maxRecurrenceCount-- > 0
	// 	)
	// })
	// return recurrenceDates
}
