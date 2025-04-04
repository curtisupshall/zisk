import {
	Avatar,
	CadenceFrequency,
	Category,
	ChildJournalEntry,
	DateView,
	DayOfWeek,
	EntryArtifact,
	EntryRecurrency,
	EntryTask,
	RecurringCadence,
	ReservedTagKey,
	TransferEntry,
	ZiskDocument,
	type JournalEntry,
} from '@/types/schema'
import { generateJournalEntryId, generateTaskId } from './id'
import dayjs from 'dayjs'
import { RESERVED_TAGS } from '@/constants/tags'
import { DEFAULT_AVATAR } from '@/components/pickers/AvatarPicker'
import { getAbsoluteDateRangeFromDateView } from './date'

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

export const calculateNetAmount = (entry: JournalEntry | TransferEntry): number => {
	const children: JournalEntry[] = (entry.type === 'TRANSFER_ENTRY' ? null : entry.children) ?? []
	const netAmount: number = children.reduce(
		(acc: number, child) => {
			return acc + (parseJournalEntryAmount(child.amount) ?? 0)
		},
		parseJournalEntryAmount(entry.amount) ?? 0
	)

	return netAmount
}

export const makeJournalEntry = (formData: Partial<JournalEntry>, journalId: string): JournalEntry => {
	const now = new Date().toISOString()

	const entry: JournalEntry = {
		_id: formData._id ?? generateJournalEntryId(),
		type: 'JOURNAL_ENTRY',
		createdAt: now,
		date: formData.date || dayjs(now).format('YYYY-MM-DD'),
		amount: formData.amount || '',
		memo: formData.memo || '',
		journalId,
	}

	return entry
}

export const makeTransferEntry = (formData: Partial<TransferEntry>, journalId: string): TransferEntry => {
	const now = new Date().toISOString()

	const entry: TransferEntry = {
		_id: formData._id ?? generateJournalEntryId(),
		type: 'TRANSFER_ENTRY',
		createdAt: now,
		date: formData.date || dayjs(now).format('YYYY-MM-DD'),
		amount: formData.amount || '',
		memo: formData.memo || '',
		journalId,
	}

	return entry
}

export const makeEntryArtifact = (formData: Partial<EntryArtifact>, journalId: string): EntryArtifact => {
	const now = new Date().toISOString()

	const entryArtifact: EntryArtifact = {
		_id: formData._id ?? generateTaskId(),
		type: 'ENTRY_ARTIFACT',
		originalFileName: formData.originalFileName ?? '',
    	contentType: formData.contentType ?? '',
		size: formData.size ?? 0,
		createdAt: now,
		journalId,
	}

	return entryArtifact
}

export const makeEntryTask = (formData: Partial<EntryTask>, journalId: string): EntryTask => {
	// const now = new Date().toISOString()

	const newTask: EntryTask = {
		_id: formData._id ?? generateTaskId(),
		type: 'ENTRY_TASK',
		description: formData.description ?? '',
		completedAt: formData.completedAt ?? null,
		journalId,
	}

	return newTask
}

export const journalEntryHasTasks = (entry: JournalEntry | TransferEntry): boolean => {
	if (!entry.tasks) {
		return false
	}
	return entry.tasks.length > 0
}

const tagIdBelongsToReservedTag = (tagId: string): tagId is ReservedTagKey => {
	return ReservedTagKey.options.includes(tagId as ReservedTagKey)
}

/**
 * Determines if an entry has any user-defined tags, namely any entry tag which
 * isn't a Reserved Tag.
 */
export const journalEntryHasUserDefinedTags = (entry: JournalEntry | TransferEntry): boolean => {
	const entryTagIds = entry.tagIds ?? []
	return entryTagIds.length > 0 && entryTagIds.some((tagId) => !tagIdBelongsToReservedTag(tagId))
}

/**
 * @deprecated Use enumerateJournalEntryReservedTag instead.
 */
export const journalEntryIsFlagged = (entry: JournalEntry | TransferEntry): boolean => {
	const entryTagIds = entry.tagIds ?? []
	return entryTagIds.some((tagId) => tagId === RESERVED_TAGS.FLAGGED._id)
}

/**
 * @deprecated Use enumerateJournalEntryReservedTag instead.
 */
export const journalEntryHasApproximateTag = (entry: JournalEntry | TransferEntry): boolean => {
	const entryTagIds = entry.tagIds ?? []
	return entryTagIds.some((tagId) => tagId === RESERVED_TAGS.APPROXIMATE._id)
}

export const documentIsJournalEntryOrChildJournalEntry = (doc: ZiskDocument): doc is JournalEntry | ChildJournalEntry => {
	return ['JOURNAL_ENTRY', 'CHILD_JOURNAL_ENTRY'].includes(doc.type)
}

export const journalOrTransferEntryIsTransferEntry = (doc: JournalEntry | TransferEntry): doc is TransferEntry => {
	return doc.type === 'TRANSFER_ENTRY'
}

export const documentIsChildJournalEntry = (doc: ZiskDocument): doc is ChildJournalEntry => {
	return doc.type === 'CHILD_JOURNAL_ENTRY'
}

