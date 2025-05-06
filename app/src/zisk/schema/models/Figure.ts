import { Currency } from "@/schema/support/currency";
import { ModelSchema } from "@/schema/support/orm/Model";
import { z } from "zod";

export const Figure = ModelSchema.from(
    {
        kind: z.literal('zisk:figure')
    },
    z.object({
        currency: Currency,
        amount: z.number(),
        get empiracle() {
            return Figure.omit({ empiracle: true }).optional()
        },
    }),
);
export type Figure = z.output<typeof Figure>;
