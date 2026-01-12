import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "@/api/orders.api";
import { orderKeys } from "./orderKeys";

export function useUpdateOrderStatus(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, status }) => updateOrderStatus({ orderId, status }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(variables.orderId),
            });
        },
    });
}