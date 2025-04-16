import { z, ZodLiteral, ZodObject, ZodRawShape } from "zod";

const db: any = {}


/**
 * Type representing the string literal attriute used to disambiguate Zisk
 * documents.
 */
type ZiskModelKind = ZodLiteral<`zisk:${string}`>;

/**
 * Represents the schema shape for which all subclasses for BaseModel must
 * specify.
 */
type ZiskModelRequiredShape = {
  kind: ZiskModelKind;
} & ZodRawShape;


/**
 * A factor class for producing Zisk ORM BaseModel classes.
 */
class ModelFactory {
  protected static intrinsicSchemaShape = {
    _id: z.string(),
    createdAt: z.string(),
  }

  /**
   * Constructs a BaseModal class which implements extensible methods for
   * instantiating an object instance.
   * 
   * @param domainSchemaShape The shape of the Domain schema, namely the schema
   * of interest for the superclass of BaseModel.
   */
  public static extend<Shape extends ZiskModelRequiredShape>(domainSchemaShape: Shape) {
    const intrinsicSchema = z.object(ModelFactory.intrinsicSchemaShape)
    const derivedSchema = intrinsicSchema.extend(domainSchemaShape);

    /**
     * Represents the type of BaseModel intrinsic schema
     */
    type IntrinsicSchemaType = z.infer<typeof intrinsicSchema>

    /**
     * Represents the type of the derived schema, where the derived schema
     * is the union of the intrinsic schema and the domain schema.
     */
    type DerivedSchemaType = z.infer<typeof derivedSchema>;

    /**
     * A class for performing basic static methods pertaining to domain
     * schema.
     */
    class BaseModel {
      public static schema: ZodObject<DerivedSchemaType> = derivedSchema;

      /**
       * Returns an object containing preset values for all intrinsic
       * properties.
       */
      public static async intrinsics(): Promise<IntrinsicSchemaType> {
        return {
          _id: 'some-randomly-generated-model-id',
          createdAt: new Date().toISOString(),
        }
      }

      /**
       * Returns an instance of the model, including preset values for
       * intrinsic properties, without validating or parsing the
       * object.
       */
      public static async make(props: Partial<DerivedSchemaType>): Promise<DerivedSchemaType> {
        return {
          ...(await this.intrinsics()),
          ...props,
        }
      }

      /**
       * Parses an unknown object using the derived schema belonging to the
       * model.
       */
      public static parse(props: unknown): DerivedSchemaType {
        return this.schema.parse(props);
      }
    };

    return BaseModel;
  }
}

/**
 * A factor class for producing Zisk ORM DocumentModel classes.
 */
class DocumentFactory extends ModelFactory {
  protected static override intrinsicSchemaShape = {
    // Extends ModelFactory intrinsic shape
    ...ModelFactory.intrinsicSchemaShape,
    _rev: z.string().optional(),
  };

  /**
   * Constructs a DocumentModel class which implements extensible methods for
   * instantiating an object instance, as well as persisting it to a database.
   * 
   * @param domainSchemaShape The shape of the Domain schema, namely the schema
   * of interest for the superclass of BaseModel.
   */
  public static extend<Shape extends ZiskModelRequiredShape>(domainSchemaShape: Shape) {
    const intrinsicSchema = z.object(DocumentFactory.intrinsicSchemaShape)
    const derivedSchema = intrinsicSchema.extend(domainSchemaShape);

    /**
     * A class for performing basic static methods pertaining to domain
     * schema.
     */
    const BaseModel = ModelFactory.extend(domainSchemaShape);

    /**
     * Represents the extended type of DocumentModel intrinsic schema, which
     * extends BaseModel intrinsic schema.
     */
    type IntrinsicSchemaType = z.infer<typeof intrinsicSchema>

     /**
     * Represents the type of the derived schema, where the derived schema
     * is the union of the intrinsic schema and the domain schema.
     */
    type DerivedSchemaType = z.infer<typeof derivedSchema>;

    /**
     * A class for performing basic static methods pertaining to domain
     * schema.
     * 
     * @extends BaseModel
     */
    class DocumentModel extends BaseModel {
      /**
       * Returns an object containing preset values for all intrinsic
       * properties.
       */
      public static override async intrinsics(): Promise<IntrinsicSchemaType> {
        return {
          _id: 'some-randomly-generated-document-id',
          createdAt: new Date().toISOString(),
          _rev: undefined,
        }
      }

      public static async create(props: Partial<DerivedSchemaType>): Promise<DerivedSchemaType> {
        const parsed = await this.make(props);
        return db.create(parsed); // replace with real DB call
      }
    };

    return DocumentModel;
  }
}

export class CategoryModel extends DocumentFactory
  .extend({
    kind: z.literal('zisk:category'),
    categoryId: z.string(),
    label: z.string(),
  }) {

  static customLogic() {
    // ...
  }
}

export class AvatarModel extends ModelFactory
  .extend({
    kind: z.literal('zisk:avatar'),
    label: z.string(),
  }) {

  static customLogic() {
    // ...
  }
}

const x = await CategoryModel.create({
  _id: 'hello',
  _rev: 'test',
})
