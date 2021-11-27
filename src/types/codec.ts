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

  const intersection = codec(
    defs.CodecType.Intersection,
    (data) => {
      return codecs.reduce((acc, codec) => {
        return {
          ...acc,
          ...codec.encode(data)
        };
      }) as any;
    },
    (data) => {
      return codecs.reduce((acc, codec) => {
        return {
          ...acc,
          ...codec.decode(data)
        };
      }) as any;
    }
  ) as defs.Intersection<C1, C2>;

  intersection.codecs = codecs;

  return intersection;
};

export const union = <C1 extends defs.AnyCodec, C2 extends defs.AnyCodec>(c1: C1, c2: C2) => {
  const codecs = mergeSameCodecs(defs.CodecType.Union, c1, c2);

  const union = codec(
    defs.CodecType.Union,
    (data) => {
      // TODO: Finish
      for (const codec of codecs) {
        return codec.encode(data);
      }
    },
    (data) => {
      // TODO: Finish
      for (const codec of codecs) {
        return codec.decode(data);
      }
    }
  ) as defs.Union<C1, C2>;

  union.codecs = codecs;

  return union;
};

export const optional = <T extends defs.AnyCodec>(codec: T): defs.OptionalCodec<T> => {
  return {
    ...codec,
    required: false,
    encode: (data) => {
      if (!data) {
        return undefined;
      }
      return codec.encode(data);
    },
    decode: (data) => {
      if (!data) {
        return undefined;
      }
      return codec.decode(data);
    }
  };
};
