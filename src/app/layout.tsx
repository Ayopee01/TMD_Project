"use client";

import "./globals.css";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import DrawerMenu from "@/components/DrawerMenu";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <html lang="th">
      <body className="h-dvh flex flex-col overflow-hidden">
        {/* Navbar ให้อยู่บนสุดและซ้อนทับ */}
        <Navbar onOpenMenu={() => setOpen(true)} />

        {/* Drawer หน้าจอ xl ขึ้นไปไม่แสดง */}
        <div className="xl:hidden">
          <DrawerMenu open={open} onClose={() => setOpen(false)} />
        </div>

        {/* main เป็นตัว scroll เดียวของทั้งเว็บ */}
        <main id="app-main" className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </main>

        {/* <main id="app-main" className="h-screen overflow-hidden">
          {children}
        </main> */}

      </body>
    </html>
  );
}


