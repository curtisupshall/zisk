import { JournalEntry, JournalMeta, JournalVersion, ZiskDocument } from "@/types/schema";
import { Migration, MigrationRun } from "@/database/migrate";

export default class AddParseAmountToEntries implements Migration {
    public version = JournalVersion.ADD_PARSE_AMOUNT_TO_ENTRIES
    public description = 'Adds the parseAmount field to journal entries'
    public run: MigrationRun = async (records) => {
        return records.reduce((acc: ZiskDocument[], record: ZiskDocument) => {
            if (record.kind === 'zisk:journal') {
                return [record, ...acc]
            }
            if (record.kind === 'JOURNAL_ENTRY') {
                let parsedNetAmount: number | undefined = undefined
                if (record.amount) {
                    parsedNetAmount = AddParseAmountToEntries.calculateNetAmount(record)
                }
                record.parsedNetAmount = parsedNetAmount
            }
            acc.push(record)
            return acc
        }, []) as [JournalMeta, ...ZiskDocument[]]
    }

    private static parseJournalEntryAmount(amount: string): number | undefined {
        const sanitizedAmount = String(amount).replace(/[^0-9.-]/g, '');
        if (!amount || !sanitizedAmount) {
            return undefined;
        }
    
        const parsedAmount = parseFloat(sanitizedAmount)
        if (isNaN(parsedAmount)) {
            return parsedAmount
        } else if (amount.startsWith('+')) {
            return parsedAmount
        } else {
            return -parsedAmount
        }
    }

    private static calculateNetAmount(entry: JournalEntry): number {
        const children: JournalEntry[] = entry.children ?? []
        const netAmount: number = children.reduce(
            (acc: number, child) => {
                return acc + (AddParseAmountToEntries.parseJournalEntryAmount(child.amount) ?? 0)
            },
            AddParseAmountToEntries.parseJournalEntryAmount(entry.amount) ?? 0
        )
    
        return netAmount
    }
}
