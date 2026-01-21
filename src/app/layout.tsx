import "./globals.css";
import ClientShell from "@/app/ClientShell";
import CzpAuthGate from "@/components/CzpAuthGate";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="h-dvh flex flex-col overflow-hidden">
        <CzpAuthGate>
          <ClientShell>{children}</ClientShell>
        </CzpAuthGate>
      </body>
    </html>
  );
}
