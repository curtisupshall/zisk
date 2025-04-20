import { Category, JournalMeta, JournalVersion, ZiskDocument } from "@/types/schema";
import { Migration, MigrationRun } from "@/database/migrate";

export default class SingleCategory implements Migration {
    public version = JournalVersion.REPLACE_CATEGORY_IDS
    public description = 'Replaced categoryIds with categoryId for journal entries'
    public run: MigrationRun = async (records) => {
        const categories = SingleCategory.getJournalCategories(records)

        return records.reduce((acc: ZiskDocument[], record: ZiskDocument) => {
            if (record.kind === 'zisk:journal') {
                return [record, ...acc]
            }
            if (record.kind === 'JOURNAL_ENTRY') {
                const categoryId = ((record as any).categoryIds as undefined | string[])?.find((categoryId) => Boolean(categories[categoryId]))
                if (categoryId) {
                    record.categoryId = categoryId
                    delete (record as any).categoryIds
                }
            }
            acc.push(record)
            return acc
        }, []) as [JournalMeta, ...ZiskDocument[]]
    }

    private static getJournalCategories(records: ZiskDocument[]): Record<string, Category> {
        return records.reduce((acc: Record<string, Category>, record: ZiskDocument) => {
            if (record.kind === 'zisk:category') {
                if (!(record._id in acc)) {
                    acc[record._id] = record
                }
            }
            return acc
        }, {})
    }
}
