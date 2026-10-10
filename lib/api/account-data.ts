import { apiFetch } from "./client";
import { listMyLetters } from "./letters";
import { listMyTasks } from "./workflow";
import type { UserDto } from "./types";

// Verify the cookie-backed actor, not just the identity displayed by the account picker.
export async function verifyAccount(expectedUserId: string): Promise<void> {
  const actor = await apiFetch<UserDto>("/me");
  if (actor.id !== expectedUserId) {
    throw new Error("Sesi browser tidak sesuai akun yang dipilih. Pilih akun kembali sebelum memuat data.");
  }
}

export async function loadAccountDashboard(expectedUserId: string) {
  await verifyAccount(expectedUserId);
  const [letters, tasks] = await Promise.all([listMyLetters(1, 100), listMyTasks(1, 100)]);
  return { letters, tasks };
}
