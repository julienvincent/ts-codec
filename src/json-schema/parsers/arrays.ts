import * as defs from '../../definitions';
import { createParser } from '../utils';
import * as root from './root';

export const ArrayParser = createParser<defs.ArrayCodec<defs.AnyCodec>>(defs.CodecType.Array, (codec, options) => {
  return {
    type: 'array',
    items: root.RootParser(codec.props.type, options)
  };
});

export const TupleParser = createParser<defs.TupleCodec<defs.AnyTuple>>(defs.CodecType.Tuple, (codec, options) => {
  return {
    type: 'array',
    items: codec.props.codecs.map((codec) => root.RootParser(codec, options)),
    minItems: codec.props.codecs.length,
    maxItems: codec.props.codecs.length
  };
});
