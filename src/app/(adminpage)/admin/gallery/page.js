"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "../admin.module.css";
import api from "@/lib/api";

// ─────────────────────────────────────────────
// 1. Custom Hook: Intersection Observer
// ─────────────────────────────────────────────
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
};

// ─────────────────────────────────────────────
// 2. Lazy Image with Shimmer Skeleton
// ─────────────────────────────────────────────
const LazyTableImage = React.memo(({ src, alt, height = 45, width = 80 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        height: `${height}px`,
        width: `${width}px`,
        borderRadius: "8px",
        background: "#f0f0f0",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "lazyShimmer 1.2s infinite",
          }}
        />
      )}
      {isVisible && src ? (
        <img
          src={
            (src?.startsWith("data:")
              ? ""
              : process.env.NEXT_PUBLIC_BASE_PATH || "") + src
          }
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s ease",
            display: "block",
          }}
        />
      ) : !src ? (
        <i
          className="fas fa-image"
          style={{ color: "#ccc", fontSize: "16px" }}
        />
      ) : null}
    </div>
  );
});
LazyTableImage.displayName = "LazyTableImage";

// ─────────────────────────────────────────────
// 3. Toast Component
// ─────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
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

// ─────────────────────────────────────────────
// 4. Main Component
// ─────────────────────────────────────────────
export default function MasterGalleryEditor() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // States
  const [pageData, setPageData] = useState({
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    isActive: true,
    images: [],
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [tempImg, setTempImg] = useState({ src: "", alt: "", isActive: true });

  // Errors
  const [formErrors, setFormErrors] = useState({});
  const [modalErrors, setModalErrors] = useState({});

  // ── Toast Helpers ──────────────────────────
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Fetch on mount ─────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/gallery");
        if (res.success && res.data) {
          setPageData(res.data);
        }
      } catch (err) {
        addToast("Failed to load gallery data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  // ── PUT Helper ─────────────────────────────
  const putData = async (payload) => {
    const res = await api.put("/gallery", payload);
    if (!res.success) throw new Error(res.message);
    return res.data;
  };

  // ── Handlers ──────────────────────────────
  const handleSaveMeta = async () => {
    const errors = {};
    if (!pageData.metaTitle?.trim()) errors.metaTitle = "Required";
    if (!pageData.metaKeywords?.trim()) errors.metaKeywords = "Required";
    if (!pageData.metaDescription?.trim()) errors.metaDescription = "Required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast("Please fill all SEO fields", "error");
      return;
    }

    setSaving(true);
    try {
      await putData({
        metaTitle: pageData.metaTitle,
        metaKeywords: pageData.metaKeywords,
        metaDescription: pageData.metaDescription,
      });
      setFormErrors({}); // Clear errors upon success
      addToast("Meta data saved successfully!", "success");
    } catch (err) {
      addToast("Save failed: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePageStatus = async () => {
    const next = !pageData.isActive;
    setPageData((p) => ({ ...p, isActive: next }));
    try {
      await putData({ isActive: next });
      addToast(`Page status: ${next ? "Active" : "Inactive"}`, "success");
    } catch (err) {
      setPageData((p) => ({ ...p, isActive: !next }));
      addToast("Failed to toggle: " + err.message, "error");
    }
  };

  const openModal = (index = null) => {
    setModalErrors({});
    if (index !== null) {
      setEditIndex(index);
      setTempImg({ ...pageData.images[index] });
    } else {
      setEditIndex(null);
      setTempImg({ src: "", alt: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleModalSave = async () => {
    if (!tempImg.src) {
      setModalErrors({ src: "Image is required" });
      addToast("Select an image first", "error");
      return;
    }

    setSaving(true);
    try {
      const updated = [...pageData.images];
      if (editIndex !== null) updated[editIndex] = tempImg;
      else updated.push(tempImg);

      await putData({ images: updated });
      setPageData((p) => ({ ...p, images: updated }));
      addToast(editIndex !== null ? "Image updated" : "Image added", "success");
      setIsModalOpen(false);
    } catch (err) {
      addToast("Failed to sync: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index) => {
    setLoading(true);
    try {
      const updated = pageData.images.filter((_, i) => i !== index);
      await putData({ images: updated });
      setPageData((p) => ({ ...p, images: updated }));
      addToast("Image deleted", "success");
    } catch (err) {
      addToast("Delete failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (index) => {
    const updated = [...pageData.images];
    updated[index].isActive = !updated[index].isActive;
    try {
      await putData({ images: updated });
      setPageData((p) => ({ ...p, images: updated }));
      addToast("Status updated", "success");
    } catch (err) {
      addToast("Failed to sync status", "error");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImg((prev) => ({ ...prev, src: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !pageData.images.length)
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );

  return (
    <div className={styles.adminContainer}>
      <style>{`@keyframes lazyShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className={styles.contentHeader}>
        <h2>Master Gallery Editor</h2>
        <div
          className={styles.toggleWrapper}
          onClick={handleTogglePageStatus}
          style={{ cursor: "pointer" }}
        >
          <span
            className={
              pageData.isActive ? styles.statusActive : styles.statusInactive
            }
          >
            {pageData.isActive ? "Active" : "Inactive"}
          </span>
          <div
            className={`${styles.toggleSwitch} ${pageData.isActive ? styles.toggleOn : ""}`}
          >
            <div className={styles.toggleHandle} />
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <h4>Gallery SEO Meta Settings</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Title <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={pageData.metaTitle}
                onChange={(e) =>
                  setPageData({ ...pageData, metaTitle: e.target.value })
                }
                className={formErrors.metaTitle ? styles.errorInput : ""}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Keywords <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={pageData.metaKeywords}
                onChange={(e) =>
                  setPageData({ ...pageData, metaKeywords: e.target.value })
                }
                className={formErrors.metaKeywords ? styles.errorInput : ""}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Description <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                value={pageData.metaDescription}
                onChange={(e) =>
                  setPageData({ ...pageData, metaDescription: e.target.value })
                }
                className={`${styles.textarea} ${formErrors.metaDescription ? styles.errorInput : ""}`}
                style={{ minHeight: "80px" }}
              />
            </div>
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={styles.saveChangesBtn}
            onClick={handleSaveMeta}
            disabled={saving}
          >
            {saving ? (
              <i className="fas fa-spinner fa-spin" />
            ) : (
              "Save Meta Settings"
            )}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className={styles.card}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>
            Active Photos ({pageData.images.length})
          </h3>
          <button className={styles.uploadBtn} onClick={() => openModal()}>
            <i className="fas fa-plus" /> Add New Photo
          </button>
        </div>
        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <div className={styles.tableResponsive}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>Preview</th>
                  <th>Title / Alt Description</th>
                  <th style={{ width: "120px" }}>Status</th>
                  <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.images.map((img, i) => (
                  <tr key={i}>
                    <td>
                      <LazyTableImage src={img.src} alt={img.alt} />
                    </td>
                    <td style={{ fontWeight: "500" }}>
                      {img.alt || "No description"}
                    </td>
                    <td>
                      <div
                        className={styles.toggleWrapper}
                        onClick={() => handleToggleItem(i)}
                        style={{
                          transform: "scale(0.85)",
                          transformOrigin: "left",
                        }}
                      >
                        <span
                          className={
                            img.isActive
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                        >
                          {img.isActive ? "Active" : "Inactive"}
                        </span>
                        <div
                          className={`${styles.toggleSwitch} ${img.isActive ? styles.toggleOn : ""}`}
                        >
                          <div className={styles.toggleHandle} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className={styles.editBtn}
                          onClick={() => openModal(i)}
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(i)}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                {editIndex !== null
                  ? "Edit Photo Details"
                  : "Add New Gallery Photo"}
              </h3>
              <button
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>
                  Photo Preview <span style={{ color: "red" }}>*</span>
                </label>
                <div
                  className={styles.previewBox}
                  style={{
                    height: "220px",
                    borderRadius: "12px",
                    border: modalErrors.src
                      ? "1.5px solid red"
                      : "1px solid #ddd",
                  }}
                >
                  {tempImg.src ? (
                    <img
                      src={
                        (tempImg.src?.startsWith("data:")
                          ? ""
                          : process.env.NEXT_PUBLIC_BASE_PATH || "") +
                        tempImg.src
                      }
                      alt="Preview"
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <div className={styles.noImage}>
                      <i className="fas fa-image fa-3x" />
                      <span>No image selected</span>
                    </div>
                  )}
                </div>
              </div>
              <div
                className={styles.fileInputWrapper}
                style={{ marginBottom: "20px" }}
              >
                <button
                  className={styles.uploadBtn}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <i className="fas fa-cloud-upload-alt" />{" "}
                  {tempImg.src ? "Replace Image" : "Upload Image"}
                </button>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Title / Alt Text</label>
                <input
                  type="text"
                  value={tempImg.alt}
                  onChange={(e) =>
                    setTempImg({ ...tempImg, alt: e.target.value })
                  }
                  placeholder="e.g. Performance at ICASM"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Display Status</label>
                <div
                  className={styles.toggleWrapper}
                  onClick={() =>
                    setTempImg((p) => ({ ...p, isActive: !p.isActive }))
                  }
                  style={{ marginTop: "8px" }}
                >
                  <span
                    className={
                      tempImg.isActive
                        ? styles.statusActive
                        : styles.statusInactive
                    }
                  >
                    {tempImg.isActive ? "Active" : "Inactive"}
                  </span>
                  <div
                    className={`${styles.toggleSwitch} ${tempImg.isActive ? styles.toggleOn : ""}`}
                  >
                    <div className={styles.toggleHandle} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.saveChangesBtn}
                style={{ width: "100%" }}
                onClick={handleModalSave}
                disabled={saving}
              >
                {saving ? (
                  <i className="fas fa-spinner fa-spin" />
                ) : editIndex !== null ? (
                  "Update Gallery Photo"
                ) : (
                  "Add to Gallery"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
