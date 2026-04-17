"use client";

import React, { useState } from "react";
import styles from "../app/(adminpage)/admin/admin.module.css";
import api from "@/lib/api";
import { useToast } from "@/components/ToastContext";

export const EditProfileModal = ({ admin, onClose, onUpdate }) => {
  const [name, setName] = useState(admin?.name || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch("/admin/profile", { name, email });
      if (res.success) {
        addToast("Profile updated successfully", "success");
        onUpdate(res.admin);
        onClose();
      }
    } catch (error) {
      addToast(error.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Edit Profile</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="submit" className={styles.saveChangesBtn} style={{ width: "100%" }} disabled={loading}>

              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return addToast("Passwords do not match", "error");
    }
    if (newPassword.length < 6) {
      return addToast("New password must be at least 6 characters", "error");
    }

    setLoading(true);
    try {
      const res = await api.patch("/admin/change-password", { currentPassword, newPassword });
      if (res.success) {
        addToast("Password changed successfully", "success");
        onClose();
      }
    } catch (error) {
      addToast(error.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Change Password</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Current Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <i
                  className={`${styles.eyeIcon} fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                ></i>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>New Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <i
                  className={`${styles.eyeIcon} fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                ></i>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Confirm New Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                <i
                  className={`${styles.eyeIcon} fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="submit" className={styles.saveChangesBtn} style={{ width: "100%" }} disabled={loading}>
              {loading ? "Update Password" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
