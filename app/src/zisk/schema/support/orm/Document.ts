import { z } from 'zod'
import { _Model, Kind } from '@/schema/support/orm/Model'

export const IdentifierMetadata = z.object({
	_id: z.string(),
})
export type IdentifierMetadata = z.output<typeof IdentifierMetadata>

export const AttachmentMeta = z.object({
	content_type: z.string(),
	data: z.instanceof(File),
})
export type AttachmentMeta = z.output<typeof AttachmentMeta>

export const _Document = IdentifierMetadata
    .extend(
        {
            _rev: z.string().optional(),
            _deleted: z.boolean().optional(),
            _attachments: z.record(z.string(), AttachmentMeta).optional(),
        }
    )
export type _Document = z.output<typeof _Document>

export class DocumentSchema {
    static new<
        KindValue extends Kind,
        Intrinsic extends z.ZodRawShape,
        Derived extends z.ZodRawShape
    >(
        modelAttrs: {
            kind: z.ZodLiteral<KindValue>,
        },
        intrinsic: z.ZodObject<Intrinsic>,
        derived: z.ZodObject<Derived>
    ) {
        const { kind } = modelAttrs;
        
        const CreateSchema = _Document.partial()
            .extend(intrinsic.shape)
            
        const FullIntrinsicSchema = _Model
            .extend(_Document.shape)
            .extend({
                kind,
            })
            .extend(intrinsic.shape)
            .extend(derived.shape)
                    
        // const FullDerivedSchema = derivedShape
        //     ? FullIntrinsicSchema.extend(derivedShape)
        //     : FullIntrinsicSchema

        const FullDerivedSchema = FullIntrinsicSchema

        return [CreateSchema, FullDerivedSchema] as const;
    }
}
