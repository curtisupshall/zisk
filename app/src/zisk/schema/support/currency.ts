import { z } from "zod";

export const Currency = z.enum([
    'USD',
    'CAD',
])
export type Currency = z.output<typeof Currency>
