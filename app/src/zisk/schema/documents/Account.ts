import z from "zod"
import { Document } from "@/schema/support/orm/Document"
import { Avatar } from '@/schema/models/Avatar'
import { Mixin } from "@/schema/support/orm/Mixin"

export const [CreateAccount, Account] = Document.fromSchemas([
    {
     
        kind: z.literal('zisk:account'),

        label: z.string(),
        description: z.string(),
        avatar: Avatar,
    },
    {
        ...Mixin.derived.timestamps(),
        ...Mixin.derived.belongsToJournal(),
    }
])

export type CreateAccount = z.output<typeof CreateAccount>
export type Account = z.output<typeof Account>
