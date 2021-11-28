import * as defs from '../definitions';
import * as utils from '../utils';
import { codec } from './codec';

export const identityCodec = <T extends defs.CodecType>(type: T): defs.IdentityCodec<T> => {
  const transform = (data: defs.Ix<defs.IdentityCodec<T>>) => {
    if (typeof data !== type) {
      throw new utils.TransformError([`type must be ${type}, received ${typeof data}`]);
    }
    return data;
  };
  return codec(type, transform, transform) as any;
};

export const string = identityCodec(defs.CodecType.String);
export const boolean = identityCodec(defs.CodecType.Boolean);
export const number = identityCodec(defs.CodecType.Number);

export const literal = <T extends string>(literal: T): defs.LiteralCodec<T> => {
  const transform = (data: T) => {
    if (data !== literal) {
      throw new utils.TransformError([`Expected '${literal}' but go '${data}'`]);
    }
    return data;
  };
  return codec(defs.CodecType.Literal, transform, transform);
};

const assertNull = (data: null) => {
  if (data !== null) {
    throw new utils.TransformError([`expected value to be null`]);
  }
  return null;
};
export const Null: defs.Codec<null, null, defs.CodecType.Null> = codec(defs.CodecType.Null, assertNull, assertNull);

export const any: defs.Codec<any, any, defs.CodecType.Any> = codec(
  defs.CodecType.Any,
  (data) => data,
  (data) => data
);

export const Enum = <T extends defs.EnumLike>(native_enum: T): defs.EnumCodec<T> => {
  const values = Object.values(native_enum);

  const transformer = (data: any) => {
    if (!values.includes(data)) {
      throw new utils.TransformError([`Expected ${data} to match one of ${values}`]);
    }
    return data;
  };

  return codec(defs.CodecType.Enum, transformer, transformer, {
    enum: native_enum
  });
};
