import z from "zod"
import { DocumentSchema } from "../support/orm/Document"
import { Mixin } from "../support/orm/Mixin"
import { UserSettings } from "../models/UserSettings"

export const [CreateZiskMeta, ZiskMeta] = DocumentSchema.new(
	{ 
		kind: z.literal('zisk:meta'),
	},
	z.object({
		activeJournalId: z.string().nullable(),
		userSettings: UserSettings,
	}),
	z.object({
		...Mixin.derived.timestamps(),
	}),
)

export type CreateZiskMeta = z.output<typeof CreateZiskMeta>
export type ZiskMeta = z.output<typeof ZiskMeta>
