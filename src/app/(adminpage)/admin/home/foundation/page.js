"use client";

import React, { useState, useEffect } from "react";
import styles from "../../admin.module.css";
import api from "@/lib/api";

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

export default function FoundationPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [foundationData, setFoundationData] = useState({
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

  // ✅ Fetch foundation data
  useEffect(() => {
    const fetchFoundation = async () => {
      try {
        const res = await api.dynamic("/home/foundation");
        if (res.success && res.data) {
          setFoundationData({
            title: res.data.title || "",
            desc: res.data.desc || "",
            images: Array.isArray(res.data.images) ? res.data.images : [""],
            isActive: res.data.isActive ?? true,
          });
        }
      } catch (error) {
        addToast("Failed to load foundation data", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchFoundation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFoundationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = async () => {
    const newStatus = !foundationData.isActive;
    setFoundationData((prev) => ({ ...prev, isActive: newStatus }));
    try {
      await api.patch("/home/foundation", {
        ...foundationData,
        isActive: newStatus,
      });
      addToast(`Visibility: ${newStatus ? "Active" : "Inactive"}`, "success");
    } catch (error) {
      setFoundationData((prev) => ({ ...prev, isActive: !newStatus }));
      addToast("Failed to update status", "error");
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...foundationData.images];
        newImages[index] = reader.result;
        setFoundationData((prev) => ({ ...prev, images: newImages }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (
      !(foundationData?.title || "").trim() ||
      !(foundationData?.desc || "").trim()
    ) {
      addToast("Title and description are required!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch("/home/foundation", foundationData);
      if (res.success) {
        addToast("Foundation section updated successfully!", "success");
      }
    } catch (error) {
      addToast(error.message || "Failed to save changes", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );

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
          <h2>Foundation Section</h2>
          <div className={styles.toggleWrapper} onClick={handleToggleActive}>
            <span
              className={
                foundationData.isActive
                  ? styles.statusActive
                  : styles.statusInactive
              }
            >
              {foundationData.isActive ? "Active" : "Inactive"}
            </span>
            <div
              className={`${styles.toggleSwitch} ${foundationData.isActive ? styles.toggleOn : ""}`}
            >
              <div className={styles.toggleHandle}></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.formSection}>
          <h4>Header Settings</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Foundation Title <span style={{ color: "red" }}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="title"
                  value={foundationData.title || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Mission Statement <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                className={styles.textarea}
                style={{ minHeight: "120px" }}
                name="desc"
                value={foundationData.desc || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <h4>Foundation Logo/Image</h4>
          <div className={styles.uploadContainer} style={{ maxWidth: "400px" }}>
            <div className={styles.previewBox} style={{ height: "200px" }}>
              {foundationData.images[0] ? (
                <img
                  src={
                    (foundationData.images[0]?.startsWith("data:")
                      ? ""
                      : process.env.NEXT_PUBLIC_BASE_PATH || "") +
                    foundationData.images[0]
                  }
                  alt="Foundation Preview"
                />
              ) : (
                <div className={styles.noImage}>
                  <i className="fas fa-university fa-2x"></i>
                  <span>No Image Selected</span>
                </div>
              )}
            </div>
            <div className={styles.fileInputWrapper}>
              <button type="button" className={styles.uploadBtn}>
                <i className="fas fa-cloud-upload-alt"></i> Change Logo Image
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
      </div>
    </div>
  );
}
