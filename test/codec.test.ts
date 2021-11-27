import * as t from '../src';

describe('codecs', () => {
  const date = t.codec<Date, string>(
    'Date',
    (date) => date.toISOString(),
    (date) => new Date(date)
  );

  test('it should correctly encode a custom type', () => {
    const reference = new Date();
    expect(date.encode(reference)).toBe(reference.toISOString());
    expect(date.decode(reference.toISOString()).getTime()).toBe(reference.getTime());
  });

  test('it should correctly encode an object', () => {
    const schema = t.object({
      created_at: date
    });

    const reference = new Date();
    expect(schema.encode({ created_at: reference })).toEqual({ created_at: reference.toISOString() });
    expect(schema.decode({ created_at: reference.toISOString() }).created_at.getTime()).toBe(reference.getTime());
  });

  test('it should correctly encode an object', () => {
    const schema = t.object({
      created_at: date
    });

    const reference = new Date();
    expect(schema.encode({ created_at: reference })).toEqual({ created_at: reference.toISOString() });
    expect(schema.decode({ created_at: reference.toISOString() }).created_at.getTime()).toBe(reference.getTime());
  });
});
