import z from "zod"
import { DocumentSchema } from "@/schema/support/orm/Document"
import { Avatar } from '@/schema/models/Avatar'
import { Mixin } from "@/schema/support/orm/Mixin"

export const [CreateAccount, Account] = DocumentSchema.new(
    { 
        kind: z.literal('zisk:account'),
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

export type CreateAccount = z.output<typeof CreateAccount>
export type Account = z.output<typeof Account>
