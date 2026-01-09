import React from "react";
import { motion as Motion } from "framer-motion";
import {
  useSubscriptionPlans,
  useStartSubscription,
} from "@/hooks/useSubscriptionPlans";

import {
  ShoppingBag,
  Check,
  UtensilsCrossed,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import PricingCard from "@/components/pricing/PricingCard";

/* ---------------- Animations ---------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

/* ---------------- Features ---------------- */
const marketplaceFeatures = [
  {
    icon: UtensilsCrossed,
    title: "Sell Your Food Products",
    description: "List unlimited food items and recipes",
  },
  {
    icon: TrendingUp,
    title: "Sales Analytics",
    description: "Track your sales and customer insights",
  },
  {
    icon: Users,
    title: "Customer Base",
    description: "Build and manage your customer relationships",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Keep track of your food stock easily",
  },
];

const Pricing = () => {
  const { data: plans, isLoading, isError } = useSubscriptionPlans();
  const subscribeMutation = useStartSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        Loading plans...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load plans
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3FAF5] via-white to-[#E7F5EC] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-120px] right-[-120px] w-[420px] h-[420px] bg-[#4CAF50]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-120px] left-[-120px] w-[420px] h-[420px] bg-[#81C784]/20 rounded-full blur-[120px]" />

      <div className="relative container mx-auto px-4 pt-24 pb-20">
        {/* ---------------- Header ---------------- */}
        <Motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center mb-24"
        >
          <Motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 bg-[#4CAF50]/10 text-[#2E7D32] px-6 py-2 rounded-full mb-6 font-semibold border border-[#4CAF50]/20"
          >
            <ShoppingBag className="w-5 h-5" />
            Food Marketplace
          </Motion.div>

          <Motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
          >
            Start Selling Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7D32] to-[#66BB6A]">
              Delicious Food
            </span>
          </Motion.h1>

          <Motion.p
            variants={fadeUp}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Choose a subscription plan and unlock the full power of our food
            marketplace.
          </Motion.p>
        </Motion.div>

        {/* ---------------- Pricing Cards ---------------- */}
        <Motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24"
        >
          {plans.map((plan, index) => (
            <Motion.div
              key={plan.id}
              variants={fadeUp}
              whileHover={{ y: -10, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <PricingCard
                plan={plan}
                isPopular={index === 1}
                loading={subscribeMutation.isLoading}
                onSubscribe={() => subscribeMutation.mutate(plan.id)}
              />
            </Motion.div>
          ))}
        </Motion.div>

        {/* ---------------- Features ---------------- */}
        <Motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-[#4CAF50]/20"
        >
          <Motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Everything You Need to Sell Food
            </h2>
            <p className="text-gray-600 text-lg">
              All plans include complete marketplace access
            </p>
          </Motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
            {marketplaceFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ scale: 1.03 }}
                  className="flex gap-5 p-6 rounded-2xl bg-gradient-to-br from-white to-[#F1FAF3] border border-[#4CAF50]/20 hover:shadow-lg transition"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-2xl flex items-center justify-center shadow-md">
                    <Icon className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </Motion.div>
              );
            })}
          </div>

          {/* ---------------- Included ---------------- */}
          <Motion.div
            variants={fadeUp}
            className="border-t border-[#4CAF50]/20 pt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              "Secure payment processing",
              "Seller dashboard",
              "Priority support",
              "Mobile & desktop access",
              "Real-time notifications",
              "Cancel anytime",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-gray-700 font-medium"
              >
                <Check className="w-5 h-5 text-[#2E7D32]" />
                {item}
              </div>
            ))}
          </Motion.div>
        </Motion.div>
      </div>
    </div>
  );
};

export default Pricing;
