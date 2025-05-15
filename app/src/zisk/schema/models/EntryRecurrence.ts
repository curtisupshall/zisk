import { Model } from "@/schema/support/orm/Model";
import { RecurringCadence } from "@/schema/support/recurrence";
import { z } from "zod";

export const [CreateEntryRecurrency, EntryRecurrency] = Model.fromSchema({
    kind: z.literal('zisk:recurrence'),

    /**
     * Encodes the cadence of the recurrence, e.g. every four weeks,
     * every month, etc. If this value is undefined, then the it
     * will inherit the cadence of the last recurrence.
     */
    cadence: RecurringCadence,

    ends: z.union([
        z.object({
            onDate: z.string(),
        }),
        z.object({
            afterNumOccurrences: z.number()
        })
    ]).nullable(),

    'exceptions': z.object({
        onDates: z.array(z.string()).optional(),
        afterDate: z.string().optional(),
    }).optional(),
})
export type CreateEntryRecurrency = z.output<typeof CreateEntryRecurrency>;
export type EntryRecurrency = z.output<typeof EntryRecurrency>;
