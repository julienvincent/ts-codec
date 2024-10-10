import * as defs from './definitions';

export class TransformError extends Error {
  constructor(readonly errors: string | string[]) {
    super(Array.isArray(errors) ? errors.join(', ') : errors);
    this.name = 'TransformError';
  }

  get errorsArray() {
    return Array.isArray(this.errors) ? this.errors : [this.errors];
  }
}

export function isCodecType<T extends defs.CodecType.String | defs.CodecType.Number | defs.CodecType.Boolean>(
  codec: defs.AnyCodec,
  type: T
): codec is defs.IdentityCodec<T>;
export function isCodecType(codec: defs.AnyCodec, type: defs.CodecType.Object): codec is defs.ObjectCodec<any>;
export function isCodecType(
  codec: defs.AnyCodec,
  type: defs.CodecType.Intersection
): codec is defs.Intersection<defs.AnyCodec, defs.AnyCodec>;
export function isCodecType(
  codec: defs.AnyCodec,
  type: defs.CodecType.Union
): codec is defs.Union<defs.AnyCodec, defs.AnyCodec>;
export function isCodecType(codec: defs.AnyCodec, type: defs.CodecType) {
  return codec._tag === type;
}
