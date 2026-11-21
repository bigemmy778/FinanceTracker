import { createContext, useContext, useState, ReactNode } from "react";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { NewSubscriptionInput } from "@/components/CreateSubscriptionModal";

type SubscriptionItem = (typeof HOME_SUBSCRIPTIONS)[number];

interface SubscriptionsContextValue {
  subscriptions: SubscriptionItem[];
  addSubscription: (newSub: NewSubscriptionInput) => void;
  cancelSubscription: (id: string) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null
);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] =
    useState<SubscriptionItem[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (newSub: NewSubscriptionInput) => {
    setSubscriptions((prev) => [newSub as SubscriptionItem, ...prev]);
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "cancelled" } : s))
    );
  };

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, addSubscription, cancelSubscription }}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) {
    throw new Error(
      "useSubscriptions must be used inside a SubscriptionsProvider"
    );
  }
  return ctx;
}