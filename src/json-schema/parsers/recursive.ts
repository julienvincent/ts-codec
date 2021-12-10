import * as defs from '../../definitions';
import { createParser } from '../utils';
import * as root from './root';

export const RecursiveParser = createParser<defs.RecursiveCodec<defs.AnyCodec>>(
  defs.CodecType.Recursive,
  (codec, options) => {
    const ref = {
      $ref: `#/definitions/${codec.props.id}`
    };

    const cached = options.cache.get(codec.props.id);
    if (cached) {
      return ref;
    }

    options.cache.set(codec.props.id, {});
    /**
     * The schema is applied to the definition _after_ pushing the definition to the cache
     * to ensure that there are no cache misses from calling RootParser
     */
    options.cache.set(codec.props.id, root.RootParser(codec.props.resolver(), options));

    return ref;
  }
);
