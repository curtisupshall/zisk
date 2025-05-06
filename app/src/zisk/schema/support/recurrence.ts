import z from "zod";

export const CadenceFrequency = z.enum([
    'D', // Daily
    'W', // Weekly
    'M', // Monthly
    'Y', // Yearly
]);
export type CadenceFrequency = z.infer<typeof CadenceFrequency>;

export const WeekNumber = z.enum(['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'LAST']);
export type WeekNumber = z.infer<typeof WeekNumber>;

// Days of week enum using Zod
export const DayOfWeek = z.enum([
    'SU',
    'MO',
    'TU',
    'WE',
    'TH',
    'FR',
    'SA',
]);
export type DayOfWeek = z.infer<typeof DayOfWeek>;

export const MonthlyCadence = z.object({
  frequency: z.literal(CadenceFrequency.enum.M),
  on: z.union([
    z.object({
      // Monthly on Last Thursday, First Monday, Second Monday, etc.
      week: WeekNumber,
    }),
    z.object({
      // Monthly on the 12th day
      day: z.number().min(1).max(31),
    }),
  ]),
});

export type MonthlyCadence = z.output<typeof MonthlyCadence>

export const DailyCadence = z.object({
  frequency: z.literal(CadenceFrequency.enum.D),
});

export type DailyCadence = z.output<typeof DailyCadence>

export const YearlyCadence = z.object({
  frequency: z.literal(CadenceFrequency.enum.Y),
});

export type YearlyCadence = z.output<typeof YearlyCadence>

export const WeeklyCadence = z.object({
  frequency: z.literal(CadenceFrequency.enum.W),
  days: z.array(DayOfWeek),
});

export type WeeklyCadence = z.output<typeof WeeklyCadence>

export const RecurringCadence = z.object({
  interval: z.number(), // Every _ days/months/weeks
}).and(
  z.union([
    MonthlyCadence,
    WeeklyCadence,
    DailyCadence,
    YearlyCadence,
  ])
);

export type RecurringCadence = z.output<typeof RecurringCadence>
