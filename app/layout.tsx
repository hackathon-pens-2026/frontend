import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SignIt! — Digital Campus Approval",
  description: "Pantau kelancaran birokrasi dan status surat izinmu secara real-time.",
  icons: {
    icon: "/signit_icon.svg",
    shortcut: "/signit_icon.svg",
    apple: "/signit_icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased bg-[#f8fafc]`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#f8fafc] text-[#0f172a]">{children}</body>
    </html>
  );
}
