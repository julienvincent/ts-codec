import * as defs from '../definitions';
import * as utils from '../utils';

export const codec = <I, O, T extends string = string>(
  tag: T,
  encode: defs.Transformer<I, O>,
  decode: defs.Transformer<O, I>
) => {
  const codec: defs.TaggedCodec<T, I, O> = {
    _tag: tag,

    encode,
    decode,

    and: <C extends defs.AnyCodec>(extention: C) => intersection(codec, extention),
    or: <C extends defs.AnyCodec>(extention: C) => union(codec, extention),

    meta: (metadata) => {
      return {
        ...codec,
        metadata: metadata
      };
    },

    required: true,
    optional: () => optional(codec)
  };
  return codec;
};

const mergeSameCodecs = <T extends defs.CodecType.Intersection | defs.CodecType.Union>(
  tag: T,
  c1: defs.AnyCodec,
  c2: defs.AnyCodec
) => {
  const codecs = [];
  if (utils.isCodecType(c1, tag as defs.CodecType.Intersection)) {
    codecs.push(...c1.codecs);
  } else {
    codecs.push(c1);
  }
  if (utils.isCodecType(c2, tag as defs.CodecType.Intersection)) {
    codecs.push(...c2.codecs);
  } else {
    codecs.push(c2);
  }

  return codecs;
};

export const intersection = <C1 extends defs.AnyCodec, C2 extends defs.AnyCodec>(c1: C1, c2: C2) => {
  const codecs = mergeSameCodecs(defs.CodecType.Intersection, c1, c2);

  const transformer = (transformer: 'encode' | 'decode') => (data: any) => {
    return codecs.reduce((acc, codec) => {
      return {
        ...acc,
        ...codec[transformer](data)
      };
    }, {}) as any;
  };

  const intersection = codec(
    defs.CodecType.Intersection,
    transformer('encode'),
    transformer('decode')
  ) as defs.Intersection<C1, C2>;

  intersection.codecs = codecs;

  return intersection;
};

export const union = <C1 extends defs.AnyCodec, C2 extends defs.AnyCodec>(c1: C1, c2: C2) => {
  const codecs = mergeSameCodecs(defs.CodecType.Union, c1, c2);

  const transformer = (transformer: 'encode' | 'decode') => (data: any) => {
    const errors = [];
    for (const codec of codecs) {
      try {
        return codec[transformer](data);
      } catch (err) {
        errors.push(err);
      }
    }

    throw new utils.TransformError(
      errors
        .map((error) => {
          if (error instanceof utils.TransformError) {
            return error.errors;
          }
          return error.toString();
        })
        .flat()
    );
  };

  const union = codec(defs.CodecType.Union, transformer('encode'), transformer('decode')) as defs.Union<C1, C2>;

  union.codecs = codecs;

  return union;
};

export const optional = <T extends defs.AnyCodec>(codec: T): defs.OptionalCodec<T> => {
  return {
    ...codec,
    required: false,
    encode: (data) => {
      if (data === undefined) {
        return undefined;
      }
      return codec.encode(data);
    },
    decode: (data) => {
      if (data === undefined) {
        return undefined;
      }
      return codec.decode(data);
    }
  };
};
