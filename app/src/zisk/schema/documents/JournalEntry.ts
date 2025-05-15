import { Document } from "@/schema/support/orm/Document";
import z from "zod";
import { Mixin } from "../support/orm/Mixin";
import { EntryArtifact } from "./EntryArtifact";
import { Figure } from "../models/Figure";
import { StatusVariant } from "../models/EntryStatus";
import { EntryTask } from "../models/EntryTask";

// const BaseJournalEntry = 

const [CreateJournalEntry, BaseJournalEntry] = Document.fromSchemas([
    {
        kind: z.literal('zisk:entry'),
        ...Mixin.intrinsic.natural._ephemeral({
            amount: z.string()
        }),
        date: z.string(),
        memo: z.string(),
        tagIds: z.array(z.string()).optional(),
        categoryId: z.string().optional(),
        sourceAccountId: z.string().optional(),
        transfer: z.object({
            destAccountId: z.string()
        }).optional(),
        notes: z.string().optional(),
        tasks: z.array(EntryTask).optional(),
        statusIds: z.array(StatusVariant).optional(),
        artifacts: z.array(EntryArtifact).optional(),
        relatedEntryIds: z.array(z.string()).optional(),
    },
    {
    ...Mixin.derived.timestamps(),
    ...Mixin.derived.belongsToJournal(),
    ...z.object(
        Mixin.derived.natural._derived({
            figure: Figure.optional(),
        })).partial().shape,
    }
])

export const JournalEntry = BaseJournalEntry.extend({
    children: z.array(BaseJournalEntry)
})

export type CreateJournalEntry = z.output<typeof CreateJournalEntry>
export type JournalEntry = z.output<typeof JournalEntry>
