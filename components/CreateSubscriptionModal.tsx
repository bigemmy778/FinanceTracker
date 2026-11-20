import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import clsx from "clsx";
import dayjs from "dayjs";
import { icons } from "@/constants/icons";

export const SUBSCRIPTION_CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];
export type BillingFrequency = "Monthly" | "Yearly";

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  Entertainment: "#fde68a",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#bfdbfe",
  Cloud: "#bae6fd",
  Music: "#bbf7d0",
  Other: "#e5e7eb",
};

// Matches the shape of items in HOME_SUBSCRIPTIONS
export interface NewSubscriptionInput {
  id: string;
  name: string;
  price: number;
  billing: BillingFrequency;
  category: SubscriptionCategory;
  status: "active";
  startDate: string;
  renewalDate: string;
  icon: typeof icons.wallet;
  color: string;
}

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: NewSubscriptionInput) => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [priceText, setPriceText] = useState("");
  const [frequency, setFrequency] = useState<BillingFrequency>("Monthly");
  const [category, setCategory] = useState<SubscriptionCategory>("Entertainment");

  const trimmedName = name.trim();
  const parsedPrice = Number.parseFloat(priceText);
  const isValidPrice =
    priceText.trim().length > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0;
  const isFormValid = trimmedName.length > 0 && isValidPrice;

  const resetForm = () => {
    setName("");
    setPriceText("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isFormValid) return;

    const now = dayjs();
    const startDate = now.toISOString();
    const renewalDate =
      frequency === "Yearly"
        ? now.add(1, "year").toISOString()
        : now.add(1, "month").toISOString();

    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newSubscription: NewSubscriptionInput = {
      id: `${slug || "sub"}-${Date.now()}`,
      name: trimmedName,
      price: Number(parsedPrice.toFixed(2)),
      billing: frequency,
      category,
      status: "active",
      startDate,
      renewalDate,
      icon: icons.wallet,
      color: CATEGORY_COLORS[category],
    };

    onCreate(newSubscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="modal-overlay"
      >
        <Pressable className="flex-1" onPress={handleClose} />

        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              className="modal-close"
            >
              <Text className="modal-close-text">×</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerClassName="modal-body"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View className="auth-field">
              <Text className="auth-label">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Netflix, Linear, iCloud+"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                className="auth-input"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Price */}
            <View className="auth-field">
              <Text className="auth-label">Price</Text>
              <TextInput
                value={priceText}
                onChangeText={setPriceText}
                placeholder="0.00"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                keyboardType="decimal-pad"
                className="auth-input"
              />
            </View>

            {/* Frequency */}
            <View className="auth-field">
              <Text className="auth-label">Frequency</Text>
              <View className="picker-row">
                {(["Monthly", "Yearly"] as const).map((option) => {
                  const active = frequency === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setFrequency(option)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      className={clsx(
                        "picker-option",
                        active && "picker-option-active"
                      )}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          active && "picker-option-text-active"
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Category */}
            <View className="auth-field">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {SUBSCRIPTION_CATEGORIES.map((item) => {
                  const active = category === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setCategory(item)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      className={clsx(
                        "category-chip",
                        active && "category-chip-active"
                      )}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          active && "category-chip-text-active"
                        )}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={!isFormValid}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isFormValid }}
              className={clsx(
                "auth-button",
                !isFormValid && "auth-button-disabled"
              )}
            >
              <Text className="auth-button-text">Add Subscription</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}