import React from "react";

export type WidgetType =
  | "typePills"
  | "ketuaPicker"
  | "pembinaPicker"
  | "availability"
  | "upload"
  | "pdf";

export interface ChatMessage {
  id: number;
  from: "bot" | "user";
  text: React.ReactNode;
  widget?: WidgetType;
  timestamp?: string;
  status?: "sent" | "delivered" | "read";
}

export type FieldKind = "text" | "ketua" | "pembina" | "file";
export type FieldGroupKey = "document" | "activity" | "authorization";

export interface LetterFormField {
  key: string;
  label: string;
  value: string | null;
  kind: FieldKind;
  hint: string;
  group?: FieldGroupKey;
}

export interface PersonOption {
  name: string;
  meta: string;
}
