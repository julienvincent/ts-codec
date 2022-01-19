# ts-codec

```bash
npm install ts-codec
```

## Glossary

- [What is ts-codec](#what-is-ts-codec)
  - [Getting started example](#quick-example)
- [Codec Library](#codec-library)
- [Gotchas](#gotchas)
- [Related Projects](#related-projects)

## What is ts-codec

This tool was built to solve a specific set of use-cases surrounding validation and Serialization/Deserialization of data in TypeScript applications. This is achieved by providing a suite of tagged `Codecs` designed to be composed together in order to describe 2-way data schemas and derive static TypeScript types from. These schemas can then be encoded as JSON-Schema to be used for data validation through other excellent JSON-schema validation tools like [AJV](https://github.com/ajv-validator/ajv).

This tool is heavily inspired by other similar tools like [Zod](https://github.com/colinhacks/zod) and [io-ts](https://github.com/gcanti/io-ts) and can almost be seen as a type of marriage of the two in order to achieve something slightly different. The codec API follows Zod's quite closely (Thanks colinhacks for the hard work :) with the exception that it is altered to support two-way transformations of data.

In summary, the goals of this project are:

- Describe a _single_ schema that can;
- Encode and Decode data (Date <-> string, for example)
- Be used to derive TypeScript types from both the Encoded and Decoded form
- Be used to validate data, both in the Encoded and Decoded form

## Quick Example

Just to demonstrate the basics and help get the idea across

```ts
import * as t from 'ts-codecs';

const date = t.codec<Date, string>(
  'Date',
  (date) => date.toISOString(),
  (date) => new Date(date)
);

const schema = t.object({
  name: t.string,
  date: date
});

schema.encode({ name: 'James', date: new Date() }); // { name: 'James', date: '1970-01-01T00:00:00.000Z' }
schema.decode({ name: 'James', date: '1970-01-01T00:00:00.000Z' }); // { name: 'James', date: 1970-01-01T00:00:00.000Z }

type d = t.Decoded<typeof schema>; // { name: string; date: Date; }
type d = t.Encoded<typeof schema>; // { name: string; date: string; }

// Parser for the custom `date` codec that isn't part of the standard set provided by ts-codecs
const DateParser = {
  tag: date._tag,
  parse: () => ({ type: 'string' })
};

t.generateJSONSchema(schema, { parsers: [DateParser] });
/*
=> {
  type: "object",
  properties: {
    name: { type: "string" },
    date: { type: "string" }
  },
  additionalProperties: false,
  required: ["name", "date"]
}
*/
```

## Codec Library

- [Primitives](#primitives)
  - [String](#primitives)
  - [Number](#primitives)
  - [Boolean](#primitives)
  - [Null](#primitives)
  - [Any](#primitives)
  - [Literal](#primitives)
- [Enum](#enumenum)
- [Object](#objectshape)
- [Record](#recordcodec)
- [Array](#arraycodec)
- [Tuple](#tuplecodec)
- [Intersection](#intersections-and-unions)
- [Union](#intersections-and-unions)
- [Optional](#optional)
- [Omit](#omit)
- [Partial](#partial)
- [Metadata](#metametadata)
- [Codec](#codectag-encoder-decoder-props)

### `primitives`

Basic TS primitive types. These can be though of as identity codecs that accept their value and return their value. No transformations happen during encode/decode

```ts
import * as t from 'ts-codec';

t.string;
t.number;
t.boolean;
t.null;
t.any;

// accepts exactly 'value'
t.literal('value');
```

### `.Enum(enum)`

Accepts native TypeScript `enum` values as an input

```ts
import * as t from 'ts-codec';

enum Fruits {
  Apple = 'apple',
  Banana = 'banana',
  Cantaloupe = 'Cantaloupe'
}

const FruitEnum = t.Enum(Fruits);
type d = t.Encoded<typeof FruitEnum>; // Fruits

FruitEnum.encode(Fruits.Apple); // 'apple'
FruitEnum.encode('apple'); // type error
```

### `.object(shape)`

Accepts an arbitrarily nested map of key => codec

```ts
import * as t from 'ts-codec';

const schema = t.object({
  name: t.string
});
type d = t.Encoded<typeof schema>; // {name: string}

schema.encode({ name: 'James' }); // { name: "James" }
```

### `.record(codec)`

A ts-codec equivalent of TypeScript's `Record<key, value>` type. Accepts a Codec to be used as the record value

```ts
import * as t from 'ts-codec';

const schema = t.record(t.string);
type d = t.Encoded<typeof schema>; // Record<string, string>

schema.encode({ a: 'b', c: 'd' }); // { a: 'b', c: 'd' }
```

### `.array(codec)`

A ts-codec equivalent of TypeScript's `Array<T>` type. Accepts a Codec to be used as the array elements

```ts
import * as t from 'ts-codec';

const array = t.array(t.string);
type d = t.Encoded<typeof array>; // Array<string>

array.encode(['1', '2']); // ['1', '2']
```

### `.tuple(codec[])`

Equivalent to TypeScript's `[T1, T2, ...T3[]]` type semantics. Accepts an array of Codec's to be used positionally against array elements

```ts
import * as t from 'ts-codec';

const tuple = t.tuple([t.string, t.number, t.boolean]);
type d = t.Encoded<typeof tuple>; // [string, number, boolean]

array.encode(['1', 2, true]); // ['1', 2, true]
array.encode(['1', '2', 3]); // type error
```

## Intersections and Unions

### `.and(codec)`, `.or(codec)`

Intersections and unions can be created by calling `.and(codec)` and `.or(codec)` on any codec.

Calling `.and` and `.or` on a codec produces a new codec. It does _not_ modify the original

```ts
import * as t from 'ts-codec';

const A = t.object({
  a: t.string.or(t.number)
});

const B = t.object({
  b: t.boolean.or(t.null)
});

const schema = A.and(B);
type d = t.Encoded<typeof schema>; // { a: string | number, b: boolean | null }

schema.encode({ a: '', b: null }); // {a: '', b: null}
```

### `.optional()`

Any codec can be made optional by calling `.optional()` on the codec.

Calling `.optional` on a codec produces a new codec. It does _not_ modify the original

```ts
import * as t from 'ts-codec';

const schema = t.object({
  a: t.string.optional(),
  b: t.number
});

type d = t.Encoded<typeof schema>; // {a?: string | undefined, b: number}

schema.encode({ b: 1 }); // {b: 1}
```

### `.omit(codec, mask)`

Calling `.omit(codec, mask)` will produce a new codec with object properties omitted according to the given mask. Acts similar to TS `Omit<T, Mask>`.

Calling `.omit` on a codec produces a new codec. It does _not_ modify the original

```ts
import * as t from 'ts-codec';

const Schema = t.object({
  a: t.string,
  b: t.number
});
const WithOmit = t.omit(Schema, ['b']);

type d = t.Encoded<typeof WithOmit>; // {a: string}

schema.encode({ a: '1' }); // {a: '1'}
```

### `.partial(codec)`

Calling `.partial(codec)` will produce a new codec with all top-level object properties made optional. Acts similar to TS `Partial<T>`.

Calling `.partial` on a codec produces a new codec. It does _not_ modify the original

```ts
import * as t from 'ts-codec';

const Schema = t.object({
  a: t.string,
  b: t.number
});
const WithPartial = t.partial(Schema);

type d = t.Encoded<typeof WithPartial>; // {a?: string, b?: number}

schema.encode({ b: 1 }); // {b: 1}
```

### `.meta(metadata)`

Codecs can have arbitrary metadata associated with them. This information is mostly intended to be consumed by codec parsers to assist in generation of data. An example usage of this would be adding `description` fields to JSON-schema or specifying special validation properties like `min: 1` or `pattern: /abc/`.

Calling `.meta` on a codec produces a new codec. It does _not_ modify the original

```ts
import * as t from 'ts-codec';

const schema = t.object({
  name: t.string.meta({
    description: 'The name of the schema'
  }),
  things: t.number.meta({
    description: 'The number of things this schema can have',
    min: 5
  })
});
```

### `.codec(tag, encoder, decoder[, props])`

The `.codec` function can be used to construct custom codecs. Any codec can be constructed with this util - in fact all codecs exposed were internally crafted by this.

The `tag` is a unique identifier for the codec _type_ and should not collide with any of the other codecs. This value can be used by parsers in order to generate data from a codec tree. For example, the JSON-Schema generator included uses these to determine what type of JSON-schema to produce as it encounters codecs.

When building custom codecs it is important to ensure that they check the data they are transforming. If incoming data is unexpected then they _must_ explicitly throw. This behavior is relied upon to support unions which will sequentially encode/decode data using codecs until one succeeds.

```ts
import * as t from 'ts-codec';

const date = t.codec<Date, string>(
  'Date',
  (date) => date.toISOString(),
  (date) => new Date(date)
);

type d = t.Encoded<typeof date>; // string
type d = t.Decoded<typeof date>; // Date

schema.encode(new Date()); // '1970-01-01T00:00:00.000Z'
schema.decode(new Date()); // Date 1970-01-01T00:00:00.000Z
```

# Gotchas

## The order of codecs in a union matter

It is important to ensure that the more specific codecs appear first in a union chain in order to ensure they are used to parse matching data.

For example

```ts
date.or(t.string).decode('1970-01-01T00:00:00.000Z'); // => Date 1970-01-01T00:00:00.000Z // good!
t.string.or(date).decode('1970-01-01T00:00:00.000Z'); // => '1970-01-01T00:00:00.000Z' // bad!

// or more extreme

t.string.or(t.Any); // good
t.Any.or(t.string); // bad
```

## Intersections of `.object()` and `.record()`

In the current implementation, intersections between `.object()` and `.record()` won't work as expected if the record and object define different codec values.

I haven't given enough thought to what the expected behaviour should be in this scenario.

```ts
const schema = t.object({ a: t.string }).and(t.record(t.string)); // This is fine, can be used to define known keys
type Schema = t.Encoded<typeof schema>; // {a: string} & Record<string, string>

schema.encode({ a: '', b: '' }); // works

// ==

const schema = t.object({ a: t.string }).and(t.record(t.boolean)); // This won't work. The type will be correct but it won't be able to transform data

schema.encode({ a: '', b: true }); // The record encoder will throw
```

One way of solving this might be to pass only the subset of data that was not evaluated against the object codec to the record codec.

## Related Projects

### io-ts

[https://github.com/gcanti/io-ts](https://github.com/gcanti/io-ts)

The concept of Codecs was inspired by this project, but there are a few differences:

+ The very functional API is can be quite verbose, both for defining custom Codecs and for building schemas. The Zod API however is debatably much more pragmatic.
+ There is limited or no support for converting io-ts schemas into JSON-Schema. This is a problem for two reasons:
  + There is no nice way to have cross-language compatibility
  + There is no nice way to generate API documentation

Ts-codec on the other hand was built with a focus on being parsable - allowing it to be easily transformed to JSON-Schema or other data formats

### zod

[https://github.com/colinhacks/zod](https://github.com/colinhacks/zod)

The API for ts-codec was primarily based on Zod's, but also with a few differences:

+ Zod can only describe transformation of data in one direction.
+ Zod can only validate data on the `input` side of it's data transformation
+ While possible to generate JSON-Schema for Zod schemas, they can only be generated for the `input` side of it's transformation
