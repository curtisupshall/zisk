import z from "zod"
import { DocumentSchema } from "@/schema/support/orm/Document"
import { Avatar } from '@/schema/models/Avatar'
import { Mixin } from "@/schema/support/orm/Mixin"

export const [CreateCategory, Category] = DocumentSchema.new(
    { 
        kind: z.literal('zisk:category'),
    },
    z.object({
        label: z.string(),
        description: z.string(),
        avatar: Avatar,
    }),
    z.object({
        ...Mixin.derived.timestamps(),
        ...Mixin.derived.belongsToJournal(),
    }),
)

export type CreateCategory = z.output<typeof CreateCategory>
export type Category = z.output<typeof Category>
