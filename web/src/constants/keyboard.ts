export enum KeyboardActionName {
    CREATE_JOURNAL_ENTRY = 'CREATE_JOURNAL_ENTRY',
    DATE_VIEW_ANNUALLY = 'DATE_VIEW_ANNUALLY',
    DATE_VIEW_MONTHLY = 'DATE_VIEW_MONTHLY',
    DATE_VIEW_WEEKLY = 'DATE_VIEW_WEEKLY',
    OPEN_SEARCH_MODAL = 'OPEN_SEARCH_MODAL',
}

export interface Keystroke {
    ctrlCmd?: boolean
    altOpt?: boolean
    shift?: boolean
    symbol: string
}

export const KEYBOARD_ACTIONS: Record<KeyboardActionName, Keystroke> = {
    CREATE_JOURNAL_ENTRY: { symbol: 'c' },
    DATE_VIEW_ANNUALLY: { symbol: 'y' },
    DATE_VIEW_MONTHLY: { symbol: 'm' },
    DATE_VIEW_WEEKLY: { symbol: 'w' },
    OPEN_SEARCH_MODAL: { symbol: '/' },
}
