import { inputObjectType } from 'nexus';

export const KlineDataOrderByInput = inputObjectType({
  name: 'KlineDataOrderByInput',
  definition(t) {
    t.field('startTime', { type: 'SortOrder' });
    t.field('createdAt', { type: 'SortOrder'})
  },
});


export const KlineDataWhereUniqueInput = inputObjectType({
  name: 'KlineDataWhereUniqueInput',
  definition(t) {
    t.string('tradeId');
  },
});

export const KlineDataWhereInput = inputObjectType({
  name: 'KlineDataWhereInput',
  definition(t) {
    t.string('tradeId');
    t.string('symbol');
  },
});