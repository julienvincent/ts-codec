import * as defs from '../definitions';
import * as maps from './maps';
import * as c from './codec';

type SupportedCodec =
  | defs.ObjectCodec<any>
  | defs.Intersection<defs.AnyCodec, defs.AnyCodec>
  | defs.Union<defs.AnyCodec, defs.AnyCodec>;

export type OmitCodec<C extends SupportedCodec, Mask extends string | number | symbol> = defs.Codec<
  Omit<defs.Ix<C>, Mask>,
  Omit<defs.Ox<C>, Mask>,
  defs.Cx<C>['T'],
  defs.Cx<C>['P']
>;

export const omit = <T extends SupportedCodec, K extends keyof defs.Ix<T>, Mask extends [K, ...K[]]>(
  codec: T,
  mask: Mask
): OmitCodec<T, Mask[number]> => {
  const omitFromObjectCodec = (codec: defs.ObjectCodec<any>) => {
    const entries = Object.entries(codec.props.shape).filter(([key]) => {
      return !mask.includes(key as K);
    });
    return maps.object(Object.fromEntries(entries) as any) as any;
  };

  const omitFromIntersectionCodec = <C extends defs.Intersection<any, any>>(codec: C): OmitCodec<C, Mask[number]> => {
    const codecs = codec.props.codecs.map(omitMaskFromCodec);

    return c.codec(
      defs.CodecType.Intersection,
      c.createIntersectionTransformer('encode', codecs),
      c.createIntersectionTransformer('decode', codecs),
      {
        codecs
      }
    );
  };

  const omitFromUnionCodec = <C extends defs.Union<any, any>>(codec: C): OmitCodec<C, Mask[number]> => {
    const codecs = codec.props.codecs.map(omitMaskFromCodec);

    return c.codec(
      defs.CodecType.Union,
      c.createUnionTransformer('encode', codecs),
      c.createUnionTransformer('decode', codecs),
      {
        codecs
      }
    );
  };

  const omitMaskFromCodec = (codec: defs.AnyCodec) => {
    switch (codec._tag) {
      case defs.CodecType.Object: {
        return omitFromObjectCodec(codec);
      }
      case defs.CodecType.Intersection: {
        return omitFromIntersectionCodec(codec);
      }
      case defs.CodecType.Union: {
        return omitFromUnionCodec(codec);
      }
      default: {
        throw new Error(`Unsupported codec ${codec._tag}`);
      }
    }
  };

  return omitMaskFromCodec(codec);
};

export type PartialCodec<C extends SupportedCodec> = defs.Codec<
  Partial<defs.Ix<C>>,
  Partial<defs.Ox<C>>,
  defs.Cx<C>['T'],
  defs.Cx<C>['P']
>;

export const partial = <T extends SupportedCodec>(codec: T): PartialCodec<T> => {
  const partialObjectCodec = (codec: defs.ObjectCodec<defs.AnyObjectCodecShape>) => {
    const entries = Object.entries(codec.props.shape).map(([key, codec]) => {
      return [key, codec.optional()];
    });
    return maps.object(Object.fromEntries(entries));
  };

  const partialIntersectionCodec = <C extends defs.Intersection<any, any>>(codec: C): PartialCodec<C> => {
    const codecs = codec.props.codecs.map(createPartialCodec);

    return c.codec(
      defs.CodecType.Intersection,
      c.createIntersectionTransformer('encode', codecs),
      c.createIntersectionTransformer('decode', codecs),
      {
        codecs
      }
    );
  };

  const partialUnionCodec = <C extends defs.Union<any, any>>(codec: C): PartialCodec<C> => {
    const codecs = codec.props.codecs.map(createPartialCodec);

    return c.codec(
      defs.CodecType.Union,
      c.createUnionTransformer('encode', codecs),
      c.createUnionTransformer('decode', codecs),
      {
        codecs
      }
    );
  };

  const createPartialCodec = (codec: SupportedCodec) => {
    switch (codec._tag) {
      case defs.CodecType.Object: {
        return partialObjectCodec(codec);
      }

      case defs.CodecType.Intersection: {
        return partialIntersectionCodec(codec);
      }
      case defs.CodecType.Union: {
        return partialUnionCodec(codec);
      }
    }
  };

  return createPartialCodec(codec);
};
