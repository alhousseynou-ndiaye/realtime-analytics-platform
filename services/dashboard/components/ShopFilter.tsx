"use client";

import React from "react";

type Props = {
  shops: string[];
  value: string; // "all" ou shop_id
  onChange: (v: string) => void;
};

export default function ShopFilter({ shops, value, onChange }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ opacity: 0.8, fontSize: 13 }}>Shop:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "rgba(255,255,255,0.06)",
          color: "#e6e6e6",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10,
          padding: "8px 10px",
          outline: "none",
        }}
      >
        <option value="all">All shops</option>
        {shops.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}