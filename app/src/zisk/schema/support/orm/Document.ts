import { z } from 'zod'
import { Model } from '@/schema/support/orm/Model'
import { Mixin } from '@/schema/support/orm/Mixin'

export const AttachmentMeta = z.object({
	content_type: z.string(),
	data: z.instanceof(File),
})
export type AttachmentMeta = z.output<typeof AttachmentMeta>

const DocumentShape = {
    ...Mixin.derived.natural._id(),
    _rev: z.string().optional(),
    _deleted: z.boolean().optional(),
    _attachments: z.record(z.string(), AttachmentMeta).optional(),
}
type DocumentShape = typeof DocumentShape;

const DocumentObject = z.object(DocumentShape)
export type DocumentObject = z.infer<typeof DocumentObject>

export const Document = Model.extend(DocumentShape)
