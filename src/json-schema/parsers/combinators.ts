import * as defs from '../../definitions';
import { createParser } from '../utils';
import * as root from './root';

/**
 * Intersections are a bit complicated due to the way that additionalProperties works in JSON-Schema. To
 * support this we need to do different operations based on the type of codecs contained by the
 * intersection.
 *
 * If the intersection contains only object schemas then they are all merged under a single schema so
 * that `additionalProperties` applies against them simultaneously.
 *
 * If the intersection contains a mix of object schemas and unions then we need to construct the product
 * of all unions against a merge of all object schemas, combining them under a single `anyOf` definition.
 * Each product will be a merged schema with `additionalProperties` applying against all properties
 * contained within.
 *
 * Note: You can only really intersect object schemas and so we do not check for any other type of schema
 */
export const IntersectionParser = createParser<defs.Intersection<defs.AnyCodec, defs.AnyCodec>>(
  defs.CodecType.Intersection,
  (codec, options) => {
    const schemas = codec.props.codecs.map((codec) => root.RootParser(codec, options));

    const unions = schemas.filter((schema) => !!schema.anyOf);
    const object_schemas = schemas.filter((schema) => schema.type === 'object');

    const mergeObjectSchemas = (...schemas: any[]) => {
      return {
        type: 'object',
        properties: schemas.reduce((properties, schema: any) => {
          return {
            ...properties,
            ...(schema.properties || {})
          };
        }, {}),
        additionalProperties: !!options?.allowAdditional,
        required: Array.from(
          new Set(
            schemas.reduce((required: string[], schema: any) => {
              return required.concat(schema.required || []);
            }, [])
          )
        )
      };
    };

    /**
     * If the intersection contains _only_ unions then we can return an `allOf` schema
     */
    if (unions.length > 0 && object_schemas.length === 0) {
      return {
        allOf: unions
      };
    }

    /**
     * If the intersection contains a mix of unions and object schemas then we need to merge all
     * object schemas into a single schema and product it with each union.
     *
     * {...merged_object_schemas} X unions
     */
    if (unions.length > 0) {
      const merged = mergeObjectSchemas(...object_schemas);
      return {
        anyOf: unions.reduce((schemas: any[], union) => {
          return union.anyOf.reduce((schemas: any[], union_schema: any) => {
            return schemas.concat(mergeObjectSchemas(union_schema, merged));
          }, schemas);
        }, [])
      };
    }

    /**
     * Lastly, if the intersection contains only object schemas then we merge them into a single object schema
     */
    return mergeObjectSchemas(...schemas);
  }
);

export const UnionParser = createParser<defs.Union<defs.AnyCodec, defs.AnyCodec>>(
  defs.CodecType.Union,
  (codec, options) => {
    return {
      anyOf: codec.props.codecs.map((codec) => root.RootParser(codec, options))
    };
  }
);
