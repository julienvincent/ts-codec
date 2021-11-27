import * as defs from '../definitions';
import { codec } from './codec';

export const identityCodec = <T extends defs.CodecType>(type: T): defs.IdentityCodec<T> => {
  return codec(
    type,
    (data) => data,
    (data) => data
  );
};

export const string = identityCodec(defs.CodecType.String);
export const boolean = identityCodec(defs.CodecType.Boolean);
export const number = identityCodec(defs.CodecType.Number);
