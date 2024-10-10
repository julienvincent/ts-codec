import * as defs from '../definitions';
import * as utils from '../utils';
import { codec } from './codec';
import { TransformError } from '../utils';

const objectAssertion = (data: any) => {
  if (Array.isArray(data)) {
    throw new utils.TransformError('Expected a map but got an array');
  }
  if (typeof data !== 'object') {
    throw new utils.TransformError(`Expected a map but got ${typeof data}`);
  }
};

export const loopWithErrorRecording = <T, R>(entries: [T, R][], cb: (event: [T, R]) => any) => {
  let errors: string[] = [];

  for (let [key, codec] of entries) {
    try {
      cb([key, codec]);
    } catch (ex) {
      if (ex instanceof TransformError) {
        errors.push(
          ...ex.errorsArray.map((e) => {
            return `${key} > ${e}`;
          })
        );
      } else {
        throw ex;
      }
    }
  }

  if (errors.length > 0) {
    throw new TransformError(errors);
  }
};

export const object = <T extends defs.AnyObjectCodecShape>(shape: T): defs.ObjectCodec<T> => {
  const entries = Object.entries(shape);

  const transformer = (transformer: 'encode' | 'decode') => (data: any) => {
    objectAssertion(data);

    let acc: any = {};
    loopWithErrorRecording(entries, ([key, codec]) => {
      const transformed = codec[transformer](data[key]);
      if (transformed !== undefined) {
        acc[key] = transformed;
      }
    });
    return acc;
  };

  return codec(defs.CodecType.Object, transformer('encode'), transformer('decode'), {
    shape
  });
};

export const record = <T extends defs.AnyCodec>(type: T): defs.RecordCodec<T> => {
  const transformer = (transformer: 'encode' | 'decode') => (data: any) => {
    objectAssertion(data);

    let acc: any = {};
    loopWithErrorRecording(Object.entries(data), ([key, value]) => {
      const transformed = type[transformer](value);
      if (transformed !== undefined) {
        acc[key] = transformed;
      }
    });
    return acc;
  };

  return codec(defs.CodecType.Record, transformer('encode'), transformer('decode'), {
    type
  });
};
