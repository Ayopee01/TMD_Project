"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import DrawerMenu from "@/components/DrawerMenu";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
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
    </>
  );
}
