"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "../app/(adminpage)/admin/admin.module.css";
import api from "@/lib/api";

const AdminSidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [isHomeOpen, setIsHomeOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const homeSubPages = [
    { name: "Home Page", path: "/admin/home/metadata", icon: "fas fa-search" },
    { name: "Home Slider", path: "/admin/home/slider", icon: "fas fa-images" },
    { name: "About Section", path: "/admin/home/about", icon: "fas fa-address-card" },
    { name: "Teachers Section", path: "/admin/home/teachers", icon: "fas fa-user-graduate" },
    { name: "Foundation Section", path: "/admin/home/foundation", icon: "fas fa-university" },
    { name: "Courses Section", path: "/admin/home/courses", icon: "fas fa-graduation-cap" },
    { name: "Events Section", path: "/admin/home/events", icon: "fas fa-calendar-alt" },
    { name: "Journey Today", path: "/admin/home/journey", icon: "fas fa-map-signs" },
  ];

  const otherPages = [
    { name: "About Us", path: "/admin/about", icon: "fas fa-address-card" },
    { name: "Courses", path: "/admin/courses", icon: "fas fa-graduation-cap" },
    { name: "Events", path: "/admin/events", icon: "fas fa-calendar-alt" },
    { name: "Publications", path: "/admin/publications", icon: "fas fa-book" },
    { name: "Gallery", path: "/admin/gallery", icon: "fas fa-images" },
    { name: "Foundation", path: "/admin/foundation", icon: "fas fa-hands-helping" },
    { name: "Registration", path: "/admin/registration", icon: "fas fa-user-plus" },
    { name: "Contact", path: "/admin/contact", icon: "fas fa-envelope" },
  ];

  const handleLogout = async () => {
    try {
      document.cookie = "admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      await api.post("/admin/logout");
      router.push("/admin");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/admin");
    }
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
      <button className={styles.sidebarCloseBtn} onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>

      <div className={styles.sidebarHeader}>
        <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logocanva1.png`} alt="Logo" width={40} height={40} />
        <h3>Admin Panel</h3>
      </div>
      
      <div className={styles.menuList}>
        <p className={styles.menuLabel}>Global Settings</p>
        <Link 
          href="/admin/navbar"
          className={`${styles.menuItem} ${mounted && pathname === "/admin/navbar" ? styles.activeMenu : ""}`}
          onClick={onClose}
          style={{marginBottom:"10px"}}
        >
          <i className="fa-solid fa-bars"></i>
          <span>Navbar Menu</span>
        </Link>

        <p className={styles.menuLabel}>Main Website</p>
        
        {/* Home Dropdown */}
        <div 
          className={`${styles.menuItem} ${mounted && pathname.startsWith("/admin/home") ? styles.activeMenu : ""}`}
          onClick={() => {
            setIsHomeOpen(!isHomeOpen);
            if (pathname === "/admin") router.push("/admin/home/metadata");
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px", flex: 1 }}>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </div>
          <i className={`fas ${isHomeOpen ? "fa-chevron-down" : "fa-chevron-right"}`} style={{ fontSize: "12px" }}></i>
        </div>

        {isHomeOpen && (
          <div style={{ background: "rgba(255,255,255,0.02)", paddingLeft: "15px" }}>
            {homeSubPages.map((sub) => (
              <Link 
                key={sub.name} 
                href={sub.path}
                className={`${styles.menuItem} ${mounted && pathname === sub.path ? styles.activeMenu : ""}`}
                style={{ fontSize: "13px", padding: "10px 25px" }}
                onClick={onClose}
              >
                <i className={sub.icon} style={{ fontSize: "14px" }}></i>
                <span>{sub.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Other Pages */}
        {otherPages.map((page) => (
          <Link 
            key={page.name} 
            href={page.path}
            className={`${styles.menuItem} ${mounted && pathname === page.path ? styles.activeMenu : ""}`}
            onClick={onClose}
          >
            <i className={page.icon}></i>
            <span>{page.name} Page</span>
          </Link>
        ))}
      </div>

      <div className={styles.logoutBtn} onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </div>
    </aside>
  );
};

export default AdminSidebar;
