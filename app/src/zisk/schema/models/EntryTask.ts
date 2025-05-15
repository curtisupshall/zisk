import z from "zod"
import { Model } from "../support/orm/Model"
import { Mixin } from "../support/orm/Mixin"

export const [CreateEntryTask, EntryTask] = Model.fromSchemas([
    {
        kind: z.literal('zisk:task'),
        memo: z.string(),
        completedAt: z.string().nullable(),
    },
    {
        ...Mixin.derived.natural._id(),
    }
])


export type CreateEntryTask = z.output<typeof CreateEntryTask>
export type EntryTask = z.output<typeof EntryTask>
