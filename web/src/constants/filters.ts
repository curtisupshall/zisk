import { JournalAllFilters } from "@/components/journal/JournalFilters";

type Serializer<T> = {
    [K in keyof T]: (value: T[K]) => string;
};

type Deserializer<T> = {
    [K in keyof T]: (value: string) => T[K];
};

export const JOURNAL_FILTER_SHORTHAND_KEY_MAP: Record<keyof JournalAllFilters, string> = {
    'categories': 'cs',
    'entryTags': 'ts',
    'hasAttachments': 'at',
    'dateBefore': 'db',
    'dateAfter': 'da',
    'transactionAmountRange': 'a',
};

export const JOURNAL_FILTER_SHORTHAND_KEY_MAP_INVERSE = Object.fromEntries(
    Object.entries(JOURNAL_FILTER_SHORTHAND_KEY_MAP).map(([key, value]) => [value, key])
) as Record<string, keyof JournalAllFilters>;

// Serializer map
export const JOURNAL_FILTER_KEY_SERIALIZER: Serializer<JournalAllFilters> = {
    'categories': (value: string[]) => value.join(','),
    'entryTags': (value: string[]) => value.join(','),
    'hasAttachments': (value: boolean) => (value ? 'true' : 'false'),
    'dateBefore': (value: string) => value,
    'dateAfter': (value: string) => value,
    'transactionAmountRange': (value: [number, number]) => value.join(','),
};

// Deserializer map
export const JOURNAL_FILTER_KEY_DESERIALIZER: Deserializer<JournalAllFilters> = {
    'categories': (value: string) => value.split(','),
    'entryTags': (value: string) => value.split(','),
    'hasAttachments': (value: string) => value === 'true',
    'dateBefore': (value: string) => value,
    'dateAfter': (value: string) => value,
    'transactionAmountRange': (value: string) => {
        const [min, max] = value.split(',').map(Number);
        return [min, max];
    },
};
