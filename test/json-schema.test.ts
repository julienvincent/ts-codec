import * as t from '../src';

describe('json-schema', () => {
  const date = t.codec<Date, string>(
    'Date',
    (date) => date.toISOString(),
    (date) => new Date(date)
  );

  test('it should handle a simple identity schema', () => {
    const identity_schema = t.object({
      string: t.string,
      number: t.number,
      boolean: t.boolean,
      multi: t.string.or(t.number).or(t.boolean),
      optional: t.string.optional(),

      array: t.array(t.string),
      deeper_array: t.array(t.object({ a: t.string })),

      record: t.record(t.string),

      intersection: t
        .object({
          a: t.string
        })
        .and(
          t.object({
            b: t.number
          })
        )
    });

    expect(t.generateJSONSchema(identity_schema)).toMatchSnapshot();
  });

  test('it should generate schemas from dual codecs', () => {
    const schema = t.object({
      created_at: date
    });

    const DateParser = t.createParser('Date', (codec, options) => {
      switch (options.target) {
        case t.TransformTarget.Encoded: {
          return {
            type: 'string'
          };
        }

        case t.TransformTarget.Decoded: {
          return {
            nodeType: 'date'
          };
        }
      }
    });

    expect(
      t.generateJSONSchema(schema, { target: t.TransformTarget.Encoded, parsers: [DateParser] })
    ).toMatchSnapshot();
    expect(
      t.generateJSONSchema(schema, { target: t.TransformTarget.Decoded, parsers: [DateParser] })
    ).toMatchSnapshot();
  });

  test('it should generate schemas from recursive codecs', () => {
    type Schema = {
      a: string;
      b?: Schema;
    };

    const schema: t.Codec<Schema, Schema> = t.recursive(() => {
      return t.object({
        a: t.string,
        b: schema.optional()
      });
    });

    expect(t.generateJSONSchema(schema)).toMatchSnapshot();
  });
});
