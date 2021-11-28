import * as defs from '../definitions';
import { codec } from './codec';

export const recursive = <T extends defs.AnyCodec>(resolver: () => T): defs.RecursiveCodec<T> => {
  const circular = codec(
    defs.CodecType.Recursive,
    (data) => {
      const codec = resolver();
      return codec.encode(data);
    },
    (data) => {
      const codec = resolver();
      return codec.decode(data);
    }
  ) as defs.RecursiveCodec<T>;

  circular.resolver = resolver;

  return circular;
};
