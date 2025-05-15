import z from "zod";
import { Model } from "../support/orm/Model";

export const [CreateQuickJournalEntry, QuickJournalEntry] = Model.fromSchema({
	kind: z.literal('zisk:quickentry'),
	amount: z.string(),
	memo: z.string().optional(),
	categoryId: z.string().optional(),
});
export type CreateQuickJournalEntry = z.output<typeof CreateQuickJournalEntry>;
export type QuickJournalEntry = z.output<typeof QuickJournalEntry>;
