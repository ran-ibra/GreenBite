import { useQuery } from "@tanstack/react-query";
import { getSellerOrders } from "@/api/orders.api";
import { orderKeys } from "./orderKeys";

export function useSellerOrders(filters){
    return useQuery({ 
        queryKey: orderKeys.sellerList(filters),
        queryFn: () => getSellerOrders(filters), //api call
        staleTime: 60_000,
    });
}