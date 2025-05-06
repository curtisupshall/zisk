import z from "zod"
import { DocumentSchema } from "@/schema/support/orm/Document"
import { Mixin } from "../support/orm/Mixin"

export const [CreateEntryArtifact, EntryArtifact] = DocumentSchema.new(
    {
        kind: z.literal('zisk:artifact'),
    },
    z.object({
        originalFileName: z.string(),
        size: z.number(),
        contentType: z.string(),
        'description': z.string().optional(),
    }),
    z.object({
        ...Mixin.derived.timestamps(),
        ...Mixin.derived.belongsToJournal(),
    }),
)

export type EntryArtifact = z.output<typeof EntryArtifact>
export type CreateEntryArtifact = z.output<typeof CreateEntryArtifact>
