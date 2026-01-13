import FoodLogForm from "@/components/HomePage/FoodLog/FoodLogForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { GrFormClose } from "react-icons/gr";

const AddFoodDialog = ({ open, onClose, item }) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data) => {
            if (item) {
                // EDIT
                return api.patch(`/api/food-logs/${item.id}/`, data);
            }
            // CREATE
            return api.post("/api/food-logs/", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["foodLog"] });
            onClose();
        },
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-xl shadow-lg
        w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">{item ? "Edit Food Item" : "Add Food Item"}</h2>
                    <GrFormClose
                        onClick={onClose}
                        className="text-gray-600 hover:text-red-600 text-3xl"
                    />

                </div>

                <div className="p-6">
                    <FoodLogForm
                        initialData={item}
                        onSubmit={(data) => mutation.mutate(data)}
                        loading={mutation.isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddFoodDialog;