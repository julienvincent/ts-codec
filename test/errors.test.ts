import { describe, test, expect, it } from 'vitest';
import * as t from '../src';
import { TransformError } from '../src';

describe('codecs', () => {
  it('should correctly report missing fields in a object recursively', () => {
    const object = t.object({
      field_1: t.string,
      field_2: t.boolean,
      field_3: t.object({
        field_4: t.string
      })
    });

    let errors: string[] = [];
    try {
      object.encode({
        // @ts-ignore
        field_3: {}
      });
    } catch (ex) {
      errors = (ex as TransformError).errorsArray;
    }
    expect(errors).toMatchSnapshot();
  });

  it('should correctly report wrong fields in a record', () => {
    const object = t.record(t.string);

    let errors: string[] = [];
    try {
      object.encode({
        // @ts-ignore
        field_1: null,
        // @ts-ignore
        field_2: undefined,
        // @ts-ignore
        field_3: {},
        // @ts-ignore
        field_4: 'hello world'
      });
    } catch (ex) {
      errors = (ex as TransformError).errorsArray;
    }
    expect(errors).toMatchSnapshot();
  });
});
