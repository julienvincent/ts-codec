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
  return codec(type, transform, transform);
};

export const string = identityCodec(defs.CodecType.String);
export const boolean = identityCodec(defs.CodecType.Boolean);
export const number = identityCodec(defs.CodecType.Number);
