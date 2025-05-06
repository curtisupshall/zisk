import z from "zod"
import { DocumentSchema } from "../support/orm/Document"

export const [CreateEntryTask, EntryTask] = DocumentSchema.new(
    {
        kind: z.literal('zisk:task'),
    },
    z.object({
        memo: z.string(),
        completedAt: z.string().nullable(),
    }),
    z.object({}),
)

export type CreateEntryTask = z.output<typeof CreateEntryTask>
export type EntryTask = z.output<typeof EntryTask>
