import * as defs from '../definitions';
import * as utils from '../utils';
import { codec } from './codec';

export const array = <T extends defs.AnyCodec>(element: T): defs.ArrayCodec<T> => {
  const assertion = (data: any) => {
    if (!Array.isArray(data)) {
      throw new utils.TransformError([`Expected an array but got ${typeof data}`]);
    }
  };
  const array = codec(
    defs.CodecType.Array,
    (data) => {
      assertion(data);
      return data.map(element.encode);
    },
    (data) => {
      assertion(data);
      return data.map(element.decode);
    }
  ) as defs.ArrayCodec<T>;

  array.element = element;

  return array;
};
