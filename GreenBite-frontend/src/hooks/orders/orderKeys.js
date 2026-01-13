export const orderKeys = {
    all: ["orders"],
    
    lists: () => [...orderKeys.all, "list"],

    buyerList: (filters = {}) => [...orderKeys.lists(), "buyer", filters],
    sellerList: (filters = {}) => [...orderKeys.lists(), "seller", filters],

    details: () => [...orderKeys.all, "detail"],
    detail: (orderId) => [...orderKeys.details(), orderId],
};
/* 
export const marketplaceKeys = {
  all: ["marketplace"],
  orders: () => [...marketplaceKeys.all, "orders"],

  buyerOrders: (filters) => [...marketplaceKeys.orders(), "buyer", filters],
  sellerOrders: (filters) => [...marketplaceKeys.orders(), "seller", filters],
  orderDetails: (orderId) => [...marketplaceKeys.orders(), "detail", orderId],
};
*/