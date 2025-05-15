import z from "zod"
import { Currency } from "./currency"

export const AnnualPeriod = z.object({
	year: z.number().min(1900).max(2999)
})

export type AnnualPeriod = z.output<typeof AnnualPeriod>


export const MonthlyPeriod = AnnualPeriod.extend({
	month: z.number().min(1).max(12)
})

export type MonthlyPeriod = z.output<typeof MonthlyPeriod>

export const WeeklyPeriod = MonthlyPeriod.extend({
	day: z.number().min(1).max(31)
})

export type WeeklyPeriod = z.output<typeof WeeklyPeriod>

export const DatePeriod = z.union([AnnualPeriod, MonthlyPeriod, WeeklyPeriod])

export type DatePeriod = z.output<typeof DatePeriod>

export const DateRange = z.object({
	before: z.string().optional(),
	after: z.string().optional(),
})

export type DateRange = z.output<typeof DateRange>

export const DateView = z.union([DatePeriod, DateRange])

export type DateView = z.output<typeof DateView>

export enum DateViewSymbol {
	WEEKLY = 'w',
	MONTHLY = 'm',
	YEARLY = 'y',
	RANGE = 'r',
}

export const AmountRange = z.object({
	currency: Currency,
	gt: z.string().optional(),
	lt: z.string().optional(),
	absolute: z.boolean().optional(),
})

export type AmountRange = z.output<typeof AmountRange>

export const JournalSlice = z.object({
	dateView: DateView,
	tagIds: z.array(z.string()).optional(),
	statusIds: z.array(z.string()).optional(),
	categoryIds: z.array(z.string()).optional(),
	amount: AmountRange.optional(),
	hasAttachments: z.boolean().optional(),
})

export type JournalSlice = z.output<typeof JournalSlice>

