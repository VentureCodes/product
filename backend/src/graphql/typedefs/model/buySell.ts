import { objectType} from "nexus";


export const BuySellResponse = objectType({
    name: "BuySellResponse",
    definition(t) {
        t.string("amount");
        t.string("token");
        t.string("price");
        t.string("fee");
        t.string("quantity");
        t.string("totalQuantity");
        t.string("invoiceNumber");        
    },
});
    