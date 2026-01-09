import { ArrowRight, ShoppingBag } from "lucide-react";

const PricingCard = ({ plan, isPopular, onSubscribe, loading }) => {
  const months =
    plan.duration === "month" ? 1 : plan.duration === "6_months" ? 6 : 12;

  const price = plan.price / 100;
  const pricePerMonth = Math.round(price / months);

  return (
    <div className={`relative group ${isPopular ? "md:-mt-8" : ""}`}>
      {isPopular && (
        <div className="absolute -inset-0.5 bg-[#7EB685] rounded-3xl blur opacity-30" />
      )}

      <div
        className={`relative rounded-3xl p-8 transition-all ${
          isPopular
            ? "bg-[#7EB685] text-white shadow-2xl"
            : "bg-white border border-gray-200 shadow-lg hover:border-[#7EB685]"
        }`}
      >
        {isPopular && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-[#7EB685] px-5 py-1 rounded-full text-sm font-bold">
            ⭐ Best Value
          </div>
        )}

        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
              isPopular ? "bg-white/20" : "bg-[#7EB685]/10"
            }`}
          >
            <span className="text-2xl font-bold">{months}M</span>
          </div>

          <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>

          <div className="flex justify-center items-end gap-2">
            <span className="text-5xl font-bold">{price}</span>
            <span className="text-xl pb-2">EGP</span>
          </div>

          <p
            className={`mt-1 font-semibold ${
              isPopular ? "text-white/90" : "text-[#7EB685]"
            }`}
          >
            {pricePerMonth} EGP / month
          </p>
        </div>

        <button
          disabled={loading}
          onClick={onSubscribe}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
            isPopular
              ? "bg-white text-[#7EB685]"
              : "bg-[#7EB685] text-white hover:bg-[#6da574]"
          } disabled:opacity-50`}
        >
          {loading ? "Redirecting..." : "Start Selling"}
          <ArrowRight className="w-5 h-5" />
        </button>

        <div
          className={`h-px my-6 ${isPopular ? "bg-white/20" : "bg-gray-200"}`}
        />

        <div className="flex justify-center items-center gap-2 text-sm">
          <ShoppingBag className="w-4 h-4" />
          Full marketplace access
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
