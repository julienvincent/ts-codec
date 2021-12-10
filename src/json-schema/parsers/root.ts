import { AnyCodec } from '../../definitions';
import * as defs from '../definitions';

export const RootParser = (codec: AnyCodec, options: defs.ParserContext) => {
  const parser = options.parsers.find((parser) => parser.tag === codec._tag);
  if (!parser) {
    throw new Error(`No parser configured for codec ${codec._tag}`);
  }
  const schema = parser.parse(codec, options);

  if (codec.props.metadata?.description) {
    return {
      description: codec.props.metadata.description,
      ...schema
    };
  }

  return schema;
};
