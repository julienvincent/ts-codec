# ts-codec

This tool was built to solve a specific set of use-cases surrounding validation and Serialization/Deserialization of data in TypeScript applications. This is achieved by providing a suite of tagged `Codecs` designed to be composed together in order to describe 2-way data schemas and derive static TypeScript types from. These schemas can also be encoded as JSON-Schema to be used for data validation.

This tool is heavilly inspired by other similar tools like [Zod](https://github.com/colinhacks/zod) and [io-ts](https://github.com/gcanti/io-ts) and can almost be seen as a type of marriage of the two in order to achieve something slightly different. The codec API is an almost direct copy of Zod (Thanks colinhacks for the hard work :)

Quick example:

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

schema.encode({ name: 'James', date: new Date() }) // { name: 'James', date: '1970-01-01T00:00:00.000Z' }
schema.decode({ name: 'James', date: '1970-01-01T00:00:00.000Z' }) // { name: 'James', date: 1970-01-01T00:00:00.000Z }

t.Decoded<typeof schema> // { name: string; date: Date; }
t.Encoded<typeof schema> // { name: string; date: string; }

// Parser for the custom `date` codec that isn't part of the standard set provided by ts-codecs
const DateParser = {
  tag: date._tag,
  parse: () => ({ type: "string" })
}

t.generateJSONSchema(schema, { parsers: [ DateParser ]})
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

## TODO

- Check behaviour of `t.object().and(t.record())` which would result in overwriting data in `object`
- Document that transformers should check and throw on invalid data
- Document that a more specific codec should precede a less specific one. For example `t.date.or(t.string)` instead of `t.string.or(t.date)`
