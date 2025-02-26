import {
	Account,
	Category,
	CreateAccount,
	CreateCategory,
	CreateEntryTag,
	CreateJournalMeta,
	DocumentMetadata,
	EntryTag,
	JournalEntry,
	JournalMeta,
	ZiskDocument,
	ZiskSettings,
} from '@/types/schema'
import { getDatabaseClient, initializeDatabaseClient } from './client'
import { generateAccountId, generateCategoryId, generateEntryTagId, generateJournalId } from '@/utils/id'
import { getOrCreateZiskMeta } from './queries'
import JSZip from 'jszip'
import FileSaver from 'file-saver'
import dayjs from 'dayjs'

const db = getDatabaseClient()

export const createJournalEntry = async (formData: JournalEntry): Promise<JournalEntry> => {
	const now = new Date().toISOString()

	const newJournalEntry: JournalEntry = {
		...formData,
		type: 'JOURNAL_ENTRY',
		createdAt: now,
	}

	await db.put(newJournalEntry)
	return newJournalEntry
}

export const updateJournalEntry = async (formData: JournalEntry) => {
	delete formData._rev

	const existingRecord = await db.get(formData._id)
	const now = new Date().toISOString()

	const docs: object[] = [
		{
			...existingRecord,
			...formData,
			updatedAt: now,
		},
	]

	return db.bulkDocs(docs)
}

export const updateJournalEntryChildren = async (children: JournalEntry[]) => {
	const now = new Date().toISOString()

	const updatedChildren = children.map((child) => {
		delete child._rev
		return {
			...child,
			updatedAt: now,
		}
	})

	return db.bulkDocs(updatedChildren)
}

export const deleteJournalEntry = async (journalEntryId: string): Promise<JournalEntry> => {
	const record = await db.get(journalEntryId)
	await db.remove(record)
	return record as JournalEntry
}

export const undeleteJournalEntry = async (journalEntry: JournalEntry) => {
	await db.put(journalEntry)
}

export const createCategory = async (formData: CreateCategory, journalId: string) => {
	const category: Category = {
		...formData,
		type: 'CATEGORY',
		_id: generateCategoryId(),
		createdAt: new Date().toISOString(),
		updatedAt: null,
		journalId,
	}

	return db.put(category)
}

export const createAccount = async (formData: CreateAccount, journalId: string) => {
	const category: Account = {
		...formData,
		type: 'ACCOUNT',
		_id: generateAccountId(),
		createdAt: new Date().toISOString(),
		updatedAt: null,
		journalId,
	}

	return db.put(category)
}

export const updateAccount = async (formData: Account) => {
	return db.put({
		...formData,
		updatedAt: new Date().toISOString(),
	})
}

export const deleteRecord = async <T extends DocumentMetadata>(record: T): Promise<T> => {
	const fetchedRecord = await db.get(record._id)
	await db.remove(fetchedRecord)
	return fetchedRecord as unknown as T
}

export const restoreRecord = async <T extends DocumentMetadata>(record: T): Promise<void> => {
	const newRecord = { ...record }
	delete record._rev;
	await db.put(newRecord)
}

export const updateCategory = async (formData: Category) => {
	return db.put({
		...formData,
		updatedAt: new Date().toISOString(),
	})
}

export const deleteCategory = async (categoryId: string): Promise<Category> => {
	const record = await db.get(categoryId)
	await db.remove(record)
	return record as Category
}

export const undeleteCategory = async (category: Category) => {
	await db.put(category)
}

export const createJournal = async (journal: CreateJournalMeta): Promise<JournalMeta> => {
	const newJournal: JournalMeta = {
		...journal,
		type: 'JOURNAL',
		journalVersion: 1,
		_id: generateJournalId(),
		createdAt: new Date().toISOString(),
		updatedAt: null,
	}

	await db.put(newJournal)

	return newJournal
}

export const updateActiveJournal = async (journalId: string) => {
	const meta = await getOrCreateZiskMeta()
	await db.put({
		...meta,
		activeJournalId: journalId,
	})
}

export const getAllJournalObjects = async (journalId: string): Promise<ZiskDocument[]> => {
	const result = await db.find({
		selector: {
			journalId,
		},
	})
	return result.docs as ZiskDocument[]
}

export const resetJournal = async (journalId: string) => {
	const docs = await getAllJournalObjects(journalId)
	const deleted = docs.map((doc) => ({ ...doc, _deleted: true }))
	return db.bulkDocs(deleted)
}

export const deleteJournal = async (journalId: string) => {
	await resetJournal(journalId)
	const record = await db.get(journalId)
	await db.remove(record)
}

export const createEntryTag = async (formData: CreateEntryTag, journalId: string) => {
	const tag: EntryTag = {
		label:  formData.label,
		description: formData.description,
		type: 'ENTRY_TAG',
		_id: generateEntryTagId(),
		createdAt: new Date().toISOString(),
		updatedAt: null,
		journalId,
	}

	return db.put(tag)
}

export const exportJournal = async (journalId: string) => {
	const journal: JournalMeta = await db.get(journalId)
	const journalObjects = await getAllJournalObjects(journalId)

	const zip = new JSZip()
	zip.file('journal.json', JSON.stringify(journal))
	zip.file('objects.json', JSON.stringify(journalObjects))

	const content = await zip.generateAsync({ type: 'blob' })
	const fileName = [
		journal.journalName,
		'_',
		dayjs().format('YYYY-MM-DD_HH-mm-ss'),
		'.ZISK'
	].join('')
	FileSaver.saveAs(content, fileName);
}

export const importJournal = async (archive: File) => {
	// Unzip archive file using JSZip
	const zip = new JSZip();
	const loadedZip = await zip.loadAsync(archive);
	const journalFile = loadedZip.files['journal.json'];
	const objectsFile = loadedZip.files['objects.json'];

	const journal = JSON.parse(await journalFile.async("string"));
	const journalObjects = JSON.parse(await objectsFile.async("string"));

	const documents = [
		journal,
		...journalObjects
	].map((doc: any) => {
		delete doc._rev
		return doc
	})

	await db.bulkDocs(documents)
}

export const updateSettings = async (settings: Partial<ZiskSettings>) => {
	return getOrCreateZiskMeta().then((meta) => {
		return db.put({
			...meta,
			settings: {
				...meta.settings,
				...settings,
			},
		})
	})
}

export const __purgeAllLocalDatabases = async () => {
	const db = getDatabaseClient()
	if (!db) {
		return
	}
	await db.destroy()
	initializeDatabaseClient()
}
