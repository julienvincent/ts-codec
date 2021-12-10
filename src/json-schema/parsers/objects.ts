import * as defs from '../../definitions';
import { createParser } from '../utils';
import * as root from './root';

export const ObjectParser = createParser<defs.ObjectCodec<defs.AnyObjectCodecShape>>(
  defs.CodecType.Object,
  (codec, options) => {
    const entries = Object.entries(codec.props.shape);
    return {
      type: 'object',
      properties: entries.reduce((acc: Record<string, any>, [key, codec]) => {
        acc[key] = root.RootParser(codec, options);
        return acc;
      }, {}),
      additionalProperties: !!options?.allowAdditional,
      required: entries
        .filter(([, codec]) => {
          return codec.props.required;
        })
        .map(([key]) => key)
    };
  }
);

export const RecordParser = createParser<defs.RecordCodec<defs.AnyCodec>>(defs.CodecType.Record, (codec, options) => {
  return {
    type: 'object',
    additionalProperties: root.RootParser(codec.props.type, options),
    properties: {},
    required: []
  };
});
