import * as defs from '../definitions';
import { codec } from './codec';

export const object = <T extends defs.AnyObjectCodecShape>(shape: T): defs.ObjectCodec<T> => {
  const entries = Object.entries(shape);

  const object = codec(
    defs.CodecType.Object,
    (data: any) => {
      return entries.reduce((acc: any, [key, codec]) => {
        acc[key] = codec.encode(data[key]);
        return acc;
      }, {}) as any;
    },
    (data) => {
      return entries.reduce((acc: any, [key, codec]) => {
        acc[key] = codec.decode(data[key]);
        return acc;
      }, {}) as any;
    }
  ) as defs.ObjectCodec<T>;

  object.shape = shape;

  return object;
};

export const array = <T extends defs.AnyCodec>(element: T): defs.ArrayCodec<T> => {
  const array = codec(
    defs.CodecType.Array,
    (data) => {
      return data.map(element.encode);
    },
    (data) => {
      return data.map(element.decode);
    }
  ) as defs.ArrayCodec<T>;

  array.element = element;

  return array;
};
