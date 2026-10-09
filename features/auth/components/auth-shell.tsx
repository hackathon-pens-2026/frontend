import Image from "next/image";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 bg-canvas">
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-midnight px-12 py-14 text-white lg:flex">
        <div className="flex items-center gap-3">
          <Image src="/icons/logo.svg" alt="" width={40} height={40} />
          <span className="text-title font-bold tracking-tight">SignIt!</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-display font-bold leading-tight">
            Satu alur untuk semua surat kegiatan kampus.
          </h1>
          <p className="mt-4 text-body text-slate-300">
            Ajukan, pantau, dan tanda tangani surat izin, peminjaman ruangan,
            serta pengajuan barang dengan riwayat persetujuan yang jelas.
          </p>
        </div>
        <p className="text-micro text-slate-400">
          Politeknik Elektronika Negeri Surabaya
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Image src="/icons/logo.svg" alt="" width={36} height={36} />
            <span className="text-title font-bold text-midnight">SignIt!</span>
          </div>
          <h2 className="text-display font-bold text-midnight">{title}</h2>
          <p className="mt-2 text-body text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
