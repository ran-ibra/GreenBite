import { useQuery } from "@tanstack/react-query";
import { getBuyerOrders } from "@/api/orders.api";
import { orderKeys } from "./orderKeys";

export function useBuyerOrders(filters){
    return useQuery({ //GET
        queryKey: orderKeys.buyerList(filters),
        queryFn: () => getBuyerOrders(filters), //api call
        staleTime: 60_000,
    });
}