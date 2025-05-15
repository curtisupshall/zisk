import z from "zod"
import { Document } from "@/schema/support/orm/Document"
import { Avatar } from '@/schema/models/Avatar'
import { Mixin } from "@/schema/support/orm/Mixin"

export const [CreateJournal, Journal] = Document.fromSchemas([
    { 
        kind: z.literal('zisk:journal'),
        journalName: z.string(),
        description: z.string().optional(),
        avatar: Avatar,
    },
    {
        ...Mixin.derived.timestamps(),
    }
])

export type CreateJournal = z.output<typeof CreateJournal>
export type Journal = z.output<typeof Journal>
