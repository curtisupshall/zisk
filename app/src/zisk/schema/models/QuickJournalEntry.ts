import z from "zod";
import { ModelSchema } from "../support/orm/Model";

export const CreateQuickJournalEntry = ModelSchema.from(
	{
		kind: z.literal('zisk:quickentry')
	},
	z.object({
		amount: z.string(),
		memo: z.string().optional(),
		categoryId: z.string().optional(),
	})
);
export type CreateQuickJournalEntry = z.output<typeof CreateQuickJournalEntry>;
