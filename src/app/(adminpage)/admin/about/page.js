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
          observer.disconnect(); // Stop observing once visible — no wasted cycles
        }
      },
      { threshold: 0.1, ...options },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

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
      {/* Shimmer skeleton — shown until image fully loads */}
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

      {/* Render <img> only when row is in the viewport */}
      {isVisible && src ? (
        <img
          src={src}
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
// 3. Memoized Table Row Components
// ─────────────────────────────────────────────

// Story Section Row
const StorySectionRow = React.memo(({ section, index, onEdit }) => (
  <tr>
    <td style={{ fontWeight: "700", color: "#FF7703" }}>#{index + 1}</td>
    <td>
      <LazyTableImage src={section.images?.[0] || ""} alt="Story" />
    </td>
    <td>
      <div
        style={{
          fontSize: "13px",
          color: "#666",
          height: "40px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {section.desc || (
          <span style={{ color: "#ccc" }}>No content yet...</span>
        )}
      </div>
    </td>
    <td style={{ textAlign: "right" }}>
      <button className={styles.editBtn} onClick={() => onEdit(index)}>
        <i className="fas fa-edit"></i> Edit
      </button>
    </td>
  </tr>
));
StorySectionRow.displayName = "StorySectionRow";

// Timeline Row
const TimelineRow = React.memo(
  ({ item, index, onEdit, onDelete, onToggle, stylesRef }) => (
    <tr>
      <td style={{ fontWeight: "700", color: "#FF7703" }}>{item.year}</td>
      <td style={{ textTransform: "capitalize" }}>{item.side}</td>
      <td style={{ fontSize: "14px" }}>{item.text}</td>
      <td>
        <div
          className={stylesRef.toggleWrapper}
          onClick={() => onToggle(index)}
          style={{ transform: "scale(0.8)", display: "inline-flex" }}
        >
          <span
            className={
              item.isActive ? stylesRef.statusActive : stylesRef.statusInactive
            }
          >
            {item.isActive ? "Active" : "Inactive"}
          </span>
          <div
            className={`${stylesRef.toggleSwitch} ${item.isActive ? stylesRef.toggleOn : ""}`}
          >
            <div className={stylesRef.toggleHandle}></div>
          </div>
        </div>
      </td>
      <td style={{ textAlign: "right" }}>
        <div className={stylesRef.actionContainer}>
          <button className={stylesRef.editBtn} onClick={() => onEdit(index)}>
            <i className="fas fa-edit"></i>
          </button>
          <button
            className={stylesRef.deleteBtn}
            onClick={() => onDelete(index)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </tr>
  ),
);
TimelineRow.displayName = "TimelineRow";

// Gallery Row
const GalleryRow = React.memo(
  ({ item, index, onEdit, onDelete, onToggle, stylesRef }) => (
    <tr>
      <td>
        <LazyTableImage src={item.src} alt={item.alt} />
      </td>
      <td style={{ fontSize: "14px" }}>
        {item.alt || <span style={{ color: "#ccc" }}>No description</span>}
      </td>
      <td>
        <div
          className={stylesRef.toggleWrapper}
          onClick={() => onToggle(index)}
          style={{ transform: "scale(0.8)", display: "inline-flex" }}
        >
          <span
            className={
              item.isActive ? stylesRef.statusActive : stylesRef.statusInactive
            }
          >
            {item.isActive ? "Active" : "Inactive"}
          </span>
          <div
            className={`${stylesRef.toggleSwitch} ${item.isActive ? stylesRef.toggleOn : ""}`}
          >
            <div className={stylesRef.toggleHandle}></div>
          </div>
        </div>
      </td>
      <td style={{ textAlign: "right" }}>
        <div className={stylesRef.actionContainer}>
          <button className={stylesRef.editBtn} onClick={() => onEdit(index)}>
            <i className="fas fa-edit"></i>
          </button>
          <button
            className={stylesRef.deleteBtn}
            onClick={() => onDelete(index)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </tr>
  ),
);
GalleryRow.displayName = "GalleryRow";

// ─────────────────────────────────────────────
// 4. Toast Component
// ─────────────────────────────────────────────
const Toast = React.memo(({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`${styles.toast} ${
        type === "success" ? styles.toastSuccess : styles.toastError
      }`}
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
});
Toast.displayName = "Toast";

// ─────────────────────────────────────────────
// 5. Main Component
// ─────────────────────────────────────────────
export default function MasterAboutEditor() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [tempData, setTempData] = useState({});
  const [modalErrors, setModalErrors] = useState({});

  // Unified Page State
  const [pageData, setPageData] = useState({
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    storySections: [
      { desc: "", images: [""] },
      { desc: "", images: [""] },
      { desc: "", images: [""] },
    ],
    timeline: [],
    timelineBg: "",
    gallery: [],
    isActive: true,
  });

  // ── Toast Helpers ──────────────────────────
  const addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Fetch on Mount ─────────────────────────
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const res = await api.dynamic("/about");
        if (res.success && res.data) {
          let stories = res.data.storySections || [];
          while (stories.length < 3) stories.push({ desc: "", images: [""] });
          stories = stories.slice(0, 3);

          setPageData({
            ...res.data,
            metaTitle: res.data.metaTitle || "",
            metaKeywords: res.data.metaKeywords || "",
            metaDescription: res.data.metaDescription || "",
            isActive: res.data.isActive ?? true,
            storySections: stories,
            timeline: res.data.timeline || [],
            timelineBg: res.data.timelineBg || "",
            gallery: res.data.gallery || [],
          });
        }
      } catch {
        addToast("Failed to load page data", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchPageData();
  }, [addToast]);

  // ── Meta Change ────────────────────────────
  const handleMetaChange = useCallback((e) => {
    const { name, value } = e.target;
    setPageData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // ── Modal ──────────────────────────────────
  const openEditModal = useCallback(
    (type, index = null) => {
      setModalType(type);
      setEditIndex(index);
      setModalErrors({});
      if (index !== null) {
        setTempData({ ...pageData[type][index] });
      } else {
        if (type === "storySections") return;
        setTempData(
          type === "gallery"
            ? { src: "", alt: "", isActive: true }
            : { year: "", text: "", side: "left", image: "", isActive: true },
        );
      }
      setIsModalOpen(true);
    },
    [pageData],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalErrors({});
  }, []);

  // ── Save Section ───────────────────────────
  const handleSaveSection = useCallback(
    async (section, explicitData = null) => {
      const dataToSave = {};

      if (section === "seo") {
        if (
          !pageData.metaTitle ||
          !pageData.metaKeywords ||
          !pageData.metaDescription
        ) {
          addToast("Please fill all SEO fields marked with *", "error");
          return;
        }
        dataToSave.metaTitle = pageData.metaTitle;
        dataToSave.metaKeywords = pageData.metaKeywords;
        dataToSave.metaDescription = pageData.metaDescription;
      } else if (section === "storySections") {
        dataToSave.storySections = explicitData || pageData.storySections;
      } else if (section === "timeline") {
        dataToSave.timeline = explicitData || pageData.timeline;
        dataToSave.timelineBg = pageData.timelineBg;
      } else if (section === "gallery") {
        dataToSave.gallery = explicitData || pageData.gallery;
      } else if (section === "isActive") {
        dataToSave.isActive =
          explicitData !== null ? explicitData : pageData.isActive;
      }

      setLoading(true);
      try {
        const res = await api.patch("/about", dataToSave);
        if (res.success) addToast("Updated successfully!", "success");
      } catch (error) {
        addToast(error.message || "Failed to save to database", "error");
      } finally {
        setLoading(false);
      }
    },
    [pageData, addToast],
  );

  // ── Modal Save ─────────────────────────────
  const handleModalSave = useCallback(async () => {
    // ── Field Validation ──
    const errors = {};
    if (modalType === "timeline") {
      if (!tempData.year?.trim()) errors.year = true;
      if (!tempData.text?.trim()) errors.text = true;
    } else if (modalType === "gallery") {
      if (!tempData.src) errors.src = true;
    } else if (modalType === "storySections") {
      if (!tempData.desc?.trim()) errors.desc = true;
      if (!tempData.images?.[0]) errors.src = true;
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      addToast("Please fill all required fields", "error");
      return;
    }

    const updated = [...pageData[modalType]];
    if (editIndex !== null) updated[editIndex] = tempData;
    else updated.push(tempData);

    setPageData((prev) => ({ ...prev, [modalType]: updated }));

    setLoading(true);
    try {
      const res = await api.patch("/about", { [modalType]: updated });
      if (res.success) {
        addToast("updated successfully!", "success");
        setIsModalOpen(false);
        setModalErrors({});
      }
    } catch (error) {
      addToast(error.message || "Failed to sync changes", "error");
    } finally {
      setLoading(false);
    }
  }, [pageData, modalType, editIndex, tempData, addToast]);

  // ── Delete ─────────────────────────────────
  const deleteItem = useCallback(
    async (type, index) => {
      if (type === "storySections") return;
      const updated = pageData[type].filter((_, i) => i !== index);
      setPageData((prev) => ({ ...prev, [type]: updated }));
      await handleSaveSection(type, updated);
    },
    [pageData, handleSaveSection],
  );

  // ── Status Toggle ──────────────────────────
  const handleStatusToggle = useCallback(
    async (type, index) => {
      const updated = [...pageData[type]];
      updated[index] = {
        ...updated[index],
        isActive: !updated[index].isActive,
      };
      setPageData((prev) => ({ ...prev, [type]: updated }));
      await handleSaveSection(type, updated);
    },
    [pageData, handleSaveSection],
  );

  // ── Page Active Toggle ─────────────────────
  const handleTogglePageActive = useCallback(async () => {
    const newStatus = !pageData.isActive;
    setPageData((prev) => ({ ...prev, isActive: newStatus }));
    await handleSaveSection("isActive", newStatus);
  }, [pageData.isActive, handleSaveSection]);

  // ── Timeline BG Upload ─────────────────────
  const handleTimelineBgUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setPageData((prev) => ({ ...prev, timelineBg: reader.result }));
    reader.readAsDataURL(file);
  }, []);

  // ── Memoized callbacks for rows ────────────
  const handleOpenStoryEdit = useCallback(
    (index) => openEditModal("storySections", index),
    [openEditModal],
  );
  const handleOpenTimelineEdit = useCallback(
    (index) => openEditModal("timeline", index),
    [openEditModal],
  );
  const handleOpenGalleryEdit = useCallback(
    (index) => openEditModal("gallery", index),
    [openEditModal],
  );
  const handleDeleteTimeline = useCallback(
    (index) => deleteItem("timeline", index),
    [deleteItem],
  );
  const handleDeleteGallery = useCallback(
    (index) => deleteItem("gallery", index),
    [deleteItem],
  );
  const handleToggleTimeline = useCallback(
    (index) => handleStatusToggle("timeline", index),
    [handleStatusToggle],
  );
  const handleToggleGallery = useCallback(
    (index) => handleStatusToggle("gallery", index),
    [handleStatusToggle],
  );

  // ─────────────────────────────────────────
  if (fetching)
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );

  return (
    <div>
      {/* Shimmer keyframe — injected once */}
      <style>{`
        @keyframes lazyShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Toast Container */}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Header */}
      <div className={styles.contentHeader}>
        <div className={styles.flexRow}>
          <h2>About Us Management</h2>
          <div
            className={styles.toggleWrapper}
            onClick={handleTogglePageActive}
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
              <div className={styles.toggleHandle}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. SEO Meta Section ── */}
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <h4>SEO & Meta Settings</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Title <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="metaTitle"
                value={pageData.metaTitle}
                onChange={handleMetaChange}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Keywords (separated by commas){" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="metaKeywords"
                value={pageData.metaKeywords}
                onChange={handleMetaChange}
                placeholder="Keyword1, Keyword2"
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Description <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                name="metaDescription"
                value={pageData.metaDescription}
                onChange={handleMetaChange}
                className={styles.textarea}
                style={{ minHeight: "80px" }}
              />
            </div>
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={styles.saveChangesBtn}
            onClick={() => handleSaveSection("seo")}
            disabled={loading}
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              "Save Meta Data"
            )}
          </button>
        </div>
      </div>

      {/* ── 2. Narrative Table ── */}
      <h3 className={styles.sectionHeader}>Narrative Sections</h3>
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Step</th>
                <th style={{ width: "120px" }}>Image</th>
                <th>Description Preview</th>
                <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.storySections.map((section, index) => (
                <StorySectionRow
                  key={index}
                  section={section}
                  index={index}
                  onEdit={handleOpenStoryEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Timeline ── */}
      <h3 className={styles.sectionHeader}>History & Timeline</h3>
      <div className={styles.card} style={{ marginBottom: "25px" }}>
        <div className={styles.formSection}>
          {/* Timeline Background */}
          <div
            style={{
              marginBottom: "25px",
              padding: "20px",
              background: "#f9f9f9",
              borderRadius: "12px",
              border: "1px dashed #ddd",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "20px",
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 10px 0" }}>
                  Journey Section Background
                </h4>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "15px",
                  }}
                >
                  This image will appear as the backdrop for the entire Journey
                  section.
                </p>
                <div className={styles.fileInputWrapper}>
                  <button
                    className={styles.uploadBtn}
                    style={{ width: "100%", maxWidth: "200px" }}
                  >
                    <i className="fas fa-image"></i> Change Background
                  </button>
                  <input
                    type="file"
                    onChange={handleTimelineBgUpload}
                    accept="image/*"
                  />
                </div>
              </div>
              <div
                className={styles.previewBox}
                style={{
                  width: "150px",
                  height: "80px",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              >
                {pageData.timelineBg ? (
                  <LazyTableImage
                    src={pageData.timelineBg}
                    alt="Timeline BG"
                    height={80}
                    width={150}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#ccc",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No Background
                  </div>
                )}
              </div>
            </div>
            <div className={styles.btnContainer}>
              <button
                className={styles.saveChangesBtn}
                onClick={() => handleSaveSection("timeline")}
                disabled={loading}
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  "Save Background"
                )}
              </button>
            </div>
          </div>

          {/* Timeline Events Header */}
          <div className={styles.listHeader}>
            <h3 className={styles.listTitle}>Timeline Events</h3>
            <button
              className={styles.uploadBtn}
              onClick={() => openEditModal("timeline")}
            >
              <i className="fas fa-plus"></i> Add Event
            </button>
          </div>

          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th style={{ width: "100px" }}>Year</th>
                <th style={{ width: "100px" }}>Side</th>
                <th>Event Description</th>
                <th style={{ width: "100px" }}>Status</th>
                <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.timeline.map((item, index) => (
                <TimelineRow
                  key={index}
                  item={item}
                  index={index}
                  onEdit={handleOpenTimelineEdit}
                  onDelete={handleDeleteTimeline}
                  onToggle={handleToggleTimeline}
                  stylesRef={styles}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Gallery ── */}
      <h3 className={styles.sectionHeader}>Media Gallery</h3>
      <div className={styles.card} style={{ marginBottom: "40px" }}>
        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <div className={styles.listHeader}>
            <h3 className={styles.listTitle}>Gallery Items</h3>
            <button
              className={styles.uploadBtn}
              onClick={() => openEditModal("gallery")}
            >
              <i className="fas fa-plus"></i> Add Image
            </button>
          </div>

          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Preview</th>
                <th>Alt Details</th>
                <th style={{ width: "100px" }}>Status</th>
                <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.gallery.map((item, index) => (
                <GalleryRow
                  key={index}
                  item={item}
                  index={index}
                  onEdit={handleOpenGalleryEdit}
                  onDelete={handleDeleteGallery}
                  onToggle={handleToggleGallery}
                  stylesRef={styles}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Shared Modal ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                {modalType === "storySections"
                  ? `Step #${editIndex + 1} Content`
                  : modalType === "gallery"
                    ? editIndex !== null
                      ? "Edit Gallery Item"
                      : "Add Gallery Item"
                    : editIndex !== null
                      ? "Edit Timeline Event"
                      : "Add Timeline Event"}
              </h3>
              <button className={styles.closeBtn} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Story Modal */}
              {modalType === "storySections" && (
                <div className={styles.grid}>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>
                      Step Image <span style={{ color: "red" }}>*</span>
                    </label>
                    <div
                      className={`${styles.previewBox} ${modalErrors.src ? styles.errorInput : ""}`}
                      style={{ height: "200px", marginBottom: "10px" }}
                    >
                      {tempData.images?.[0] ? (
                        <img
                          src={tempData.images[0]}
                          alt="Story"
                          style={{ height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div className={styles.noImage}>
                          <i className="fas fa-image fa-2x"></i>
                        </div>
                      )}
                    </div>
                    <div className={styles.fileInputWrapper}>
                      <button
                        className={styles.uploadBtn}
                        style={{ width: "100%" }}
                      >
                        <i className="fas fa-upload"></i> Upload Image
                      </button>
                      <input
                        type="file"
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (!f) return;
                          const r = new FileReader();
                          r.onloadend = () => {
                            setTempData((prev) => ({
                              ...prev,
                              images: [r.result],
                            }));
                            if (modalErrors.src)
                              setModalErrors((prev) => ({
                                ...prev,
                                src: false,
                              }));
                          };
                          r.readAsDataURL(f);
                        }}
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>
                      Step Description <span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                      value={tempData.desc || ""}
                      onChange={(e) => {
                        setTempData((prev) => ({
                          ...prev,
                          desc: e.target.value,
                        }));
                        if (modalErrors.desc)
                          setModalErrors((prev) => ({ ...prev, desc: false }));
                      }}
                      className={`${styles.textarea} ${modalErrors.desc ? styles.errorInput : ""}`}
                      style={{ minHeight: "150px" }}
                    />
                  </div>
                </div>
              )}

              {/* Gallery Modal */}
              {modalType === "gallery" && (
                <div className={styles.grid}>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>
                      Image Preview <span style={{ color: "red" }}>*</span>
                    </label>
                    <div
                      className={`${styles.previewBox} ${modalErrors.src ? styles.errorInput : ""}`}
                      style={{ height: "180px", marginBottom: "10px" }}
                    >
                      {tempData.src ? (
                        <img
                          src={tempData.src}
                          alt="Preview"
                          style={{ height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div className={styles.noImage}>
                          <i className="fas fa-image fa-2x"></i>
                        </div>
                      )}
                    </div>
                    <div className={styles.fileInputWrapper}>
                      <button
                        className={styles.uploadBtn}
                        style={{ width: "100%" }}
                      >
                        <i className="fas fa-upload"></i> Choose Image
                      </button>
                      <input
                        type="file"
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (!f) return;
                          const r = new FileReader();
                          r.onloadend = () => {
                            setTempData((prev) => ({ ...prev, src: r.result }));
                            if (modalErrors.src)
                              setModalErrors((prev) => ({
                                ...prev,
                                src: false,
                              }));
                          };
                          r.readAsDataURL(f);
                        }}
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Alt Description</label>
                    <input
                      type="text"
                      value={tempData.alt || ""}
                      onChange={(e) =>
                        setTempData((prev) => ({
                          ...prev,
                          alt: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Timeline Modal */}
              {modalType === "timeline" && (
                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label>
                      Year <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={tempData.year || ""}
                      className={modalErrors.year ? styles.errorInput : ""}
                      onChange={(e) => {
                        setTempData((prev) => ({
                          ...prev,
                          year: e.target.value,
                        }));
                        if (modalErrors.year)
                          setModalErrors((prev) => ({ ...prev, year: false }));
                      }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Side (Alignment)</label>
                    <select
                      value={tempData.side || "left"}
                      onChange={(e) =>
                        setTempData((prev) => ({
                          ...prev,
                          side: e.target.value,
                        }))
                      }
                      className={styles.select}
                    >
                      <option value="left">Left Side</option>
                      <option value="right">Right Side</option>
                    </select>
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>
                      Event Description <span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                      value={tempData.text || ""}
                      onChange={(e) => {
                        setTempData((prev) => ({
                          ...prev,
                          text: e.target.value,
                        }));
                        if (modalErrors.text)
                          setModalErrors((prev) => ({ ...prev, text: false }));
                      }}
                      className={`${styles.textarea} ${modalErrors.text ? styles.errorInput : ""}`}
                      style={{ minHeight: "100px" }}
                    />
                  </div>
                </div>
              )}

              {/* Status Toggle (non-story modals) */}
              {modalType !== "storySections" && (
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <div
                    className={styles.toggleWrapper}
                    onClick={() =>
                      setTempData((prev) => ({
                        ...prev,
                        isActive: !prev.isActive,
                      }))
                    }
                    style={{ marginTop: "8px" }}
                  >
                    <span
                      className={
                        tempData.isActive
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {tempData.isActive ? "Active" : "Inactive"}
                    </span>
                    <div
                      className={`${styles.toggleSwitch} ${
                        tempData.isActive ? styles.toggleOn : ""
                      }`}
                    >
                      <div className={styles.toggleHandle}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.saveChangesBtn}
                style={{ width: "100%" }}
                onClick={handleModalSave}
                disabled={loading}
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
