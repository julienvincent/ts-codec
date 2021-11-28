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
