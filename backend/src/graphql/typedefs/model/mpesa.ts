import { objectType } from "nexus";
// import * as Model from "nexus-prisma";

export const mpesaDepositResponse = objectType({
    name: "MpesaDepositResponse",
    definition(t) {
        t.string("message");
        t.boolean("success");
        // t.string("checkoutRequestID");
    },
    });

   export const mpesaWithdrawResponse = objectType({
    name: "MpesaWithdrawResponse",
    definition(t) {
        t.string("message");
        t.boolean("success");
        // t.string("checkoutRequestID");
    },
    }); 