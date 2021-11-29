import * as defs from '../definitions';
import { codec } from './codec';

export const recursive = <T extends defs.AnyCodec>(resolver: () => T): defs.RecursiveCodec<T> => {
  return codec(
    defs.CodecType.Recursive,
    (data) => {
      const codec = resolver();
      return codec.encode(data);
    },
    (data) => {
      const codec = resolver();
      return codec.decode(data);
    },
    {
      id: String(Math.floor(Math.random() * (100000 + 1))),
      resolver: resolver
    }
  );
};
