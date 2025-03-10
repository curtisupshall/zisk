import {
	Category,
	ChildJournalEntry,
	EntryArtifact,
	EntryTask,
	ReservedTagKey,
	ZiskDocument,
	type JournalEntry,
} from '@/types/schema'
import { generateJournalEntryId, generateTaskId } from './id'
import dayjs from 'dayjs'
import { RESERVED_TAGS } from '@/constants/tags'

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
	if (!entry.categoryIds?.length) {
		delete entry.categoryIds
	}
	if (!entry.notes) {
		delete entry.notes
	}

	return {
		...entry,
	}
}

export const parseJournalEntryAmount = (amount: string): number => {
	const sanitizedAmount = String(amount).replace(/[^0-9.-]/g, '');
	if (!amount || !sanitizedAmount) {
		return 0;
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

export const calculateNetAmount = (entry: JournalEntry): number => {
	const children: JournalEntry[] = entry.children ?? []
	const netAmount: number = children.reduce(
		(acc: number, child) => {
			return acc + parseJournalEntryAmount(child.amount)
		},
		parseJournalEntryAmount(entry.amount)
	)

	return netAmount
}

export const makeJournalEntry = (formData: Partial<JournalEntry>, journalId: string): JournalEntry => {
	const now = new Date().toISOString()

	const journalEntry: JournalEntry = {
		_id: formData._id ?? generateJournalEntryId(),
		type: 'JOURNAL_ENTRY',
		createdAt: now,
		date: formData.date || dayjs(now).format('YYYY-MM-DD'),
		amount: formData.amount || '',
		memo: formData.memo || '',
		journalId,
	}

	return journalEntry
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

export const journalEntryHasTags = (entry: JournalEntry): boolean => {
	const entryTagIds = entry.tagIds ?? []
	return entryTagIds.length > 0 && entryTagIds.some((tagId) => !ReservedTagKey.options.includes(tagId as ReservedTagKey))
}

export const journalEntryIsFlagged = (entry: JournalEntry): boolean => {
	const entryTagIds = entry.tagIds ?? []
	return entryTagIds.some((tagId) => tagId === RESERVED_TAGS.FLAGGED._id)
}

export const documentIsJournalEntryOrChildJournalEntry = (doc: ZiskDocument): doc is JournalEntry | ChildJournalEntry => {
	return ['JOURNAL_ENTRY', 'CHILD_JOURNAL_ENTRY'].includes(doc.type)
}

export const documentIsChildJournalEntry = (doc: ZiskDocument): doc is ChildJournalEntry => {
	return doc.type === 'CHILD_JOURNAL_ENTRY'
}

export const documentIsCategory = (doc: ZiskDocument): doc is Category => {
	return doc.type === 'CATEGORY'
}
