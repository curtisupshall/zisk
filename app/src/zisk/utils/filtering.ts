import { JournalFilterSlot } from "@/components/journal/ribbon/JournalFilterPicker";
import { parseJournalEntryAmount } from "./journal";
import { AmountRange, JournalSlice } from "@/schema/support/slice";


export const enumerateFilters = (journalSlice: JournalSlice): Set<JournalFilterSlot> => {
    const {
        amount,
        categoryIds,
    } = journalSlice
    const slots: Set<JournalFilterSlot> = new Set<JournalFilterSlot>([])
    if (categoryIds && categoryIds.length > 0) {
        slots.add(JournalFilterSlot.CATEGORIES)
    }
    if (amount) {
        if (parseJournalEntryAmount(journalSlice.amount?.gt ?? '') !== undefined || parseJournalEntryAmount(journalSlice.amount?.lt ?? '') !== undefined) {
            slots.add(JournalFilterSlot.AMOUNT)
        }
    }

    return slots
}

export const transformAmountRange = (amountRange: AmountRange): { greaterThan: number | undefined, lessThan: number | undefined } => {
    const lt = parseJournalEntryAmount(amountRange.lt ?? '')
    const gt = parseJournalEntryAmount(amountRange.gt ?? '')

    const greaterThan: number[] = []
    const lessThan: number[] = []

    if (gt !== undefined) {
        if (gt <= 0) {
            // "More than $X" where X is an expense
            lessThan.push(gt)
        } else {
            // "More than $X" where X is an income
            greaterThan.push(gt)
        }
    }
    if (lt !== undefined) {
        if (lt <= 0) {
            // "Less than $X" where X is an expense
            greaterThan.push(lt)
            lessThan.push(0)
        } else {
            // "Less than $X" where X is an income
            lessThan.push(lt)
            if (!greaterThan.length) {
                greaterThan.push(0)
            }
        }
    }
    

    return {
        greaterThan: greaterThan.length > 0 ? Math.max(...greaterThan) : undefined,
        lessThan: lessThan.length > 0 ? Math.min(...lessThan) : undefined,
    }
}
