"use client";

import { Transaction, Profile } from "@/types";
import { formatPKR } from "@/lib/utils";
import {
  ArrowRight,
  Home,
  ShoppingCart,
  Bolt,
  User,
  Package,
} from "lucide-react";
import React from "react";

interface TransactionCardProps {
  transaction: Transaction;
  members: Profile[];
  onClick?: () => void;
}

const CATEGORY_MAP: Record<
  string,
  {
    label: string;
    bgClass: string;
    icon: React.ComponentType<{ size: number }>;
  }
> = {
  home_expenses: { label: "Home", bgClass: "badge-home", icon: Home },
  grocery: { label: "Grocery", bgClass: "badge-grocery", icon: ShoppingCart },
  utility: { label: "Utility", bgClass: "badge-utility", icon: Bolt },
  personal: { label: "Personal", bgClass: "badge-personal", icon: User },
  other: { label: "Other", bgClass: "badge-other", icon: Package },
};

export function TransactionCard({
  transaction,
  members,
  onClick,
}: TransactionCardProps) {
  const giver = members.find((m) => m.id === transaction.giver_id);
  const receiver = members.find((m) => m.id === transaction.receiver_id);

  const giverRole = giver?.role || "Dad";
  const receiverRole = receiver?.role || "Mom";
  const giverInitial = giverRole.toLowerCase() === "dad" ? "D" : "M";
  const receiverInitial = receiverRole.toLowerCase() === "dad" ? "D" : "M";

  const categoryInfo = CATEGORY_MAP[transaction.category] || CATEGORY_MAP.other;
  const CategoryIcon = categoryInfo.icon;

  const formattedDate = new Date(transaction.txn_date).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" },
  );

  return (
    <div
      onClick={onClick}
      className={`card ${onClick ? "card-interactive" : ""}`}
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Top row: people flow + amount */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Giver → Receiver */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            className={`avatar ${giverRole.toLowerCase() === "dad" ? "avatar-dad" : "avatar-mom"}`}
          >
            {giverInitial}
          </div>

          <div className="flow-connector" style={{ margin: "0 4px" }}>
            <div className="flow-connector-line" />
            <ArrowRight size={12} />
          </div>

          <div
            className={`avatar ${receiverRole.toLowerCase() === "dad" ? "avatar-dad" : "avatar-mom"}`}
          >
            {receiverInitial}
          </div>
        </div>

        {/* Amount */}
        <span className="text-amount">{formatPKR(transaction.amount)}</span>
      </div>

      {/* Divider */}
      <div className="card-divider" />

      {/* Bottom row: category + note + date */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <span
            className={`badge ${categoryInfo.bgClass}`}
            style={{ gap: "4px" }}
          >
            <CategoryIcon size={11} />
            {categoryInfo.label}
          </span>

          {transaction.note && (
            <span className="note-text">{transaction.note}</span>
          )}
        </div>

        <span className="date-pill">{formattedDate}</span>
      </div>
    </div>
  );
}
