import {
	Category,
	RichJournalEntryMetadata,
	EntryArtifact,
	EntryTag,
	JournalEntry,
	JournalMeta,
	ZiskMeta,
} from '@/types/schema'
import { getDatabaseClient } from './client'
import { JournalEditorView } from '@/components/journal/JournalEditor'
import dayjs from 'dayjs'
import { enhanceJournalEntry } from '@/utils/journal'
import { ZISK_META_KEY } from '@/constants/database'
import { createDefaultZiskMeta } from '@/utils/database'

const db = getDatabaseClient()

export const getCategories = async (journalId: string): Promise<Record<Category['_id'], Category>> => {
	const result = await db.find({
		selector: {
			'$and': [
				{ type: 'CATEGORY' },
				{ journalId },
			],
		},
	})

	return Object.fromEntries((result.docs as Category[]).map((category) => [category._id, category]))
}

export const getJournalEntries = async (
	view: JournalEditorView,
	date: string,
	journalId: string
): Promise<Record<JournalEntry['_id'], JournalEntry>> => {
	const selectorClauses: any[] = [
		{ type: 'JOURNAL_ENTRY' },
		{ journalId },
	]
	if (view !== 'all') {
		const startDate = dayjs(date).startOf(view).format('YYYY-MM-DD')
		const endDate = dayjs(date).endOf(view).format('YYYY-MM-DD')
		selectorClauses.push({
			date: {
				$gte: startDate,
				$lte: endDate,
			}
		});
	}

	const selector = {
		'$and': selectorClauses,
	}

	const result = await db.find({
		selector
	})

	return Object.fromEntries((result.docs as JournalEntry[]).map((entry) => [entry._id, entry]))
}

export interface GetEnhancedJournalEntriesResults {
	entries: Record<JournalEntry['_id'], JournalEntry>
	richJournalEntryMetadataRecords: Record<JournalEntry['_id'], RichJournalEntryMetadata>
}

export const getEnhancedJournalEntries = async (
	view: JournalEditorView,
	date: string,
	journalId: string
): Promise<GetEnhancedJournalEntriesResults> => {
	const journalEntries = await getJournalEntries(view, date, journalId)
	const allArtifacts = await getArtifacts(journalId)

	const result = Object.fromEntries(
		Object.values(journalEntries).reduce((acc: [JournalEntry['_id'], RichJournalEntryMetadata][], entry) => {
			if (entry.parentEntryId) {
				return acc
			}

			const children: JournalEntry[] = (entry.childEntryIds ?? [])
				.map((childId) => journalEntries[childId])
				.filter(Boolean)

			const artifacts: EntryArtifact[] = (entry.artifactIds ?? [])
				.map((artifactId) => allArtifacts[artifactId])
				.filter(Boolean)

			acc.push([entry._id, enhanceJournalEntry(entry, children, artifacts)])

			return acc
		}, [])
	)

	return {
		entries: journalEntries,
		richJournalEntryMetadataRecords: result,
	}
}

export const getEntryTags = async (journalId: string): Promise<Record<EntryTag['_id'], EntryTag>> => {
	const result = await db.find({
		selector: {
			'$and': [
				{ type: 'ENTRY_TAG' },
				{ journalId },
			],
		},
	})

	return Object.fromEntries((result.docs as EntryTag[]).map((tag) => [tag._id, tag]))
}

export const getOrCreateZiskMeta = async (): Promise<ZiskMeta> => {
	try {
		// Attempt to fetch the meta document by its key
		const meta = (await db.get(ZISK_META_KEY)) as ZiskMeta
		return meta
	} catch (error: any) {
		if (error.status === 404) {
			// If not found, create a default meta document
			const meta: ZiskMeta = { ...createDefaultZiskMeta(), _id: ZISK_META_KEY }
			await db.put(meta)
			return meta
		}
		// Re-throw other errors
		throw error
	}
}

export const getJournals = async (): Promise<Record<JournalMeta['_id'], JournalMeta>> => {
	const result = await db.find({
		selector: {
			type: 'JOURNAL',
		},
	})

	return Object.fromEntries((result.docs as unknown as JournalMeta[]).map((journal) => [journal._id, journal]))
}

export const getArtifacts = async (journalId: string): Promise<Record<EntryArtifact['_id'], EntryArtifact>> => {
	const result = await db.find({
		selector: {
			'$and': [
				{ type: 'ENTRY_ARTIFACT' },
				{ journalId },
			],
		},
	})

	return Object.fromEntries((result.docs as EntryArtifact[]).map((artifact) => [artifact._id, artifact]))
}

export const getJournalEntryChildren = async (entryId: JournalEntry['_id']): Promise<JournalEntry[]> => {
	const result = await db.find({
		selector: {
			'$and': [
				{ type: 'JOURNAL_ENTRY' },
				{ parentEntryId: entryId },
			],
		},
	})

	return result.docs as JournalEntry[]
}

export const getJournalEntryArtifacts = async (entryId: JournalEntry['_id']): Promise<EntryArtifact[]> => {
	const entry = (await db.get(entryId)) as JournalEntry
	const artifactIds = entry.artifactIds ?? []

	const result = await db.find({
		selector: {
			'$and': [
				{ type: 'ENTRY_ARTIFACT' },
				{
					_id: {
						$in: artifactIds,
					}
				},
			],
		},
	})

	return result.docs as EntryArtifact[]
}
