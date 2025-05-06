import z from "zod"
import { DocumentSchema } from "@/schema/support/orm/Document"
import { Avatar } from '@/schema/models/Avatar'
import { Mixin } from "@/schema/support/orm/Mixin"

export const [CreateJournal, Journal] = DocumentSchema.new(
    { 
        kind: z.literal('zisk:journal'),
    },
    z.object({
        journalName: z.string(),
        description: z.string().optional(),
        avatar: Avatar,
    }),
    z.object({
        ...Mixin.derived.timestamps(),
    })
)

export type CreateJournal = z.output<typeof CreateJournal>
export type Journal = z.output<typeof Journal>
