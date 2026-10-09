import LetterAssistant from "@/features/assistant/components/letter-assistant";

export const metadata = {
  title: "Buat Surat Baru (Asisten AI) · SignIt! PENS",
  description: "Asisten cerdas pembuatan surat dan peminjaman fasilitas Politeknik Elektronika Negeri Surabaya",
};

export default function SuratBaruPage() {
  return <LetterAssistant />;
}
