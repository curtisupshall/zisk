import z from "zod";
import { Account } from "../documents/Account";
import { Category } from "../documents/Category";
import { EntryArtifact } from "../documents/EntryArtifact";
import { EntryTag } from "../documents/EntryTag";
import { Journal } from "../documents/Journal";
import { JournalEntry } from "../documents/JournalEntry";
import { ZiskMeta } from "../documents/ZiskMeta";

export const ZiskDocument = z.discriminatedUnion(
    'kind',
    [
        Account,
        Category,
        EntryArtifact,
        EntryTag,
        Journal,
        JournalEntry,
        ZiskMeta,
    ]
)
export type ZiskDocument = z.infer<typeof ZiskDocument>
