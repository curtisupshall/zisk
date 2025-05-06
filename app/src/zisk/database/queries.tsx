import { getDatabaseClient } from './client'
import { makeDefaultZiskMeta } from '@/utils/database'
import { getAbsoluteDateRangeFromDateView } from '@/utils/date'
import { enumerateFilters, transformAmountRange } from '@/utils/filtering'
import { JournalFilterSlot } from '@/components/journal/ribbon/JournalFilterPicker'
import { Category } from '@/schema/documents/Category'
import { Account } from '@/schema/documents/Account'
import { AmountRange, JournalSlice } from '@/schema/support/slice'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { EntryTag } from '@/schema/documents/EntryTag'
import { ZiskMeta } from '@/schema/documents/ZiskMeta'
import { Journal } from '@/schema/documents/Journal'
import { EntryArtifact } from '@/schema/documents/EntryArtifact'

const db = getDatabaseClient()

export const ARBITRARY_MAX_FIND_LIMIT = 10000 as const;

export const getCategories = async (journalId: string): Promise<Record<Category['_id'], Category>> => {
	const result = await db.find({
		selector: {
			'$and': [
				{ kind: 'zisk:category' },
				{ journalId },
			],
		},
		limit: ARBITRARY_MAX_FIND_LIMIT,
	})

	return Object.fromEntries((result.docs as Category[]).map((category) => [category._id, category]))
}

export const getAccounts = async (journalId: string): Promise<Record<Account['_id'], Account>> => {
	const result = await db.find({
		selector: {
			'$and': [
				{ kind: 'zisk:account' },
				{ journalId },
			],
		},
		limit: ARBITRARY_MAX_FIND_LIMIT,
	})

	return Object.fromEntries((result.docs as Account[]).map((account) => [account._id, account]))
}

export const getJournalEntries = async (
	journalSlice: JournalSlice,
	journalId: string,
): Promise<Record<string, JournalEntry>> => {
	const selectorClauses: any[] = [
		{ kind: 'zisk:entry' },
		{ journalId },
	]
	
	// Date Range
	const { startDate, endDate } = getAbsoluteDateRangeFromDateView(journalSlice.dateView)
	if (startDate || endDate) {
		selectorClauses.push({
			date: {
				$gte: startDate?.format('YYYY-MM-DD'),
				$lte: endDate?.format('YYYY-MM-DD'),
			}
		});
	}

	const filters = enumerateFilters(journalSlice)

	// Categories
	if (filters.has(JournalFilterSlot.CATEGORIES)) {
		selectorClauses.push({
			categoryIds: {
				$in: journalSlice.categoryIds
			}
		})
	}

	// Amount range
	if (filters.has(JournalFilterSlot.AMOUNT)) {
		const { greaterThan, lessThan } = transformAmountRange(journalSlice.amount as AmountRange)
		selectorClauses.push({
			parsedNetAmount: {
				$gt: greaterThan,
				$lt: lessThan,
			}
		})
	}

	const selector = {
		'$and': selectorClauses,
	}

	const result = await db.find({
		selector,
		limit: ARBITRARY_MAX_FIND_LIMIT,
	})

	const entries = Object.fromEntries((result.docs as JournalEntry[]).map((entry) => [entry._id, entry])) as Record<string, JournalEntry>

	return entries
}

export const getRecurringEntries = async (
	journalId: string,
): Promise<Record<string, JournalEntry>> => {
	const selectorClauses: any[] = [
		{ kind: 'zisk:entry' },
		{ journalId },
		{ recurs: {
			$exists: true,
		}}
	]

	const selector = {
		'$and': selectorClauses,
	}

	const result = await db.find({
		selector,
		limit: ARBITRARY_MAX_FIND_LIMIT,
	})

	const entries = Object.fromEntries((result.docs as JournalEntry[]).map((entry) => [entry._id, entry])) as Record<string, JournalEntry>
	return entries
}

export const getEntryTags = async (journalId: string): Promise<Record<EntryTag['_id'], EntryTag>> => {
	const result = await db.find({
		selector: {
			'$and': [
				{ kind: 'zisk:tag' },
				{ journalId },
			],
		},
		limit: ARBITRARY_MAX_FIND_LIMIT,
	})

	return Object.fromEntries((result.docs as EntryTag[]).map((tag) => [tag._id, tag]))
}

export const getOrCreateZiskMeta = async (): Promise<ZiskMeta> => {
	// Attempt to fetch the meta document by its key
	const results = await db.find({
		selector: {
			kind: 'ZISK_META',
		},
	})
	if (results.docs.length > 0) {
		return results.docs[0] as unknown as ZiskMeta
	}

	const meta: ZiskMeta = { ...makeDefaultZiskMeta() }
	await db.put(meta)
	return meta
}

export const getJournals = async (): Promise<Record<Journal['_id'], Journal>> => {
	const result = await db.find({
		selector: {
			kind: 'zisk:journal',
		},
		limit: ARBITRARY_MAX_FIND_LIMIT,
	})

	return Object.fromEntries((result.docs as unknown as Journal[]).map((journal) => [journal._id, journal]))
}

export const getArtifacts = async (journalId: string): Promise<Record<EntryArtifact['_id'], EntryArtifact>> => {
	const result = await db.find({
		selector: {
			'$and': [
				{ kind: 'zisk:artifact' },
				{ journalId },
			],
		},
		limit: ARBITRARY_MAX_FIND_LIMIT,
	})

	return Object.fromEntries((result.docs as EntryArtifact[]).map((artifact) => [artifact._id, artifact]))
}

export const getJournalEntryWithAttachments = async (journalEntryId: string): Promise<JournalEntry> => {
	const entry = await db.get(journalEntryId, { attachments: true, binary: true }) as JournalEntry
	return entry
}
