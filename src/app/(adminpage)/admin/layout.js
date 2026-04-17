"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { ToastProvider } from "@/components/ToastContext";
import styles from "./admin.module.css";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Calculate this immediately during render to avoid useEffect delay/flicker
  const isLoginPage = pathname === "/admin" || pathname === "/admin/";

  if (isLoginPage) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <ToastProvider>
      <div className={styles.adminLayout}>
        {/* Sidebar Overlay for Mobile */}
        <div 
          className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.sidebarOverlayOpen : ""}`} 
          onClick={() => setIsSidebarOpen(false)}
        />

        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <AdminHeader onMenuClick={toggleSidebar} />
          <main className={styles.mainContent}>
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
