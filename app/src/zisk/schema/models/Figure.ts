import { Currency } from "@/schema/support/currency";
import { Model } from "@/schema/support/orm/Model";
import { z } from "zod";

const [CreateBaseFigure, BaseFigure] = Model.fromSchema({
    kind: z.literal('zisk:figure'),
    currency: Currency,
    amount: z.number(),
})

export const CreateFigure = CreateBaseFigure.extend({
    get empiracle() {
        return CreateBaseFigure.optional();
    }
})
export type CreateFigure = z.output<typeof CreateFigure>;

export const Figure = BaseFigure.extend({
    get empiracle() {
        return BaseFigure.optional()
    }
})
export type Figure = z.output<typeof Figure>;
