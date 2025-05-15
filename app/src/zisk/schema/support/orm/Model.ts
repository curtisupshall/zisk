import z from "zod";

export type KindTemplate = `zisk:${string}`;

export type KindShape<Kind extends KindTemplate> = {
    kind: z.ZodLiteral<Kind>
}

export type Optional<S extends z.ZodRawShape> = {
    [K in keyof S]: z.ZodOptional<S[K]>;
};

export class Model {
    public static extend<E extends z.ZodRawShape>(extension: E) {
        class ExtendedModel {
            public static fromSchemas<
                Kind extends KindTemplate,
                Intrinsic extends z.ZodRawShape,
                Derived extends z.ZodRawShape,
            >(
                [intrinsic, derived]: [KindShape<Kind> & Intrinsic, Derived]
            ) {
                return Model.fromExtendedSchemas<Kind, Intrinsic, Derived, E>([intrinsic, derived, extension])
            }

            public static fromSchema<
                Kind extends KindTemplate,
                Intrinsic extends z.ZodRawShape,
            >(
                intrinsic: KindShape<Kind> & Intrinsic
            ) {
                return Model.fromExtendedSchemas<Kind, Intrinsic, {}, E>([intrinsic, {}, extension])
            }
        }
        return ExtendedModel;
    }

    public static fromSchema = <
        Kind extends KindTemplate,
        Intrinsic extends z.ZodRawShape,
    >(
        intrinsic: KindShape<Kind> & Intrinsic
    ) => {
        return Model.fromExtendedSchemas<Kind, Intrinsic, {}, {}>([intrinsic, {}, {}])
    }

    public static fromSchemas = <
        Kind extends KindTemplate,
        Intrinsic extends z.ZodRawShape,
        Derived extends z.ZodRawShape,
    >(
        [intrinsic, derived]: [KindShape<Kind> & Intrinsic, Derived]
    ) => {
        return Model.fromExtendedSchemas<Kind, Intrinsic, Derived, {}>([intrinsic, derived, {}])
    }

    private static fromExtendedSchemas = <
        Kind extends KindTemplate,
        Intrinsic extends z.ZodRawShape,
        Derived extends z.ZodRawShape,
        E extends z.ZodRawShape,
    >(
        [intrinsic, derived, extension]: [KindShape<Kind> & Intrinsic, Derived, E]
    ) => {
        const optionalOtherShape = z.object(extension).partial().shape
        const optionalDerivedShape = z.object(derived).partial().shape
    
        const intrinsicShape = {
            ...intrinsic,
            ...optionalOtherShape,
            ...optionalDerivedShape,
        } as
            & Intrinsic
            & Optional<Derived>
            & Optional<E>
            & { kind: never }
    
        const derivedShape = {
            ...intrinsic,
            ...extension,
            ...derived,
        } as 
            & KindShape<Kind>
            & Intrinsic
            & E
            & Derived;
    
        return [
            z.object(intrinsicShape).omit({ kind: true }),
            z.object(derivedShape),
        ] as const
    }
}
