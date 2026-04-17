"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../app/(adminpage)/admin/admin.module.css";
import api from "@/lib/api";
import { useToast } from "@/components/ToastContext";
import { EditProfileModal, ChangePasswordModal } from "./ProfileModals";

const AdminHeader = ({ onMenuClick }) => {
  const [admin, setAdmin] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchAdmin();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAdmin = async () => {
    try {
      const res = await api.get("/admin/me");
      if (res.success) {
        setAdmin(res.admin);
      }
    } catch (error) {
      console.error("Failed to fetch admin profile", error);
    }
  };

  const handleLogout = async () => {
    try {
      document.cookie = "admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      await api.post("/admin/logout");
      addToast("Logging out...", "success");
      router.push("/admin");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/admin");
    }
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <>
      <header className={styles.adminHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.mobileToggle} onClick={onMenuClick}>
            <i className="fas fa-bars"></i>
          </button>
          <h3>Admin Dashboard</h3>
        </div>

        <div className={styles.profileSection} onClick={() => setIsDropdownOpen(!isDropdownOpen)} ref={dropdownRef}>
          <div className={styles.profileInfo}>
            <span className={styles.adminName}>{admin?.name || "Admin"}</span>
            <span className={styles.adminRole}>Administrator</span>
          </div>
          <div className={styles.profileAvatar}>
            {getInitials(admin?.name)}
          </div>

          {isDropdownOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownItem} onClick={() => setShowEditModal(true)}>
                <i className="fas fa-user-edit"></i>
                <span>Edit Profile</span>
              </div>
              <div className={styles.dropdownItem} onClick={() => setShowPasswordModal(true)}>
                <i className="fas fa-key"></i>
                <span>Change Password</span>
              </div>
              <div className={styles.dropdownDivider}></div>
              <div className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {showEditModal && (
        <EditProfileModal 
          admin={admin} 
          onClose={() => setShowEditModal(false)} 
          onUpdate={(updatedAdmin) => setAdmin(updatedAdmin)} 
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)} 
        />
      )}
    </>
  );
};

export default AdminHeader;
