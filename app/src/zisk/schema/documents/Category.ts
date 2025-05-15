import z from "zod"
import { Document } from "@/schema/support/orm/Document"
import { Avatar } from '@/schema/models/Avatar'
import { Mixin } from "@/schema/support/orm/Mixin"

export const [CreateCategory, Category] = Document.fromSchemas([
    { 
        kind: z.literal('zisk:category'),
        label: z.string(),
        description: z.string(),
        avatar: Avatar,
    },
    {
        ...Mixin.derived.timestamps(),
        ...Mixin.derived.belongsToJournal(),
    }
])

export type CreateCategory = z.output<typeof CreateCategory>
export type Category = z.output<typeof Category>
