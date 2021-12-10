import { AnyCodec } from '../definitions';

export enum TransformTarget {
  Encoded = 'encoded',
  Decoded = 'decoded'
}

export type BaseParserParams = {
  target: TransformTarget;
  parsers: Parser<string, AnyCodec>[];
  allowAdditional: boolean;
};

export type GenerationOptions = Partial<BaseParserParams>;

export type RecursiveCodecCache = Map<string, any>;
export type ParserContext = BaseParserParams & {
  cache: RecursiveCodecCache;
};

export type ParserFunction<C extends AnyCodec> = (codec: C, context: ParserContext) => any;
export type Parser<T extends string, C extends AnyCodec> = {
  tag: T;
  parse: ParserFunction<C>;
};
