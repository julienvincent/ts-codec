import * as defs from '../definitions';
import * as crypto from 'crypto';
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
      resolver: resolver,
      id: crypto.randomBytes(10).toString('hex')
    }
  );
};
