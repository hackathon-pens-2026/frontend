import React from "react";

const avatarPalettes = [
  "bg-blue-100 text-navy",
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-700",
];

export function Avatar({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  const cleanName = name.replace(/^(Dr\.|Ir\.)\s*/g, "");
  const parts = cleanName.split(" ").filter(Boolean).slice(0, 2);
  const initials = parts.map((p) => p[0]).join("").toUpperCase();
  const palette = avatarPalettes[name.length % avatarPalettes.length];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${palette}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </span>
  );
}
