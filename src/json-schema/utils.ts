import { ParserFunction, Parser } from './definitions';
import { AnyCodec } from '../definitions';

export const createParser = <C extends AnyCodec, T extends string = string>(
  tag: T,
  parser: ParserFunction<C>
): Parser<T, C> => {
  return {
    tag,
    parse: parser
  };
};
