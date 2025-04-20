import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

const POUCH_DB_NAME = '__zisk__db'

PouchDB.plugin(PouchDBFind)

let db: PouchDB.Database | null = null

export const initializeDatabaseClient = () => {
	db = new PouchDB(POUCH_DB_NAME)
	return  db
}

export const getDatabaseClient = () => {
	if (!db) {
		return initializeDatabaseClient()
	}
	return db
}
