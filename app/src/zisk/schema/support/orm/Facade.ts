
// TODO ignore
// const db: any = {};

// class ModelFacade {
//     static fromSchemas<Intrinsic extends Array<z.ZodObject>, Derived extends Array<z.ZodObject>>(
//         intrinicSchemas: Intrinsic,
//         derivedSchemas: Derived,
//     ) {
//         const intrinsic = z.discriminatedUnion('kind', intrinicSchemas)
//         const _derived = z.discriminatedUnion('kind', derivedSchemas)

//         return class ModelFacade {
//             static make(props: z.infer<typeof intrinsic>) {
//                 return {
//                     ...props
//                 }
//             }

//             static save(props: z.infer<typeof _derived>) {
//                 db.put(props)
//             }
//         }
//     }
// }
