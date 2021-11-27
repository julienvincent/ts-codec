import { AnyCodec, CodecType, IdentityCodec } from './definitions';
import * as defs from './definitions';

export enum Side {
  Encoded = 'encoded',
  Decoded = 'decoded'
}

type GenerationOptions = {
  side?: Side;
  extensions?: Parser<string, AnyCodec>[];
  allowAdditional?: boolean;
};

type ParserFunction<C extends AnyCodec> = (codec: C, options: GenerationOptions) => object;
type Parser<T extends string, C extends AnyCodec> = {
  tag: T;
  parse: ParserFunction<C>;
};

const createParser = <C extends AnyCodec, T extends string = string>(
  tag: T,
  parser: ParserFunction<C>
): Parser<T, C> => {
  return {
    tag,
    parse: parser
  };
};

const createPrimitiveParser = <T extends CodecType>(type: T): Parser<T, IdentityCodec<T>> => {
  return {
    tag: type,
    parse: () => {
      return { type: type };
    }
  };
};

const StringParser = createPrimitiveParser(CodecType.String);
const NumberParser = createPrimitiveParser(CodecType.Number);
const BooleanParser = createPrimitiveParser(CodecType.Boolean);

const ObjectParser = createParser<defs.ObjectCodec<defs.AnyObjectCodecShape>>(CodecType.Object, (codec, options) => {
  const entries = Object.entries(codec.shape);
  return {
    type: 'object',
    properties: entries.reduce((acc: Record<string, any>, [key, codec]) => {
      acc[key] = generateJSONSchema(codec, options);
      return acc;
    }, {}),
    additionalProperties: !!options?.allowAdditional,
    required: entries
      .filter(([, codec]) => {
        return codec.required;
      })
      .map(([key]) => key)
  };
});

const ArrayParser = createParser<defs.ArrayCodec<AnyCodec>>(CodecType.Array, (codec, options) => {
  return {
    type: 'array',
    items: generateJSONSchema(codec.element, options)
  };
});

const IntersectionParser = createParser<defs.Intersection<AnyCodec, AnyCodec>>(
  CodecType.Intersection,
  (codec, options) => {
    const schemas = codec.codecs.map((codec) => generateJSONSchema(codec, options));

    // return {
    //   type: "object",
    //   properties: schemas.reduce((properties, schema: any) => {
    //     return {
    //       ...properties,
    //       ...(schema.properties || {}),
    //     }
    //   }, {}),
    //   additionalProperties: !!options?.allowAdditional,
    //   required: schemas.reduce((required: string[], schema: any) => {
    //     return required.concat(schema.required || [])
    //   }, []),
    // }

    return {
      allOf: schemas
    };
  }
);

const UnionParser = createParser<defs.Union<AnyCodec, AnyCodec>>(CodecType.Union, (codec, options) => {
  return {
    anyOf: codec.codecs.map((codec) => generateJSONSchema(codec, options))
  };
});

export const generateJSONSchema = (codec: AnyCodec, options: GenerationOptions = { side: Side.Encoded }) => {
  const parsers: Parser<any, any>[] = [
    StringParser,
    NumberParser,
    BooleanParser,
    ObjectParser,
    ArrayParser,
    IntersectionParser,
    UnionParser,
    ...(options?.extensions || [])
  ];

  const parser = parsers.find((parser) => parser.tag === codec._tag);
  if (!parser) {
    throw new Error(`No parser configured for codec ${codec._tag}`);
  }

  return parser.parse(codec, options);
};
