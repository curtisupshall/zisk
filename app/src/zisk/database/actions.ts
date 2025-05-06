import { getDatabaseClient, initializeDatabaseClient } from './client'
import { generateAccountId, generateCategoryId, generateEntryTagId, generateJournalId } from '@/utils/id'
import { ARBITRARY_MAX_FIND_LIMIT, getOrCreateZiskMeta } from './queries'
import JSZip from 'jszip'
import FileSaver from 'file-saver'
import dayjs from 'dayjs'
import { calculateNetAmount } from '@/utils/journal'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { Category, CreateCategory } from '@/schema/documents/Category'
import { Account, CreateAccount } from '@/schema/documents/Account'
import { _Document, IdentifierMetadata } from '@/schema/support/orm/Document'
import { CreateJournal, Journal } from '@/schema/documents/Journal'
import { ZiskDocument } from '@/schema/union/ZiskDocument'
import { CreateEntryTag, EntryTag } from '@/schema/documents/EntryTag'
import { UserSettings } from '@/schema/models/UserSettings'
// import { MigrationEngine } from './migrate'

const db = getDatabaseClient()

export const createJournalEntry = async (formData: JournalEntry): Promise<JournalEntry> => {
	const now = new Date().toISOString()

	const newJournalEntry: JournalEntry = {
		...formData,
		// parsedNetAmount: calculateNetAmount(formData),
		kind: 'zisk:entry',
		createdAt: now,
	}

	await db.put(newJournalEntry)
	return newJournalEntry
}

export const updateJournalEntry = async <T extends JournalEntry>(formData: T) => {
	delete formData._rev

	const existingRecord = await db.get(formData._id)
	const now = new Date().toISOString()

	const docs: object[] = [
		{
			...existingRecord,
			...formData,
			parsedNetAmount: calculateNetAmount(formData),
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

export const deleteJournalEntry = async <T extends JournalEntry>(entryId: string): Promise<T> => {

	// TODO check if it's a tentative entry; If so, add an exception in the recurring entry's exception field.

	const record = await db.get(entryId)
	await db.remove(record)
	return record as T
}

export const undeleteJournalEntry = async (journalEntry: JournalEntry) => {
	await db.put(journalEntry)
}

export const createCategory = async (formData: CreateCategory, journalId: string) => {
	const category: Category = {
		...formData,
		kind: 'zisk:category',
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
		kind: 'zisk:account',
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

export const deleteRecord = async <T extends _Document>(record: T): Promise<T> => {
	const fetchedRecord = await db.get(record._id)
	await db.remove(fetchedRecord)
	return fetchedRecord as unknown as T
}

export const restoreRecord = async <T extends _Document>(record: T): Promise<void> => {
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

export const createJournal = async (journal: CreateJournal): Promise<Journal> => {
	const newJournal: Journal = {
		...journal,
		kind: 'zisk:journal',
		// journalVersion: MigrationEngine.latestVersion,
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
		limit: ARBITRARY_MAX_FIND_LIMIT,
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
		kind: 'zisk:tag',
		_id: generateEntryTagId(),
		createdAt: new Date().toISOString(),
		updatedAt: null,
		journalId,
	}

	return db.put(tag)
}

export const exportJournal = async (journalId: string, compress: boolean) => {
	const journal: Journal = await db.get(journalId)
	const journalObjects = [...await getAllJournalObjects(journalId), journal];
	console.log('Exporting ' + String(journalObjects.length) + ' journal object(s)...')

	const baseFileName = [
		journal.journalName,
		'_',
		dayjs().format('YYYY-MM-DD_HH-mm-ss'),
		'.json'
	].join('')

	let fileName: string;
	let content: Blob | string;

	if (compress) {
		const zip = new JSZip()
		zip.file(baseFileName, JSON.stringify(journalObjects))
		fileName = [baseFileName, '.zip'].join('')
		content = await zip.generateAsync({ type: 'blob' })
	} else {
		fileName = baseFileName
		content = new Blob([JSON.stringify(journalObjects)], { type: 'application/json' })
	}

	FileSaver.saveAs(content, fileName);
}

export const importJournal = async (archive: File): Promise<[Journal, ZiskDocument[]]> => {
	const compressed = archive.name.endsWith('.zip')
	let journalJsonString: string;

	if (compressed) {
		// Unzip archive file using JSZip
		const zip = new JSZip();
		const loadedZip = await zip.loadAsync(archive);
		const journalFile = Object.values(loadedZip.files)[0]
		journalJsonString = await journalFile.async("string")
	} else {
		// File is a basic .json file
		journalJsonString = await archive.text()
	}

	let journalObjects: ZiskDocument[]
	try {
		journalObjects = JSON.parse(journalJsonString)
	} catch (err) {
		throw new Error('Failed to parse journal JSON: ' + err)
	}

	const journal = journalObjects.find((obj: ZiskDocument) => 'kind' in obj && obj.kind === 'zisk:journal') as Journal | undefined
	if (!journal) {
		throw new Error('No JOURNAL metadata found in the imported file.')
	}

	console.log(`Importing journal ${journal.journalName} having ${String(journalObjects.length)} object(s)...`)

	const documents = journalObjects.map((doc: any) => {
		const cloned: any = { ...doc }
		delete cloned._rev // remove _rev if present
		return cloned
	})

	await db.bulkDocs(documents)
	return [journal, documents]
}

export const updateSettings = async (newSettings: Partial<UserSettings>) => {
	return getOrCreateZiskMeta().then((meta) => {
		return db.put({
			...meta,
			userSettings: {
				...meta.userSettings,
				...newSettings,
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
