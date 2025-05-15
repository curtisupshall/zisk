import z from "zod"
import { Document } from "../support/orm/Document"
import { Mixin } from "../support/orm/Mixin"
import { UserSettings } from "../models/UserSettings"

export const [CreateZiskMeta, ZiskMeta] = Document.fromSchemas([
	{ 
		kind: z.literal('zisk:meta'),
		activeJournalId: z.string().nullable(),
		userSettings: UserSettings,
	},
	{
		...Mixin.derived.timestamps(),
	}
])
export type CreateZiskMeta = z.output<typeof CreateZiskMeta>
export type ZiskMeta = z.output<typeof ZiskMeta>
