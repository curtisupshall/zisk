import { JournalEntry } from "@/schema/documents/JournalEntry"

export type DownstreamAttributeFilter = (entries: JournalEntry[]) => null | JournalEntry[]

export type UpstreamAttributeFilter = () => null | Record<string, unknown>[]

export abstract class AttributeFilter<T> {
    protected filter: T

    constructor(filter: T) {
        this.filter = filter
    }

    upstream: UpstreamAttributeFilter = () => null

    downstream: DownstreamAttributeFilter = () => null

    abstract serialize(): string;
}
