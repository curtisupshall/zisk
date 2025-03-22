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
		.regex(amountValidationPattern, 'A valid amount is required'),
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

// CadenceFrequency enum using Zod
export const CadenceFrequency = z.enum([
	'D', // Daily
	'W', // Weekly
	'M', // Monthly
	'Y', // Yearly
]);
export type CadenceFrequency = z.infer<typeof CadenceFrequency>;

// Week number enum using Zod
export const WeekNumber = z.enum(['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'LAST']);
export type WeekNumber = z.infer<typeof WeekNumber>;

// Days of week enum using Zod
export const DayOfWeek = z.enum([
	'SU',
	'MO',
	'TU',
	'WE',
	'TH',
	'FR',
	'SA',
]);
export type DayOfWeek = z.infer<typeof DayOfWeek>;

export const MonthlyCadence = z.object({
  frequency: z.literal(CadenceFrequency.enum.M),
  on: z.union([
    z.object({
      // Monthly on Last Thursday, First Monday, Second Monday, etc.
      week: WeekNumber,
    }),
    z.object({
      // Monthly on the 12th day
      day: z.number().min(1).max(31),
    }),
  ]),
});

export type MonthlyCadence = z.output<typeof MonthlyCadence>

export const DailyCadence = z.object({
  frequency: z.literal(CadenceFrequency.enum.D),
});

export type DailyCadence = z.output<typeof DailyCadence>

export const YearlyCadence = z.object({
  frequency: z.literal(CadenceFrequency.enum.Y),
});

export type YearlyCadence = z.output<typeof YearlyCadence>

export const WeeklyCadence = z.object({
  frequency: z.literal(CadenceFrequency.enum.W),
  days: z.array(DayOfWeek),
});

export type WeeklyCadence = z.output<typeof WeeklyCadence>


export const RecurringCadence = z.object({
  interval: z.number(), // Every _ days/months/weeks
}).and(
  z.union([
    MonthlyCadence,
    WeeklyCadence,
    DailyCadence,
    YearlyCadence,
  ])
);

export type RecurringCadence = z.output<typeof RecurringCadence>

export const EntryRecurrence = DocumentMetadata.merge(BelongsToJournal).merge(
	z.object({
		type: z.literal('ENTRY_RECURRENCE'),
		/**
		 * Encodes the cadence of the recurrence, e.g. every four weeks,
		 * every month, etc. If this value is undefined, then the it
		 * will inherit the cadence of the last recurrence.
		 */
		cadence: RecurringCadence.optional(),
		/**
		 * The journal entry ID of the previous recurrence. If this is the
		 * first recurrence, this value is null.
		 */
		lastRecurrence: z.string().nullable()
	})
)

export type EntryRecurrence = z.output<typeof EntryRecurrence>;

export const TRANSFER_ENTRY = z.literal('TRANSFER_ENTRY')

export const JOURNAL_ENTRY = z.literal('JOURNAL_ENTRY')

export const CommonEntryAttributes = DocumentMetadata.merge(BelongsToJournal).merge(AmountRecord).merge(
	z.object({
		type: z.union([TRANSFER_ENTRY, JOURNAL_ENTRY]),
		memo: z.string(),
		tagIds: z.array(z.string()).optional(),
		categoryIds: z.array(z.string()).optional(),
		sourceAccountId: z.string().optional(),
		date: z.string().optional(),
		notes: z.string().optional(),
		tasks: z.array(EntryTask).optional(),
		artifacts: z.array(EntryArtifact).optional(),
		recurs: EntryRecurrence.optional(),
		relatedEntryIds: z.array(z.string()).optional(),
		createdAt: z.string(),
		updatedAt: z.string().nullable().optional(),
	})
)

export type CommonEntryAttributes = z.output<typeof CommonEntryAttributes>

export const TransferEntry = CommonEntryAttributes.merge(
	z.object({
		type: TRANSFER_ENTRY,
		destAccountId: z.string().optional(),
	})
)

export type TransferEntry = z.output<typeof TransferEntry>

export const BaseJournalEntry = CommonEntryAttributes.merge(
	z.object({
		type: z.literal('JOURNAL_ENTRY'),
	})
)

export type BaseJournalEntry = z.output<typeof BaseJournalEntry>

export const JournalEntry = BaseJournalEntry.merge(
	z.object({
		children: z.array(BaseJournalEntry).optional(),
		parsedNetAmount: z.number().optional(),
	})
)

export type JournalEntry = z.output<typeof JournalEntry>

export const JournalOrTransferEntry = z.union([JournalEntry, TransferEntry])

export type JournalOrTransferEntry = z.output<typeof JournalOrTransferEntry>

export const ChildJournalEntry = BaseJournalEntry.merge(z.object({
	parentEntry: JournalEntry,
	type: z.literal('CHILD_JOURNAL_ENTRY'),
}))

export type ChildJournalEntry = z.output<typeof ChildJournalEntry>

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

export const AnnualPeriod = z.object({
	year: z.number().min(1900).max(2999)
})

export type AnnualPeriod = z.output<typeof AnnualPeriod>


export const MonthlyPeriod = AnnualPeriod.extend({
	month: z.number().min(1).max(12)
})

export type MonthlyPeriod = z.output<typeof MonthlyPeriod>

export const WeeklyPeriod = MonthlyPeriod.extend({
	day: z.number().min(1).max(31)
})

export type WeeklyPeriod = z.output<typeof WeeklyPeriod>

export const DatePeriod = z.union([AnnualPeriod, MonthlyPeriod, WeeklyPeriod])

export type DatePeriod = z.output<typeof DatePeriod>

export const DateRange = z.object({
	before: z.string().optional(),
	after: z.string().optional(),
})

export type DateRange = z.output<typeof DateRange>

export const DateView = z.union([DatePeriod, DateRange])

export type DateView = z.output<typeof DateView>

export enum DateViewSymbol {
	WEEKLY = 'w',
	MONTHLY = 'm',
	YEARLY = 'y',
	RANGE = 'r',
}

export const AmountRange = z.object({
	gt: z.string().optional(),
	lt: z.string().optional(),
	absolute: z.boolean().optional(),
})

export type AmountRange = z.output<typeof AmountRange>

export const JournalSlice = z.object({
	dateView: DateView,
	tagIds: z.array(z.string()).optional(),
	reservedTags: z.array(ReservedTagKey).optional(),
	categoryIds: z.array(z.string()).optional(),
	amount: AmountRange.optional(),
	hasAttachments: z.boolean().optional(),
})

export type JournalSlice = z.output<typeof JournalSlice>

export const BasicAnalytics = z.object({
	/**
	 * Absolute sum of all accrued gains
	 */
	sumGain: z.number(),
	/**
	 * Absolute sum of all incurred losses
	 */
	sumLoss: z.number(),
})

export type BasicAnalytics = z.output<typeof BasicAnalytics>

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

export enum JournalVersion {
    INITIAL_VERSION = '2025-03-01',
    '2025-03-02' = '2025-03-02',
}

export const JournalMeta = IdentifierMetadata.merge(CreateJournalMeta).merge(
	z.object({
		type: z.literal('JOURNAL'),
		journalVersion: z.nativeEnum(JournalVersion),
		createdAt: z.string(),
		updatedAt: z.string().nullable(),
	})
)

export type JournalMeta = z.output<typeof JournalMeta>

export const ZiskDocument = z.union([
	Category,
	JournalEntry,
	ChildJournalEntry,
	EntryTag,
	JournalMeta,
])

export type ZiskDocument = z.output<typeof ZiskDocument>
