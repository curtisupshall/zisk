import { z } from 'zod'

export const IdentifierMetadata = z.object({
	_id: z.string(),
})

export type IdentifierMetadata = z.output<typeof IdentifierMetadata>

export const BelongsToJournal = z.object({
    journalId: z.string(),
})

export const AttachmentMeta = z.object({
	content_type: z.string(),
	data: z.instanceof(File),
})

export type AttachmentMeta = z.output<typeof AttachmentMeta>

export const DocumentMetadata = IdentifierMetadata.merge(
	z.object({
		_rev: z.string().optional(),
		_deleted: z.boolean().optional(),
		_attachments: z.record(z.string(), AttachmentMeta).optional(),
		type: z.string(),
	})
)

export type DocumentMetadata = z.output<typeof DocumentMetadata>

export const AvatarVariant = z.enum(['TEXT', 'PICTORIAL', 'IMAGE'])

export const Avatar = z.object({
	content: z.string(),
	variant: AvatarVariant,
	primaryColor: z.string(),
	secondaryColor: z.string().optional().nullable(),
})

export type Avatar = z.output<typeof Avatar>

export const CreateCategory = z.object({
	label: z.string(),
	description: z.string(),
	avatar: Avatar,
})

export type CreateCategory = z.output<typeof CreateCategory>

export const Category = DocumentMetadata.merge(BelongsToJournal).merge(CreateCategory).merge(
	z.object({
		type: z.literal('CATEGORY'),
		createdAt: z.string(),
		updatedAt: z.string().nullable().optional(),
	})
)

export type Category = z.output<typeof Category>

const amountValidationPattern = /[-+]?\d{1,3}(,\d{3})*(\.\d+)?/;

const AmountRecord = z.object({
	amount: z.string()
		.regex(amountValidationPattern, 'A valid amount is required')
})

export type AmountRecord = z.output<typeof AmountRecord>

export const EntryArtifact = DocumentMetadata.merge(BelongsToJournal).merge(
	z.object({
		type: z.literal('ENTRY_ARTIFACT'),
		originalFileName: z.string(),
		size: z.number(),
		contentType: z.string(),
		description: z.string().optional(),
		createdAt: z.string(),
		updatedAt: z.string().nullable().optional(),
	})
)

export type EntryArtifact = z.output<typeof EntryArtifact>

export const EntryTask = DocumentMetadata.merge(BelongsToJournal).merge(
	z.object({
		type: z.literal('ENTRY_TASK'),
		description: z.string(),
		completedAt: z.string().nullable(),
	})
)

export type EntryTask = z.output<typeof EntryTask>

export const BaseJournalEntry = DocumentMetadata.merge(BelongsToJournal).merge(AmountRecord).merge(
	z.object({
		type: z.literal('JOURNAL_ENTRY'),
		memo: z.string(),
		tagIds: z.array(z.string()).optional(),
		categoryIds: z.array(z.string()).optional(),
		accountId: z.string().optional(),
		date: z.string().optional(),
		notes: z.string().optional(),
		tasks: z.array(EntryTask).optional(),
		artifacts: z.array(EntryArtifact).optional(),
		paymentMethodId: z.string().nullable().optional(),
		relatedEntryIds: z.array(z.string()).optional(),
		createdAt: z.string(),
		updatedAt: z.string().nullable().optional(),
	})
)

export type BaseJournalEntry = z.output<typeof BaseJournalEntry>

export const JournalEntry = BaseJournalEntry.merge(
	z.object({
		children: z.array(BaseJournalEntry).optional(),
	})
)

export const ChildJournalEntry = BaseJournalEntry.merge(z.object({
	parentEntry: JournalEntry,
	type: z.literal('CHILD_JOURNAL_ENTRY'),
}))

export type ChildJournalEntry = z.output<typeof ChildJournalEntry>

export type JournalEntry = z.output<typeof JournalEntry>

export const CreateQuickJournalEntry = AmountRecord.merge(z.object({
	memo: z.string().optional(),
	categoryIds: z.array(z.string()).optional(),
}))

export type CreateQuickJournalEntry = z.output<typeof CreateQuickJournalEntry>

export const CreateEntryTag = z.object({
	label: z.string(),
	description: z.string(),
})

export type CreateEntryTag = z.output<typeof CreateEntryTag>

export const ReservedTagKey = z.enum([
	'FLAGGED',
	'NEEDS_REVIEW',
	'WAS_REVIEWED',
])

export type ReservedTagKey = z.output<typeof ReservedTagKey>

export const ReservedTag = CreateEntryTag.merge(z.object({
	_id: ReservedTagKey,
	type: z.literal('RESERVED_TAG'),
	archived: z.boolean().optional(),
}))

export type ReservedTag = z.output<typeof ReservedTag>

export const EntryTag = DocumentMetadata.merge(BelongsToJournal).merge(CreateEntryTag).merge(
	z.object({
		type: z.literal('ENTRY_TAG'),
		createdAt: z.string(),
		updatedAt: z.string().nullable(),
	})
)

export type EntryTag = z.output<typeof EntryTag>

export const CreateAccount = z.object({
	label: z.string(),
	description: z.string(),
	avatar: Avatar,
})

export type CreateAccount = z.output<typeof CreateAccount>

export const Account = DocumentMetadata.merge(BelongsToJournal).merge(CreateCategory).merge(
	z.object({
		type: z.literal('ACCOUNT'),
		createdAt: z.string(),
		updatedAt: z.string().nullable().optional(),
	})
)

export type Account = z.output<typeof Account>

export const CloudZiskServer = z.object({
	serverType: z.literal('ZISK_CLOUD'),
	user: z.object({
		username: z.string(),
		avatar: Avatar,
	})
})

export type CloudZiskServer = z.output<typeof CloudZiskServer>

export const NoneZiskServer = z.object({
	serverType: z.literal('NONE')
})

export type NoneZiskServer = z.output<typeof NoneZiskServer>

export const CustomZiskServer = CloudZiskServer.merge(z.object({
	serverType: z.literal('CUSTOM'),
	serverUrl: z.string(),
	serverName: z.string().optional(),
	serverNickname: z.string().optional(),
}))

export type CustomZiskServer = z.output<typeof CustomZiskServer>

export const ZiskServer = z.union([
	CustomZiskServer,
	NoneZiskServer,
	CloudZiskServer,
])

export type ZiskServer = z.output<typeof ZiskServer>

export const CouchDbSyncingStrategy = z.object({
	strategyType: z.literal('COUCH_DB'),
	couchDbUrl: z.string(),
})

export type CouchDbSyncingStrategy = z.output<typeof CouchDbSyncingStrategy>

export const LocalSyncingStrategy = z.object({
	strategyType: z.literal('LOCAL'),
})

export type LocalSyncingStrategy = z.output<typeof LocalSyncingStrategy>

export const ServerSyncingStrategy = z.object({
	strategyType: z.literal('CUSTOM_SERVER_OR_ZISK_CLOUD'),
	// serverUrl: z.string(),
})

export type ServerSyncingStrategy = z.output<typeof ServerSyncingStrategy>

export const SyncingStrategy = z.union([
	LocalSyncingStrategy,
	ServerSyncingStrategy,
	CouchDbSyncingStrategy,
])

export type SyncingStrategy = z.output<typeof SyncingStrategy>

export const ZiskSettings = z.object({
	appearance: z.object({
		// theme: z.union([z.literal('LIGHT'), z.literal('DARK'), z.literal('SYSTEM')]),
		// animations: z.union([z.literal('NORMAL'), z.literal('FAST'), z.literal('OFF')]),
		menuExpanded: z.boolean(),
	}),
	server: ZiskServer,
	syncingStrategy: SyncingStrategy,
})

export type ZiskSettings = z.output<typeof ZiskSettings>

export const ZiskMeta = IdentifierMetadata.merge(
	z.object({
		type: z.literal('ZISK_META'),
		activeJournalId: z.string().nullable(),
		settings: ZiskSettings,
		createdAt: z.string(),
	})
)

export type ZiskMeta = z.output<typeof ZiskMeta>

export const CreateJournalMeta = z.object({
	journalName: z.string().min(1, 'Journal name must be at least 1 character'),
	avatar: Avatar,
})

export type CreateJournalMeta = z.output<typeof CreateJournalMeta>

export const JournalMeta = IdentifierMetadata.merge(CreateJournalMeta).merge(
	z.object({
		type: z.literal('JOURNAL'),
		journalVersion: z.number(),
		createdAt: z.string(),
		updatedAt: z.string().nullable(),
	})
)

export type JournalMeta = z.output<typeof JournalMeta>

export const ZiskDocument = z.union([
	Category,
	JournalEntry,
	ChildJournalEntry,
	EntryTag
])

export type ZiskDocument = z.output<typeof ZiskDocument>
