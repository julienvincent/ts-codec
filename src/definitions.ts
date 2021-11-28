export type CommonMetadata = {
  comment?: string;
  [key: string]: any;
};

export type Transformer<I, O> = (data: I) => O;

export type Codec<I, O> = {
  _tag: string;

  meta: (metadata: CommonMetadata) => Codec<I, O>;

  metadata?: CommonMetadata;

  encode: Transformer<I, O>;
  decode: Transformer<O, I>;

  and: <T extends AnyCodec>(codec: T) => Intersection<Codec<I, O>, T>;
  or: <T extends AnyCodec>(codec: T) => Union<Codec<I, O>, T>;

  optional: () => OptionalCodec<Codec<I, O>>;

  required: boolean;
};

export type AnyCodec = Codec<any, any>;

export type TaggedCodec<T, I, O> = Codec<I, O> & {
  _tag: T;
};

export type Ix<C extends AnyCodec> = C extends Codec<infer I, any> ? I : never;
export type Ox<C extends AnyCodec> = C extends Codec<any, infer O> ? O : never;

export type AnyObjectCodecShape = Record<string, AnyCodec>;

type OptionalKeys<T extends object> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

type RequiredKeys<T extends object> = Exclude<keyof T, OptionalKeys<T>>;

type WithOptional<T extends object> = {
  [K in RequiredKeys<T>]: T[K];
} & {
  [K in OptionalKeys<T>]?: T[K];
};

type MappedIx<T extends AnyObjectCodecShape> = WithOptional<{ [K in keyof T]: Ix<T[K]> }>;
type MappedOx<T extends AnyObjectCodecShape> = WithOptional<{ [K in keyof T]: Ox<T[K]> }>;

export enum CodecType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',

  Object = 'object',
  Record = 'record',
  Array = 'array',

  Union = 'union',
  Intersection = 'intersection'
}

export type Intersection<C1 extends AnyCodec, C2 extends AnyCodec> = TaggedCodec<
  CodecType.Intersection,
  Ix<C1> & Ix<C2>,
  Ox<C1> & Ox<C2>
> & {
  codecs: AnyCodec[];
};

export type Union<C1 extends AnyCodec, C2 extends AnyCodec> = TaggedCodec<
  CodecType.Union,
  Ix<C1> | Ix<C2>,
  Ox<C1> | Ox<C2>
> & {
  codecs: AnyCodec[];
};

export type ObjectCodec<T extends AnyObjectCodecShape> = TaggedCodec<CodecType.Object, MappedIx<T>, MappedOx<T>> & {
  shape: T;
};

export type RecordCodec<T extends AnyCodec> = TaggedCodec<
  CodecType.Record,
  Record<string, Ix<T>>,
  Record<string, Ox<T>>
> & {
  type: T;
};

export type ArrayCodec<T extends AnyCodec> = TaggedCodec<CodecType.Array, Ix<T>[], Ox<T>[]> & {
  element: T;
};

type IdentityMapping<T extends CodecType> = T extends CodecType.String
  ? string
  : T extends CodecType.Number
  ? number
  : T extends CodecType.Boolean
  ? boolean
  : never;

export type IdentityCodec<T extends CodecType> = TaggedCodec<T, IdentityMapping<T>, IdentityMapping<T>>;

export type OptionalCodec<T extends AnyCodec> = Codec<Ix<T> | undefined, Ox<T> | undefined>;
