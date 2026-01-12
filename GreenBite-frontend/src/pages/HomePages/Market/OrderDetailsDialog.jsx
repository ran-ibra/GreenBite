import React from "react";
import { useOrderDetails } from "@/hooks/orders/useOrderDetails";
import { useAcceptOrder } from "@/hooks/orders/useAcceptOrders";
import { useUpdateOrderStatus } from "@/hooks/orders/useUpdateOrderStatus";

export default function orderDetailsDialog({ isOpen, orderId, onClose, mode}){
    const {data, isLoading, isError} = useOrderDetails(orderId, {
        enabled: isOpen && !!orderId,
    });
    const acceptMutation = useAcceptOrder();
    const updateStatusMutation = useUpdateOrderStatus();

    if(!isOpen) return null;

    const status = data?.status;

    const canBuyerCancel = mode === "buyer" && status === "PENDING";
    const canSellerAccept = mode === "seller" && status === "PENDING";
    const canSellerDeliver = mode === "seller" && status === "ACCEPTED";

    return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* dialog */}
      <div className="relative mt-20 w-[92%] max-w-xl rounded-2xl bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Order Details</h2>
          <button
            className="rounded-lg px-3 py-1 border"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-4">
          {isLoading && <p>Loading...</p>}
          {isError && <p className="text-red-500">Failed to load order.</p>}

          {!isLoading && data && (
            <>
              <p className="mt-1">
                <span className="font-semibold">Order:</span> #{data.order_id}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Status:</span> {data.status}
              </p>

              <div className="mt-3 rounded-xl border p-3">
                <p className="font-semibold">Listing</p>
                <p className="mt-1">{data.listing?.title}</p>
                <p className="mt-1">
                  {data.listing?.price} {data.listing?.currency} /{" "}
                  {data.listing?.unit}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Quantity:</span>{" "}
                  {data.quantity}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Total:</span>{" "}
                  {data.total_price} {data.listing?.currency}
                </p>
              </div>

              <div className="mt-3 rounded-xl border p-3">
                <p className="font-semibold">Address</p>
                <p className="mt-1">{data.address?.full_name}</p>
                <p className="mt-1">{data.address?.phone_number}</p>
                <p className="mt-1">{data.address?.email}</p>
                <p className="mt-1">{data.address?.address_line}</p>
                <p className="mt-1">{data.address?.city}</p>
                {data.address?.notes && <p className="mt-1">{data.address.notes}</p>}
              </div>

              <div className="mt-4 flex gap-2">
                {canBuyerCancel && (
                  <button
                    className="px-4 py-2 rounded-xl bg-red-600 text-white disabled:opacity-60"
                    disabled={updateStatusMutation.isPending}
                    onClick={() =>
                      updateStatusMutation.mutate({
                        orderId,
                        status: "CANCELLED",
                      })
                    }
                  >
                    {updateStatusMutation.isPending ? "Cancelling..." : "Cancel"}
                  </button>
                )}

                {canSellerAccept && (
                  <button
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-60"
                    disabled={acceptMutation.isPending}
                    onClick={() => acceptMutation.mutate({ orderId })}
                  >
                    {acceptMutation.isPending ? "Accepting..." : "Accept"}
                  </button>
                )}

                {canSellerDeliver && (
                  <button
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-60"
                    disabled={updateStatusMutation.isPending}
                    onClick={() =>
                      updateStatusMutation.mutate({
                        orderId,
                        status: "DELIVERED",
                      })
                    }
                  >
                    {updateStatusMutation.isPending
                      ? "Updating..."
                      : "Mark Delivered"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

