import * as gen from '../generation';
import * as t from '../';
import * as bson from 'bson';

const schema = t
  .object({ a: t.string })
  .and(t.object({ B: t.string }))
  .and(
    t.object({
      n: t.number.or(t.string),
      k: t.number.optional()
    })
  );

const res = schema.encode({
  B: '',
  a: '',
  n: 1
});
console.log(res);

// type schema = t.Ox<typeof schema>;

// // const sss: schema = {

// // }

const ObjectId = t.codec<bson.ObjectId, string>(
  'ObjectId',
  (id) => id.toHexString(),
  (id) => new bson.ObjectId(id)
);

const ResourceId = t.codec<{ _id: bson.ObjectId }, { id: string }>(
  'ResourceId',
  (data) => {
    return {
      id: ObjectId.encode(data._id)
    };
  },
  (data) => {
    return {
      _id: ObjectId.decode(data.id)
    };
  }
);

// console.log(ResourceId.encode({ _id: new bson.ObjectId() }));
// console.log(ResourceId.decode(ResourceId.encode({ _id: new bson.ObjectId() })));

const Thing = ResourceId.and(
  t.object({
    a: t.string
  })
);

const res2 = Thing.encode({
  _id: new bson.ObjectId('61a218fb4775455399be93ad'),
  a: ''
});
console.log(res2);

// type ttt = t.Ix<typeof Thing>;

// const schema2 = t
//   .object({
//     a: t.string.optional()
//   })
//   .and(
//     t.object({
//       b: t.string,
//       c: t.array(t.string).or(t.number)
//     })
//   );

// console.log(
//   schema2.encode({
//     b: '',
//     c: 1
//   })
// );

// console.log(JSON.stringify(gen.generateJSONSchema(schema2), null, 2));

// console.log(
//   JSON.stringify(
//     gen.generateJSONSchema(Thing, {
//       side: gen.Side.Encoded,
//       extensions: [
//         {
//           tag: 'ResourceId',
//           parse: (c, options) => {
//             if (options.side === gen.Side.Encoded) {
//               return {
//                 type: 'object',
//                 properties: {
//                   id: { type: 'string' }
//                 },
//                 required: ['id']
//               };
//             } else {
//               return {
//                 type: 'object',
//                 properties: {
//                   _id: { bsonType: 'ObjectId' }
//                 },
//                 required: ['_id']
//               };
//             }
//           }
//         }
//       ]
//     }),
//     null,
//     2
//   )
// );
