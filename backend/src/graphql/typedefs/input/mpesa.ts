import {inputObjectType} from 'nexus';

export const MpesaDepositWhereInput = inputObjectType({
  name: 'MpesaDepositWhereInput',
  definition(t) {
    t.nonNull.string('phone');
    t.nonNull.string('amount');
  },
});

export const MpesaWithdrawWhereInput = inputObjectType({
  name: 'MpesaWithdrawWhereInput',
  definition(t) {
    t.nonNull.string('phone');
    t.nonNull.string('amount');
  },
});