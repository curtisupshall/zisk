import { relations } from "drizzle-orm";
import { CategoryTable, JournalEntryTable, TransactionMethodTable, TransactionTable } from "./tables";

export const JournalEntryTableRelations = relations(JournalEntryTable, ({ one, many }) => {
    return {
        transactions: many(TransactionTable),
        category: one(CategoryTable, {
            fields: [JournalEntryTable.categoryId],
            references: [CategoryTable.categoryId]
        }),
    }
});

export const TransactionTableRelations = relations(TransactionTable, ({ one, many }) => {
    return {
        journalEntry: one(JournalEntryTable, {
            fields: [TransactionTable.journalEntryId],
            references: [JournalEntryTable.journalEntryId]
        }),
        method: one(TransactionMethodTable, {
            fields: [TransactionTable.transactionMethodId],
            references: [TransactionMethodTable.transactionMethodId]
        }),
    }
});
