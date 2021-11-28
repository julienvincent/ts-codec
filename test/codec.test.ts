import * as t from '../src';

describe('codecs', () => {
  const date = t.codec<Date, string>(
    'Date',
    (date) => date.toISOString(),
    (date) => new Date(date)
  );

  test('it should correctly transform a custom type', () => {
    const reference = new Date();
    expect(date.encode(reference)).toBe(reference.toISOString());
    expect(date.decode(reference.toISOString()).getTime()).toBe(reference.getTime());
  });

  test('it should correctly transform an object', () => {
    const schema = t.object({
      created_at: date
    });

    const reference = new Date();
    expect(schema.encode({ created_at: reference })).toEqual({ created_at: reference.toISOString() });
    expect(schema.decode({ created_at: reference.toISOString() }).created_at.getTime()).toBe(reference.getTime());
  });

  test('it should correctly transform an object', () => {
    const schema = t.object({
      created_at: date
    });

    const reference = new Date();
    expect(schema.encode({ created_at: reference })).toEqual({ created_at: reference.toISOString() });
    expect(schema.decode({ created_at: reference.toISOString() }).created_at.getTime()).toBe(reference.getTime());
  });

  test('it should correctly transform a record', () => {
    const schema = t.record(date.or(t.string));

    const reference = new Date();
    expect(schema.encode({ created_at: reference, thing: '123' })).toEqual({
      created_at: reference.toISOString(),
      thing: '123'
    });
    expect(schema.decode({ created_at: reference.toISOString() })).toEqual({ created_at: reference });
  });

  test('it should correctly transform an array', () => {
    const schema = t.array(date);

    const reference = new Date();
    expect(schema.encode([reference])).toEqual([reference.toISOString()]);
    expect(schema.decode([reference.toISOString()])[0].getTime()).toBe(reference.getTime());
  });

  test('it should correctly transform a union', () => {
    const schema = t.array(date).or(t.string);

    const reference = new Date();
    expect(schema.encode([reference])).toEqual([reference.toISOString()]);
    expect(schema.encode('123')).toEqual('123');

    expect((schema.decode([reference.toISOString()])[0] as Date).getTime()).toBe(reference.getTime());
    expect(schema.decode('123')).toBe('123');
  });

  test('it should correctly transform an intersection', () => {
    const schema = t
      .object({
        a: t.string
      })
      .and(
        t.object({
          b: t.string
        })
      )
      .and(
        t.object({
          c: date
        })
      );

    const reference = new Date();

    expect(
      schema.encode({
        a: '123',
        b: '123',
        c: reference
      })
    ).toEqual({
      a: '123',
      b: '123',
      c: reference.toISOString()
    });

    expect(
      schema.decode({
        a: '123',
        b: '123',
        c: reference.toISOString()
      })
    ).toEqual({
      a: '123',
      b: '123',
      c: reference
    });
  });

  test('it should correctly transform a recursive codec', () => {
    type RecursiveDecoded = {
      a: Date;
      b?: RecursiveDecoded;
    };

    type RecursiveEncoded = {
      a: string;
      b?: RecursiveEncoded;
    };

    const Recursive: t.Codec<RecursiveDecoded, RecursiveEncoded> = t.recursive(() => {
      return t.object({
        a: date,
        b: Recursive.optional()
      });
    });

    const reference = new Date();
    expect(
      Recursive.encode({
        a: reference,
        b: {
          a: reference
        }
      })
    ).toEqual({
      a: reference.toISOString(),
      b: {
        a: reference.toISOString()
      }
    });

    expect(
      Recursive.decode({
        a: reference.toISOString(),
        b: {
          a: reference.toISOString()
        }
      })
    ).toEqual({
      a: reference,
      b: {
        a: reference
      }
    });
  });
});
