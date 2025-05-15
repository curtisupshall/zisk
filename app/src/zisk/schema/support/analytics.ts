import z from "zod"

export const BasicAnalytics = z.object({
	/**
	 * Absolute sum of all accrued gains
	 */
	sumGain: z.number(),
	/**
	 * Absolute sum of all incurred losses
	 */
	sumLoss: z.number(),
	/**
	 * Data array for chart display
	 */
	chart: z.object({
		data: z.array(z.number()),
		labels: z.array(z.string()),
	})
})

export type BasicAnalytics = z.output<typeof BasicAnalytics>

export const CategoryAnalytics = z.object({
	spendByCategoryId: z.record(z.string(), z.number())
})

export type CategoryAnalytics = z.output<typeof CategoryAnalytics>

export const Analytics = z.object({
	basic: BasicAnalytics,
	categories: CategoryAnalytics,
})

export type Analytics = z.output<typeof Analytics>
