import { Account } from '@/schema/documents/Account'
import { Category } from '@/schema/documents/Category'
import { EntryTag } from '@/schema/documents/EntryTag'
import { Journal } from '@/schema/documents/Journal'
import { DefinedUseQueryResult } from '@tanstack/react-query'
import { createContext } from 'react'

export interface JournalContext {
	activeJournalId: string | null;
	setActiveJournalId: (journalId: string | null) => void;
	queries: {
		accounts: DefinedUseQueryResult<Record<string, Account>, Error>
		categories: DefinedUseQueryResult<Record<string, Category>, Error>
		journals: DefinedUseQueryResult<Record<string, Journal>, Error>
		tags: DefinedUseQueryResult<Record<string, EntryTag>, Error>
	},
}

export const JournalContext = createContext<JournalContext>({} as JournalContext)
