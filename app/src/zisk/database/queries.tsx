import {
	Account,
	AmountRange,
	Category,
	EntryArtifact,
	EntryTag,
	JOURNAL_ENTRY,
	JournalEntry,
	JournalMeta,
	JournalSlice,
	TRANSFER_ENTRY,
	ZiskMeta,
} from '@/types/schema'
import { getDatabaseClient } from './client'
import { makeDefaultZiskMeta } from '@/utils/database'
import { getAbsoluteDateRangeFromDateView } from '@/utils/date'
import { enumerateFilters, transformAmountRange } from '@/utils/filtering'
import { JournalFilterSlot } from '@/components/journal/ribbon/JournalFilterPicker'

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
				{ kind: 'ACCOUNT' },
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

export const getRecurringJournalOrTransferEntries = async (
	journalId: string,
	kind: JOURNAL_ENTRY | TRANSFER_ENTRY
): Promise<Record<string, JournalEntry>> => {
	const selectorClauses: any[] = [
		{ kind },
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
				{ kind: 'ENTRY_TAG' },
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

export const getJournals = async (): Promise<Record<JournalMeta['_id'], JournalMeta>> => {
	const result = await db.find({
		selector: {
			kind: 'zisk:journal',
		},
		limit: ARBITRARY_MAX_FIND_LIMIT,
	})

	return Object.fromEntries((result.docs as unknown as JournalMeta[]).map((journal) => [journal._id, journal]))
}

export const getArtifacts = async (journalId: string): Promise<Record<EntryArtifact['_id'], EntryArtifact>> => {
	const result = await db.find({
		selector: {
			'$and': [
				{ kind: 'ENTRY_ARTIFACT' },
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
