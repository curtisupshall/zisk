import z from "zod"
import { DocumentSchema } from "../support/orm/Document"
import { Mixin } from "../support/orm/Mixin"

export const [CreateEntryTag, EntryTag] = DocumentSchema.new(
    { 
        kind: z.literal('zisk:tag'),
    },
    z.object({
        label: z.string(),
        description: z.string(),
    }),
    z.object({
        ...Mixin.derived.timestamps(),
        ...Mixin.derived.belongsToJournal(),
    }),
)

export type CreateEntryTag = z.output<typeof CreateEntryTag>
export type EntryTag = z.output<typeof EntryTag>
