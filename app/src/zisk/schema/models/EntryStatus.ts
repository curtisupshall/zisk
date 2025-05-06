import z from "zod"
import { ModelSchema } from "../support/orm/Model"
import { IdentifierMetadata } from "../support/orm/Document";

enum Status {
    FLAGGED = 'zisk.status.flagged',
    NEEDS_REVIEW = 'zisk.status.needsreview',
    WAS_REVIEWED = 'zisk.status.wasreview',
    APPROXIMATE = 'zisk.status.approximate',
    PENDING = 'zisk.status.pending',
}

export const StatusVariant = z.enum(Status)

export type StatusVariant = z.output<typeof StatusVariant>

export const EntryStatus = ModelSchema.from(
    {
        kind: z.literal('zisk:status')
    },
    z.object({
        _id: StatusVariant,
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
);
export type EntryStatus = z.output<typeof EntryStatus>;
