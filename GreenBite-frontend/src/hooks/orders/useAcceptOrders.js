import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptOrder } from "@/api/orders.api";
import { orderKeys } from "./orderKeys";

export function useAcceptOrder(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId }) => acceptOrder(orderId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(variables.orderId),
            });
        },
    });
}