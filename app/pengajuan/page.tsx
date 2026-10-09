"use client";

import { SessionGate } from "@/features/auth/session-gate";
import { LetterForm } from "@/features/letters/letter-form";

export default function PengajuanPage() {
  return <SessionGate>{() => <LetterForm />}</SessionGate>;
}
