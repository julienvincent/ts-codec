import * as defs from '../definitions';
import { codec } from './codec';

export const recursive = <T extends defs.AnyCodec>(id: string, resolver: () => T): defs.RecursiveCodec<T> => {
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
      id: id,
      resolver: resolver
    }
  );
};
