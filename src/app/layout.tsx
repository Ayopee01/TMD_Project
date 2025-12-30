"use client";

import "./globals.css";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import DrawerMenu from "@/components/DrawerMenu";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <html lang="th">
      <body className="h-screen overflow-hidden">
        {/* Navbar ให้อยู่บนสุดและซ้อนทับ */}
        <Navbar onOpenMenu={() => setOpen(true)} />

        {/* Drawer หน้าจอ xl ขึ้นไปไม่แสดง */}
        <div className="xl:hidden">
          <DrawerMenu open={open} onClose={() => setOpen(false)} />
        </div>

        {/* main เป็นตัว scroll เดียวของทั้งเว็บ */}
        <main className="h-full overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
