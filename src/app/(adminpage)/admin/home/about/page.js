"use client";

import React, { useState, useEffect } from "react";
import styles from "../../admin.module.css";
import api from "@/lib/api";

// Reusable Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`${styles.toast} ${type === "success" ? styles.toastSuccess : styles.toastError}`}
    >
      <i
        className={
          type === "success"
            ? "fas fa-check-circle"
            : "fas fa-exclamation-circle"
        }
      ></i>
      <div className={styles.toastContent}>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default function AboutPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [aboutData, setAboutData] = useState({
    title: "",
    desc: "",
    images: [""],
    isActive: true,
  });

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // ✅ Fetch about data from API on page load
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await api.dynamic("/home/about");
        if (res.success && res.data) {
          setAboutData({
            title: res.data.title || "",
            desc: res.data.desc || "",
            images: Array.isArray(res.data.images) ? res.data.images : [""],
            isActive: res.data.isActive ?? true,
          });
        }
      } catch (error) {
        addToast("Failed to load about data", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchAbout();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAboutData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = async () => {
    const newStatus = !aboutData.isActive;

    // Update local state immediately for snappy UI
    setAboutData((prev) => ({ ...prev, isActive: newStatus }));

    try {
      const res = await api.patch("/home/about", {
        ...aboutData,
        isActive: newStatus,
      });

      if (res.success) {
        addToast(
          `About section visibility set to ${newStatus ? "Active" : "Inactive"}.`,
          "success",
        );
      }
    } catch (error) {
      // Revert state on failure
      setAboutData((prev) => ({ ...prev, isActive: !newStatus }));
      addToast(error.message || "Failed to update status", "error");
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...aboutData.images];
        newImages[index] = reader.result;
        setAboutData((prev) => ({ ...prev, images: newImages }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (
      !(aboutData?.title || "").trim() ||
      !(aboutData?.desc || "").trim() ||
      !aboutData?.images?.[0]
    ) {
      addToast("All fields including Section Image are required!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch("/home/about", {
        ...aboutData,
      });

      if (res.success) {
        addToast("About section updated successfully!", "success");
      }
    } catch (error) {
      addToast(error.message || "Failed to save changes", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show loading state while fetching
  if (fetching) {
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div className={styles.contentHeader}>
        <div className={styles.flexRow}>
          <h2>About Section</h2>
          <div className={styles.toggleWrapper} onClick={handleToggleActive}>
            <span
              className={
                aboutData.isActive ? styles.statusActive : styles.statusInactive
              }
            >
              {aboutData.isActive ? "Active" : "Inactive"}
            </span>
            <div
              className={`${styles.toggleSwitch} ${aboutData.isActive ? styles.toggleOn : ""}`}
            >
              <div className={styles.toggleHandle}></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSave}>
          <div className={styles.formSection}>
            <h4>Header Settings</h4>
            <div className={styles.grid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>
                  Section Title <span style={{ color: "red" }}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    name="title"
                    value={aboutData.title || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>
                  Story Description <span style={{ color: "red" }}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  name="desc"
                  value={aboutData.desc || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4>Section Image</h4>
            <div
              className={styles.uploadContainer}
              style={{ maxWidth: "400px" }}
            >
              <div className={styles.previewBox} style={{ height: "250px" }}>
                {aboutData.images[0] ? (
                  <img src={aboutData.images[0]} alt="About Preview" />
                ) : (
                  <div className={styles.noImage}>
                    <i className="fas fa-image fa-2x"></i>
                    <span>No Image Selected</span>
                  </div>
                )}
              </div>
              <div className={styles.fileInputWrapper}>
                <button type="button" className={styles.uploadBtn}>
                  <i className="fas fa-cloud-upload-alt"></i> Change About Image
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 0)}
                />
              </div>
            </div>
          </div>

          <div className={styles.btnContainer}>
            <button
              className={styles.saveChangesBtn}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i
                    className="fas fa-spinner fa-spin"
                    style={{ marginRight: "10px" }}
                  ></i>
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
