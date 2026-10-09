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
}

export type FieldKind = "text" | "ketua" | "pembina" | "file";

export interface LetterFormField {
  key: string;
  label: string;
  value: string | null;
  kind: FieldKind;
  hint: string;
}

export interface PersonOption {
  name: string;
  meta: string;
}
