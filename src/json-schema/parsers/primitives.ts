import * as defs from '../../definitions';
import { createParser } from '../utils';

export const createPrimitiveParser = <T extends defs.CodecType>(type: T) => {
  return createParser(type, () => {
    return { type };
  });
};

export const StringParser = createPrimitiveParser(defs.CodecType.String);
export const NumberParser = createPrimitiveParser(defs.CodecType.Number);
export const BooleanParser = createPrimitiveParser(defs.CodecType.Boolean);
export const NullParser = createPrimitiveParser(defs.CodecType.Null);

export const AnyParser = createParser<defs.AnyCodec>(defs.CodecType.Any, () => {
  return {};
});

export const EnumParser = createParser<defs.EnumCodec<any>>(defs.CodecType.Enum, (codec) => {
  return {
    type: 'string',
    enum: Object.values(codec.props.enum)
  };
});

export const LiteralParser = createParser<defs.LiteralCodec<any>>(defs.CodecType.Literal, (codec) => {
  return {
    type: 'string',
    const: codec.props.value
  };
});
