import * as defs from '../definitions';
import * as utils from '../utils';
import { codec } from './codec';

export const array = <T extends defs.AnyCodec>(type: T): defs.ArrayCodec<T> => {
  const assertion = (data: any) => {
    if (!Array.isArray(data)) {
      throw new utils.TransformError([`Expected an array but got ${typeof data}`]);
    }
  };
  return codec(
    defs.CodecType.Array,
    (data) => {
      assertion(data);
      return data.map(type.encode);
    },
    (data) => {
      assertion(data);
      return data.map(type.decode);
    },
    {
      type
    }
  );
};

export const tuple = <T extends defs.AnyTuple>(tuple: T): defs.TupleCodec<T> => {
  const transformer = (transformation: 'encode' | 'decode') => (data: any) => {
    if (!Array.isArray(data)) {
      throw new utils.TransformError([`Expected an array but got ${typeof data}`]);
    }
    if (data.length !== tuple.length) {
      throw new utils.TransformError([
        `Given tuple does not match schema. Length mismatch ${tuple.length} !== ${data.length}`
      ]);
    }
    return tuple.map((codec, i) => {
      return codec[transformation](data[i]);
    }) as any;
  };

  return codec(defs.CodecType.Tuple, transformer('encode'), transformer('decode'), {
    codecs: tuple
  });
};
