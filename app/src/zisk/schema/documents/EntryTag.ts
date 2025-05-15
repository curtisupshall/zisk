import z from "zod"
import { Document } from "../support/orm/Document"
import { Mixin } from "../support/orm/Mixin"

export const [CreateEntryTag, EntryTag] = Document.fromSchemas([
    { 
        kind: z.literal('zisk:tag'),
        label: z.string(),
        description: z.string(),
    },
    {
        ...Mixin.derived.timestamps(),
        ...Mixin.derived.belongsToJournal(),
    }
])
export type CreateEntryTag = z.output<typeof CreateEntryTag>
export type EntryTag = z.output<typeof EntryTag>
