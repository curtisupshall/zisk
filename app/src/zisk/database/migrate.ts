import AddParseAmountToEntries from "./migrations/2025-03-02_AddParseAmountToEntries";
import { JournalMeta, JournalVersion, ZiskDocument } from "@/types/schema";
import SingleCategory from "./migrations/2025-03-23_SingleCategory";

export type MigrationRun = (records: ZiskDocument[]) => Promise<[JournalMeta, ...ZiskDocument[]]>

export abstract class Migration {
    public abstract readonly version: JournalVersion
    public abstract readonly description: string
    public abstract readonly run: MigrationRun
}

export class MigrationEngine {
    public static latestVersion: JournalVersion = JournalVersion.REPLACE_CATEGORY_IDS;

    private static VERSION_STRATEGY: Omit<Record<JournalVersion, Migration>, typeof this.latestVersion> = {
        [JournalVersion.INITIAL_VERSION]: new AddParseAmountToEntries(),
        [JournalVersion.ADD_PARSE_AMOUNT_TO_ENTRIES]: new SingleCategory(),
    }

    private static initialMigration: MigrationRun = async (records) => {
        return records.reduce((acc: ZiskDocument[], record: ZiskDocument) => {
            if (record.kind === 'zisk:journal') {
                if (!record.journalVersion || typeof record.journalVersion !== 'string') {
                    record.journalVersion = JournalVersion.INITIAL_VERSION
                }
                return [record, ...acc]
            }
            acc.push(record)
            return acc
        }, []) as [JournalMeta, ...ZiskDocument[]]
    }

    public static migrate: MigrationRun = async (records) => {
        let [journal, ...rest] = await this.initialMigration(records)
        const versionsRun: JournalVersion[] = []
    
        while (journal.journalVersion !== this.latestVersion) {
            let migration: Migration = this.VERSION_STRATEGY[journal.journalVersion as keyof typeof this.VERSION_STRATEGY];
            if (migration === undefined) {
                throw new Error("Migration not found for journal version:" + String(journal.journalVersion))
            }
            const migrationVersion = migration.version
            if (versionsRun.includes(migrationVersion)) {
                throw new Error("Migration loop encountered. A migration was already run for " + String(migrationVersion))
            }
            console.log(`Migrating from ${journal.journalVersion} to ${migrationVersion}`);

            [journal, ...rest] = await migration.run([journal, ...rest])
            journal.journalVersion = migration.version
            versionsRun.push(migration.version)
        }

        return [journal, ...rest]
    }

    public static shouldMigrate(journal: JournalMeta): boolean {
        return journal.journalVersion !== this.latestVersion
    }
}
