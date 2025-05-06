import z from "zod"
import { ModelSchema } from "@/schema/support/orm/Model"

export const AvatarVariant = z.enum(['TEXT', 'PICTORIAL', 'IMAGE'])
export type AvatarVariant = z.output<typeof AvatarVariant>

export const Avatar = ModelSchema.from(
    {
        kind: z.literal('zisk:avatar')
    },
    z.object({
        content: z.string(),
        variant: AvatarVariant,
        primaryColor: z.string(),
        'secondaryColor': z.string().optional().nullable(),
    })
)
export type Avatar = z.output<typeof Avatar>
