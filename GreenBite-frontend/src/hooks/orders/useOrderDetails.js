import { Query, useQuery } from "@tanstack/react-query";
import { getOrderDetails } from "@/api/orders.api";
import { orderKeys } from "./orderKeys";
/* Each hook should:
	•	call the API function
	•	return data/isLoading/isError
	•	on mutations, invalidate the right query keys 
*/
/*
    export const orderKeys = {
    all: ["orders"],
    
    lists: () => [...orderKeys.all, "list"],

    buyerList: (filters = {}) => [...orderKeys.lists(), "buyer", filters],
    sellerList: (filters = {}) => [...orderKeys.lists(), "seller", filters],

    details: () => [...orderKeys.all, "detail"],
    detail: (orderId) => [...orderKeys.details(), orderId],
};
*/

export function useOrderDetails(orderId, options = {}){
    return useQuery({
        queryKey: orderKeys.detail(orderId),
        queryFn: () => getOrderDetails(orderId),
        enabled: !!orderId && (options.enabled ?? true),
        staleTime: 30_000,
    });
}