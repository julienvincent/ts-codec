export type CommonMetadata = {
  description?: string;
  [key: string]: any;
};

export type CodecProps = {
  metadata?: CommonMetadata;
  required?: boolean;
  [key: string]: any;
};

export type Transformer<I, O> = (data: I) => O;

export type Codec<I, O, T = string, P = CodecProps> = {
  _tag: T;
  props: CodecProps & P;

  meta: (metadata: CommonMetadata) => Codec<I, O, T, P>;

  encode: Transformer<I, O>;
  decode: Transformer<O, I>;

  and: <T extends AnyCodec>(codec: T) => Intersection<Codec<I, O>, T>;
  or: <T extends AnyCodec>(codec: T) => Union<Codec<I, O>, T>;

  optional: () => OptionalCodec<Codec<I, O>>;
};

export type PassThroughCodec<T> = Codec<T, T>;

export type AnyCodec = Codec<any, any, any, any>;

export type Cx<C extends AnyCodec> = C extends Codec<infer I, infer O, infer T, infer P>
  ? { I: I; O: O; T: T; P: P }
  : never;
export type Ix<C extends AnyCodec> = Cx<C>['I'];
export type Ox<C extends AnyCodec> = Cx<C>['O'];

export type Encoded<T extends AnyCodec> = Ox<T>;
export type Decoded<T extends AnyCodec> = Ix<T>;

export type AnyObjectCodecShape = Record<string, AnyCodec>;

type OptionalKeys<T extends AnyObjectCodecShape> = {
  [K in keyof T]: T[K] extends OptionalCodec<any> ? K : never;
}[keyof T];

type RequiredKeys<T extends AnyObjectCodecShape> = Exclude<keyof T, OptionalKeys<T>>;

type WithOptional<T extends AnyObjectCodecShape> = {
  [K in RequiredKeys<T>]: T[K];
} & {
  [K in OptionalKeys<T>]?: T[K];
};

type MappedIx<T extends AnyObjectCodecShape> = { [K in keyof T]: Ix<T[K]> };
type MappedOx<T extends AnyObjectCodecShape> = { [K in keyof T]: Ox<T[K]> };

export enum CodecType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Literal = 'literal',
  Enum = 'enum',
  Null = 'null',
  Any = 'any',

  Optional = 'optional',

  Object = 'object',
  Record = 'record',
  Array = 'array',
  Tuple = 'tuple',

  Recursive = 'recursive',

  Union = 'union',
  Intersection = 'intersection'
}

export type Intersection<C1 extends AnyCodec, C2 extends AnyCodec> = Codec<
  Ix<C1> & Ix<C2>,
  Ox<C1> & Ox<C2>,
  CodecType.Intersection,
  {
    codecs: AnyCodec[];
  }
>;

export type Union<C1 extends AnyCodec, C2 extends AnyCodec> = Codec<
  Ix<C1> | Ix<C2>,
  Ox<C1> | Ox<C2>,
  CodecType.Union,
  {
    codecs: AnyCodec[];
  }
>;

export type ObjectCodec<T extends AnyObjectCodecShape> = Codec<
  MappedIx<WithOptional<T>>,
  MappedOx<WithOptional<T>>,
  CodecType.Object,
  {
    shape: T;
  }
>;

export type RecordCodec<T extends AnyCodec> = Codec<
  Record<string, Ix<T>>,
  Record<string, Ox<T>>,
  CodecType.Record,
  {
    type: T;
  }
>;

export type ArrayCodec<T extends AnyCodec> = Codec<
  Ix<T>[],
  Ox<T>[],
  CodecType.Array,
  {
    type: T;
  }
>;

export type AnyTuple = [AnyCodec, ...AnyCodec[]];

export type AssertArray<T> = T extends any[] ? T : never;
export type TupleIx<T extends AnyTuple> = AssertArray<{
  [k in keyof T]: T[k] extends AnyCodec ? Ix<T[k]> : never;
}>;
export type TupleOx<T extends AnyTuple> = AssertArray<{
  [k in keyof T]: T[k] extends AnyCodec ? Ox<T[k]> : never;
}>;

export type TupleCodec<T extends AnyTuple> = Codec<
  TupleIx<T>,
  TupleOx<T>,
  CodecType.Tuple,
  {
    codecs: T;
  }
>;

export type RecursiveCodec<T extends AnyCodec> = Codec<
  Ix<T>,
  Ox<T>,
  CodecType.Recursive,
  {
    id: string;
    resolver: () => T;
  }
>;

export type OptionalCodec<T extends AnyCodec> = Codec<
  Ix<T> | undefined,
  Ox<T> | undefined,
  CodecType.Optional,
  Cx<T>['P']
>;

type IdentityMapping<T extends CodecType> = T extends CodecType.String
  ? string
  : T extends CodecType.Number
  ? number
  : T extends CodecType.Boolean
  ? boolean
  : never;

export type IdentityCodec<T extends CodecType> = Codec<IdentityMapping<T>, IdentityMapping<T>, T>;

export type LiteralCodec<T extends string | number | boolean | null> = Codec<
  T,
  T,
  CodecType.Literal,
  {
    value: T;
  }
>;

export type EnumLike = {
  [key: string]: string;
};
export type EnumCodec<T extends EnumLike> = Codec<
  T[keyof T],
  T[keyof T],
  CodecType.Enum,
  {
    enum: EnumLike;
  }
>;
