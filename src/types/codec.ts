import * as defs from '../definitions';
import * as utils from '../utils';

export const codec = <I, O, T extends string = string, P extends defs.CodecProps = defs.CodecProps>(
  tag: T,
  encode: defs.Transformer<I, O>,
  decode: defs.Transformer<O, I>,
  props?: P & defs.CodecProps
) => {
  const c: defs.Codec<I, O, T, P & defs.CodecProps> = {
    _tag: tag,

    props: {
      ...(props || ({} as P)),
      metadata: props?.metadata ?? {},
      required: props?.required ?? true
    },

    encode,
    decode,

    and: <C extends defs.AnyCodec>(extention: C) => intersection(c, extention),
    or: <C extends defs.AnyCodec>(extention: C) => union(c, extention),

    meta: (metadata) => {
      return codec(tag, encode, decode, {
        ...c.props,
        metadata: {
          ...c.props.metadata,
          ...metadata
        }
      });
    },

    optional: () => optional(c)
  };
  return c;
};

const mergeSameCodecs = <T extends defs.CodecType.Intersection | defs.CodecType.Union>(
  tag: T,
  c1: defs.AnyCodec,
  c2: defs.AnyCodec
) => {
  const codecs = [];
  if (utils.isCodecType(c1, tag as defs.CodecType.Intersection)) {
    codecs.push(...c1.props.codecs);
  } else {
    codecs.push(c1);
  }
  if (utils.isCodecType(c2, tag as defs.CodecType.Intersection)) {
    codecs.push(...c2.props.codecs);
  } else {
    codecs.push(c2);
  }

  return codecs;
};

export const createIntersectionTransformer = (op: 'encode' | 'decode', codecs: defs.AnyCodec[]) => (data: any) => {
  return codecs.reduce((acc, codec) => {
    return {
      ...acc,
      ...codec[op](data)
    };
  }, {}) as any;
};

export const intersection = <C1 extends defs.AnyCodec, C2 extends defs.AnyCodec>(
  c1: C1,
  c2: C2
): defs.Intersection<C1, C2> => {
  const codecs = mergeSameCodecs(defs.CodecType.Intersection, c1, c2);

  return codec(
    defs.CodecType.Intersection,
    createIntersectionTransformer('encode', codecs),
    createIntersectionTransformer('decode', codecs),
    {
      codecs: codecs
    }
  );
};

export const createUnionTransformer = (op: 'encode' | 'decode', codecs: defs.AnyCodec[]) => (data: any) => {
  const errors = [];
  for (const codec of codecs) {
    try {
      return codec[op](data);
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

export const union = <C1 extends defs.AnyCodec, C2 extends defs.AnyCodec>(c1: C1, c2: C2): defs.Union<C1, C2> => {
  const codecs = mergeSameCodecs(defs.CodecType.Union, c1, c2);

  return codec(
    defs.CodecType.Union,
    createUnionTransformer('encode', codecs),
    createUnionTransformer('decode', codecs),
    {
      codecs
    }
  );
};

export const optional = <T extends defs.AnyCodec>(type: T): defs.OptionalCodec<T> => {
  if (!type.props.required) {
    return type;
  }
  return codec(
    type._tag,
    (data) => {
      if (data === undefined) {
        return undefined;
      }
      return type.encode(data);
    },
    (data) => {
      if (data === undefined) {
        return undefined;
      }
      return type.decode(data);
    },
    {
      ...type.props,
      required: false
    }
  );
};
