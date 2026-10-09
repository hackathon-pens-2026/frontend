export interface AssistantMessage {
  id: number;
  from: "bot" | "user";
  text: string;
  timestamp: string;
  tone?: "info" | "success" | "error";
}
