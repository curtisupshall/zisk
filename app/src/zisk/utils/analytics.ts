import { getAbsoluteDateRangeFromDateView } from "./date"
import dayjs from "dayjs"
import { calculateNetAmount, parseJournalEntryAmount } from "./journal"
import { JournalEntry } from "@/schema/documents/JournalEntry"
import { Category } from "@/schema/documents/Category"
import { Analytics, BasicAnalytics } from "@/schema/support/analytics"
import { DateView } from "@/schema/support/slice"

const EMPTY_CATEGORY_ID_SYMBOL = 'EMPTY_CATEGORY_ID_SYMBOL' as const

export const calculateBasicAnalytics = (journalEntries: JournalEntry[], dateView: DateView): BasicAnalytics => {
    if (!journalEntries.length) {
        return { chart: { data: [], labels: [] }, sumGain: 0, sumLoss: 0 }
    }
    const { startDate, endDate } = getAbsoluteDateRangeFromDateView(dateView)
    let sumGain: number = 0
    let sumLoss: number = 0
    const dateSums: Record<string, number> = {}

    journalEntries.forEach((entry) => {
        const netAmount = calculateNetAmount(entry)
        if (netAmount > 0) {
            sumGain += netAmount
        } else {
            sumLoss += Math.abs(netAmount)
        }
        const { date } = entry
        if (date) {
            if (dateSums[date] === undefined) {
                dateSums[date] = 0
            }
            dateSums[date] += netAmount
        }
    })

    const data: number[] = []
    const labels: string[] = []
    if (startDate && endDate) {
        let runningSum = 0
        for (let d = dayjs(startDate); d.isBefore(endDate) || d.isSame(endDate); d = d.add(1, 'day')) {
            const date = d.format('YYYY-MM-DD')
            const dateSum = dateSums[date] ?? 0
            runningSum += dateSum
            data.push(runningSum)
            labels.push(date)
        }
    }
    return { sumLoss, sumGain, chart: { data, labels } }
}

export const calculateCategorySums = (_journalEntries: JournalEntry[]): Record<string | symbol, number> => {

    // TODO fix after ZK-132

    return {};

    // const parseAmount = (amount: string): number => {
    //     const parsed = parseJournalEntryAmount(amount) ?? 0
    //     return Math.abs(Math.min(0, parsed))
    // }
    // const categoryIds = journalEntries.reduce((acc: Set<string>, entry) => {
    //     if (entry.categoryId) {
    //         acc.add(entry.categoryId)
    //     }
    //     return acc
    // }, new Set<string>([]))

    // return journalEntries.reduce((acc: Record<Category['_id'] | symbol, number>, entry: JournalEntry) => {
    //     let parent = entry
    //     let children = entry.children ?? []
        
    //     const amounts: { categoryId: string | undefined, amount: number }[] = [
    //         { categoryId: parent.categoryId, amount: parseAmount(parent.amount) }
    //     ]

    //     children.forEach((child) => {
    //         amounts.push({
    //             categoryId: child.categoryId ?? parent.categoryId,
    //             amount: parseAmount(child.amount),
    //         })
    //     })

    //     amounts.forEach(({ categoryId, amount }) => {
    //         acc[categoryId ?? EMPTY_CATEGORY_ID_SYMBOL] += amount
    //     })

    //     return acc
    // }, {
    //     ...Object.fromEntries(Array.from(categoryIds).map((categoryId => [categoryId, 0]))),
    //     [EMPTY_CATEGORY_ID_SYMBOL]: 0,
    // })
}

export const generateAnalytics = (journalEntries: JournalEntry[], dateView: DateView): Promise<Analytics> => {
    return new Promise<Analytics>((resolve) => {
        resolve({
            basic: calculateBasicAnalytics(journalEntries, dateView),
            categories: {
                spendByCategoryId: calculateCategorySums(journalEntries),
            },
        })
    })
}
