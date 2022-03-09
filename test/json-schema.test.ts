import * as t from '../src';

describe('json-schema', () => {
  const date = t.codec<Date, string>(
    'Date',
    (date) => date.toISOString(),
    (date) => new Date(date)
  );

  const A = t.object({
    a: t.string
  });

  const B = t.object({
    b: t.string
  });

  const C = t.object({
    c: t.string
  });

  const D = t.object({
    d: t.string
  });

  test('it should handle a simple identity schema', () => {
    enum SomeEnum {
      A = 'a',
      B = 'b'
    }

    const identity_schema = t.object({
      string: t.string,
      number: t.number,
      boolean: t.boolean,
      any: t.any,
      null: t.Null,
      literal_string: t.literal('literal'),
      literal_num: t.literal(1),
      literal_bool: t.literal(true),
      enum: t.Enum(SomeEnum),
      tuple: t.tuple([t.string, t.number]),
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
          t
            .object({
              b: t.number
            })
            .or(
              t.object({
                c: t.number
              })
            )
        ),

      with_description: t.string.meta({
        description: 'This is a description'
      })
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

    const RecursiveCodec: t.Codec<Schema, Schema> = t.recursive('RecursiveCodec', () => {
      return t.object({
        a: t.string,
        b: RecursiveCodec.optional()
      });
    });

    expect(t.generateJSONSchema(RecursiveCodec)).toMatchSnapshot();
  });

  test('it should merge intersections', () => {
    expect(t.generateJSONSchema(A.and(B).and(C))).toMatchSnapshot();
    expect(t.generateJSONSchema(A.and(A))).toMatchSnapshot();
  });

  test('it should product intersections containing union and object schemas', () => {
    expect(t.generateJSONSchema(A.and(B.or(C)))).toMatchSnapshot();
  });

  test('it should intersect a set of only unions', () => {
    expect(t.generateJSONSchema(A.or(B).and(C.or(D)))).toMatchSnapshot();
  });
});
