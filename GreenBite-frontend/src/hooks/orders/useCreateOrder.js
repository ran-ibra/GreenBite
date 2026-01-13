import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/api/orders.api";
import { orderKeys } from "./orderKeys";
/*
Add hooks:
	•	useCreateOrder.js
	•	useBuyerOrders.js
	•	useSellerOrders.js
	•	useOrderDetails.js
	•	useAcceptOrder.js
	•	useUpdateOrderStatus.js

Each hook should:
	•	call the API function
	•	return data/isLoading/isError
	•	on mutations, invalidate the right query keys
*/
export function useCreateOrder(){
    const queryClient = useQueryClient(); //access to react query manager

    return useMutation({ //for w actions
        mutationFn: (payload) => createOrder(payload), //api call
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: orderKeys.lists()}); //key factory and invalidating cache 
        },
    });
}