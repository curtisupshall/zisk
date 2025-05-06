import { Account } from '@/schema/documents/Account'
import { Category } from '@/schema/documents/Category'
import { EntryTag } from '@/schema/documents/EntryTag'
import { Journal } from '@/schema/documents/Journal'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { DefinedUseQueryResult } from '@tanstack/react-query'
import { createContext } from 'react'
import { UseFormReturn } from 'react-hook-form'

export interface JournalContext {
	getJournalsQuery: DefinedUseQueryResult<Record<Journal['_id'], Journal>, Error>
	getCategoriesQuery: DefinedUseQueryResult<Record<Category['_id'], Category>, Error>
	getAccountsQuery: DefinedUseQueryResult<Record<Account['_id'], Account>, Error>
	getEntryTagsQuery: DefinedUseQueryResult<Record<EntryTag['_id'], EntryTag>, Error>
	showJournalEntryModal: boolean
	journal: Journal | null
	journalEntryForm: UseFormReturn<JournalEntry>
	closeEntryModal: () => void
	createJournalEntry: (value?: Partial<JournalEntry>) => void
	editJournalEntry: (entry: JournalEntry) => void
	openJournalManager: () => void
	closeActiveJournal: () => void
}

export const JournalContext = createContext<JournalContext>({} as JournalContext)
