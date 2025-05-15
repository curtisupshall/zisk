import z from "zod"
import { Model } from "@/schema/support/orm/Model"
import { Mixin } from "@/schema/support/orm/Mixin"

enum Status {
    FLAGGED = 'zisk.status.flagged',
    NEEDS_REVIEW = 'zisk.status.needsreview',
    WAS_REVIEWED = 'zisk.status.wasreview',
    APPROXIMATE = 'zisk.status.approximate',
    PENDING = 'zisk.status.pending',
}

export const StatusVariant = z.enum(Status)

export type StatusVariant = z.output<typeof StatusVariant>

export const [CreateEntryStatus, EntryStatus] = Model.fromSchema({
    kind: z.literal('zisk:status'),
    ...Mixin.derived.natural._id(),
    label: z.string(),
    description: z.string(),
    /**
     * The Reserved Tag is not selectable within the app.
     */
    disabled: z.boolean(),
    /**
     * The Reserved Tag is no longer used.
     */
    archived: z.boolean(),
})

export type CreateEntryStatus = z.output<typeof CreateEntryStatus>;
export type EntryStatus = z.output<typeof EntryStatus>;