export const documentIsCategory = (doc: ZiskDocument): doc is Category => {
	return doc.type === 'CATEGORY'
}

export const generateRandomAvatar = (): Avatar => {
	const primaryColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
	return {
		...DEFAULT_AVATAR,
		primaryColor,
	}
}

export const enumerateJournalEntryReservedTag = (
	entry: JournalEntry | TransferEntry
): { parent: Set<ReservedTagKey>, children: Set<ReservedTagKey> } => {
	const parentTagIds: string[] = entry.tagIds ?? []
	let childTagIds: string[]
	if (documentIsJournalEntryOrChildJournalEntry(entry)) {
		childTagIds = entry.children?.flatMap((child) => child.tagIds ?? []) ?? []
	} else {
		childTagIds = []
	}
	return {
		parent: new Set<ReservedTagKey>(parentTagIds.filter(tagIdBelongsToReservedTag)),
		children: new Set<ReservedTagKey>(childTagIds.filter(tagIdBelongsToReservedTag)),
	}
}

function* generateDatesFromRecurringCadence(startDate: dayjs.Dayjs, cadence: RecurringCadence) {
	const { frequency, interval } = cadence
	let date = startDate.clone()

	function getWeekDates(day: dayjs.Dayjs): Record<DayOfWeek, dayjs.Dayjs> {
		const weekday = day.day() // 0 (Sunday) to 6 (Saturday)
		const startOfWeek = day.subtract(weekday, 'day') // Back up to Sunday
	  
		const result: Record<DayOfWeek, dayjs.Dayjs> = {} as Record<DayOfWeek, dayjs.Dayjs>
	  
		Object.values(DayOfWeek.Enum).forEach((label, index) => {
			result[label] = startOfWeek.add(index, 'day');
		})
	  
		return result;
	  }

	switch (frequency) {
		case CadenceFrequency.Enum.D:
			for(;;) {
				date = date.add(interval, 'days')
				yield date
			}
		case CadenceFrequency.Enum.Y:
			for(;;) {
				date = date.add(interval, 'years')
				yield date
			}
		case CadenceFrequency.Enum.W:
			for(;;) {
				const weekDates = getWeekDates(date.add(interval, 'weeks'))
				for (let day in cadence.days) {
					date = weekDates[day as DayOfWeek]
					yield date
				}
			}
	}
}

export const getRecurrencesForDateView = (
	recurringEntries: Record<string, JournalEntry | TransferEntry>, dateView: DateView
): Record<string, Set<string>> => {
	const { startDate: dateViewAbsoluteStart, endDate: dateViewAbsoluteEnd } = getAbsoluteDateRangeFromDateView(dateView)

	// Filter all entry IDs which definitely don't occur in the given date view
	const filteredEntryIds: string[] = []
	Object.entries(recurringEntries).forEach(([entryId, entry]) => {
		if (
			dateViewAbsoluteStart
			&& entry.recurs?.ends
			&& 'onDate' in entry.recurs.ends
			&& entry.recurs.ends.onDate
			&& dayjs(entry.recurs.ends.onDate).isBefore(dateViewAbsoluteStart, 'day')
		) {
			// Entry recurrency ends before date view begins
			return
		} else if (!entry.recurs?.cadence) {
			return
		} else if (
			entry.recurs.ends
			&& 'afterNumOccurrences' in entry.recurs.ends
			&& entry.recurs.ends.afterNumOccurrences === 1
		) {
			return
		}

		filteredEntryIds.push(entryId)
	})

	const recurrenceDates: Record<string, Set<string>> = Object.fromEntries(
		filteredEntryIds.map((entryId) => {
			return [entryId, new Set<string>([])]
		})
	)
	filteredEntryIds.forEach((entryId) => {
		const recurrency: EntryRecurrency = recurringEntries[entryId].recurs as EntryRecurrency
		const startDate = dayjs(recurringEntries[entryId].date!)
		const dateGenerator = generateDatesFromRecurringCadence(startDate, recurrency.cadence)
		let date: dayjs.Dayjs | void
		let numRemainingOccurrences: number = Infinity
		let endDate: dayjs.Dayjs | undefined = undefined
		if (recurrency.ends) {
			if ('afterNumOccurrences' in recurrency.ends) {
				numRemainingOccurrences = recurrency.ends.afterNumOccurrences
			} else if ('onDate' in recurrency.ends) {
				endDate = dayjs(recurrency.ends.onDate)
			}
		}

		do {
			date = dateGenerator.next().value
			numRemainingOccurrences -= 1
			if (date) {
				if (date.isAfter(dateViewAbsoluteEnd, 'days')) {
					return
				} else if (date.isBefore(dateViewAbsoluteStart, 'days')) {
					continue
				} else {
					recurrenceDates[entryId].add(date.format('YYYY-MM-DD'))
				}
			}
		} while (numRemainingOccurrences > 0 && date && (!endDate || date.isBefore(endDate, 'days')));
	})
	return recurrenceDates
}
