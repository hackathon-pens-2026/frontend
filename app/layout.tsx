import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/auth/session-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SignIt! — Digital Campus Approval",
  description: "Ajukan, tanda tangani, dan pantau surat kampus dalam satu alur.",
  icons: {
    icon: "/signit_icon.svg",
    shortcut: "/signit_icon.svg",
    apple: "/signit_icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased bg-[#f8fafc]`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#f8fafc] text-[#0f172a]">
        <Suspense fallback={null}>
          <SessionProvider>{children}</SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
