import { AnyCodec } from '../definitions';
import * as defs from './definitions';
import * as p from './parsers';

export const generateJSONSchema = (codec: AnyCodec, options?: defs.GenerationOptions): Record<string, any> => {
  const parsers: defs.Parser<any, any>[] = [
    ...(options?.parsers || []),
    p.AnyParser,
    p.StringParser,
    p.NumberParser,
    p.BooleanParser,
    p.NullParser,
    p.LiteralParser,
    p.EnumParser,
    p.ObjectParser,
    p.RecordParser,
    p.ArrayParser,
    p.TupleParser,
    p.IntersectionParser,
    p.UnionParser,
    p.RecursiveParser
  ];

  const recursion_cache: defs.RecursiveCodecCache = new Map();
  const schema = p.RootParser(codec, {
    parsers,
    target: options?.target ?? defs.TransformTarget.Encoded,
    allowAdditional: options?.allowAdditional ?? false,
    cache: recursion_cache
  });

  return {
    definitions: Object.fromEntries(recursion_cache.entries()),
    ...schema
  };
};
