"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "../../admin.module.css";
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
          observer.disconnect(); // Fire once, then stop watching
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
const LazyTableImage = React.memo(({ src, alt, height = 60, width = 100 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: "hidden",
        borderRadius: "8px",
        border: "1px solid #eee",
        background: "#f0f0f0",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Shimmer — shown until image fully paints */}
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

      {/* Render <img> only when scrolled into view */}
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
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s ease",
            display: "block",
          }}
        />
      ) : !src ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i
            className="fas fa-image"
            style={{ color: "#ccc", fontSize: "18px" }}
          />
        </div>
      ) : null}
    </div>
  );
});
LazyTableImage.displayName = "LazyTableImage";

// ─────────────────────────────────────────────
// 3. Memoized Slide Table Row
// ─────────────────────────────────────────────
const SlideRow = React.memo(
  ({
    slide,
    index,
    totalSlides,
    onEdit,
    onDelete,
    onToggle,
    onReorder,
    stylesRef,
  }) => {
    const isBase64 = slide.image?.startsWith("data:");

    return (
      <tr>
        {/* Order Selector */}
        <td style={{ textAlign: "center" }}>
          <select
            value={index}
            onChange={(e) => onReorder(index, parseInt(e.target.value))}
            className={stylesRef.select}
            style={{ width: "60px", padding: "5px" }}
          >
            {Array.from({ length: totalSlides }, (_, idx) => (
              <option key={idx} value={idx}>
                {idx + 1}
              </option>
            ))}
          </select>
        </td>

        {/* Lazy Image */}
        <td>
          <LazyTableImage src={slide.image} alt={`Slide ${index + 1}`} />
        </td>

        {/* Source Path */}
        <td>
          <div
            style={{
              fontSize: "11px",
              color: "#888",
              maxWidth: "250px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isBase64 ? "unsaved_buffer" : slide.image}
          </div>
        </td>

        {/* Status Toggle */}
        <td style={{ textAlign: "center" }}>
          <div
            className={stylesRef.toggleWrapper}
            onClick={() => onToggle(index)}
            style={{
              transform: "scale(0.8)",
              cursor: "pointer",
              display: "inline-flex",
            }}
          >
            <span
              className={
                slide.isActive
                  ? stylesRef.statusActive
                  : stylesRef.statusInactive
              }
            >
              {slide.isActive ? "Active" : "Inactive"}
            </span>
            <div
              className={`${stylesRef.toggleSwitch} ${slide.isActive ? stylesRef.toggleOn : ""}`}
            >
              <div className={stylesRef.toggleHandle}></div>
            </div>
          </div>
        </td>

        {/* Actions */}
        <td>
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
    );
  },
);
SlideRow.displayName = "SlideRow";

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
export default function SliderPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [sliderData, setSliderData] = useState({
    title: "",
    desc: "",
    slides: [],
    isActive: true,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [tempSlide, setTempSlide] = useState({
    image: "",
    order: 0,
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
    const fetchSlider = async () => {
      try {
        const res = await api.dynamic("/home/slider");
        if (res.success && res.data) {
          setSliderData({
            title: res.data.title || "",
            desc: res.data.desc || "",
            slides: Array.isArray(res.data.slides) ? res.data.slides : [],
            isActive: res.data.isActive ?? true,
          });
        }
      } catch {
        addToast("Failed to load slider data", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchSlider();
  }, [addToast]);

  // ── Text Change ────────────────────────────
  const handleTextChange = useCallback((e) => {
    const { name, value } = e.target;
    setSliderData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // ── Page Active Toggle ─────────────────────
  const handleToggleActive = useCallback(async () => {
    const newStatus = !sliderData.isActive;
    setSliderData((prev) => ({ ...prev, isActive: newStatus }));
    try {
      const res = await api.patch("/home/slider", {
        ...sliderData,
        isActive: newStatus,
      });
      if (res.success && res.data) {
        addToast(
          `Slider visibility: ${newStatus ? "Active" : "Inactive"}.`,
          "success",
        );
        setSliderData({
          ...res.data,
          slides: Array.isArray(res.data.slides) ? res.data.slides : [],
        });
      }
    } catch (error) {
      setSliderData((prev) => ({ ...prev, isActive: !newStatus }));
      addToast(error.message || "Failed to update status", "error");
    }
  }, [sliderData, addToast]);

  // ── Modal Open ─────────────────────────────
  const openModal = useCallback(
    (index = null) => {
      if (index !== null) {
        setEditIndex(index);
        setTempSlide({ ...sliderData.slides[index] });
      } else {
        setEditIndex(null);
        setTempSlide({
          image: "",
          order: sliderData.slides.length,
          isActive: true,
        });
      }
      setIsModalOpen(true);
    },
    [sliderData.slides],
  );

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // ── Image Upload ───────────────────────────
  const handleImageUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        addToast("Image size should be less than 5MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () =>
        setTempSlide((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    },
    [addToast],
  );

  // ── Save Modal ─────────────────────────────
  const handleSaveModal = useCallback(async () => {
    if (!tempSlide.image) {
      addToast("Slide image is required!", "error");
      return;
    }

    const updatedSlides = [...sliderData.slides];
    if (editIndex !== null) updatedSlides[editIndex] = tempSlide;
    else updatedSlides.push(tempSlide);

    updatedSlides.sort((a, b) => a.order - b.order);
    const updatedData = { ...sliderData, slides: updatedSlides };

    setLoading(true);
    try {
      const res = await api.patch("/home/slider", updatedData);
      if (res.success && res.data) {
        setSliderData({
          ...res.data,
          slides: Array.isArray(res.data.slides) ? res.data.slides : [],
        });
        setIsModalOpen(false);
        addToast(
          editIndex !== null
            ? "Slide updated successfully!"
            : "New slide added successfully!",
          "success",
        );
      }
    } catch (error) {
      addToast(error.message || "Failed to save slide", "error");
    } finally {
      setLoading(false);
    }
  }, [tempSlide, sliderData, editIndex, addToast]);

  // ── Delete Slide ───────────────────────────
  const deleteSlide = useCallback(
    async (index) => {
      const updatedSlides = sliderData.slides.filter((_, i) => i !== index);
      const updatedData = { ...sliderData, slides: updatedSlides };

      setLoading(true);
      try {
        const res = await api.patch("/home/slider", updatedData);
        if (res.success && res.data) {
          setSliderData({
            ...res.data,
            slides: Array.isArray(res.data.slides) ? res.data.slides : [],
          });
          addToast("Slide deleted successfully!", "success");
        }
      } catch (error) {
        addToast(error.message || "Failed to delete slide", "error");
      } finally {
        setLoading(false);
      }
    },
    [sliderData, addToast],
  );

  // ── Toggle Slide Status ────────────────────
  const toggleSlideStatus = useCallback(
    async (index) => {
      const updatedSlides = sliderData.slides.map((s, i) =>
        i === index ? { ...s, isActive: !s.isActive } : s,
      );
      const updatedData = { ...sliderData, slides: updatedSlides };

      setLoading(true);
      try {
        const res = await api.patch("/home/slider", updatedData);
        if (res.success && res.data) {
          setSliderData({
            ...res.data,
            slides: Array.isArray(res.data.slides) ? res.data.slides : [],
          });
          addToast(
            `Slide status: ${updatedSlides[index].isActive ? "Active" : "Inactive"}`,
            "success",
          );
        }
      } catch (error) {
        addToast(error.message || "Failed to update slide status", "error");
      } finally {
        setLoading(false);
      }
    },
    [sliderData, addToast],
  );

  // ── Reorder Slide ──────────────────────────
  const updateSlideOrder = useCallback(
    async (index, newOrder) => {
      const slidesCount = sliderData.slides.length;
      if (newOrder < 0 || newOrder >= slidesCount) return;

      const updatedSlides = [...sliderData.slides];
      const [movedSlide] = updatedSlides.splice(index, 1);
      movedSlide.order = newOrder;
      updatedSlides.splice(newOrder, 0, movedSlide);

      const normalizedSlides = updatedSlides.map((slide, idx) => ({
        ...slide,
        order: idx,
      }));

      const updatedData = { ...sliderData, slides: normalizedSlides };

      setLoading(true);
      try {
        const res = await api.patch("/home/slider", updatedData);
        if (res.success && res.data) {
          setSliderData({
            ...res.data,
            slides: Array.isArray(res.data.slides) ? res.data.slides : [],
          });
          addToast("Slide order updated successfully!", "success");
        }
      } catch (error) {
        addToast(error.message || "Failed to update slide order", "error");
      } finally {
        setLoading(false);
      }
    },
    [sliderData, addToast],
  );

  // ── Final Save (title + desc) ──────────────
  const handleFinalSave = useCallback(async () => {
    if (!sliderData.title.trim()) {
      addToast("Slider Title is required!", "error");
      return;
    }
    if (!sliderData.desc.trim()) {
      addToast("Slider Description is required!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch("/home/slider", sliderData);
      if (res.success && res.data) {
        setSliderData({
          ...res.data,
          slides: Array.isArray(res.data.slides) ? res.data.slides : [],
        });
        addToast("Main settings saved successfully!", "success");
      }
    } catch (error) {
      addToast(error.message || "Failed to save changes", "error");
    } finally {
      setLoading(false);
    }
  }, [sliderData, addToast]);

  // ─────────────────────────────────────────
  if (fetching) {
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );
  }

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
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Header */}
      <div className={styles.contentHeader}>
        <div className={styles.flexRow}>
          <h2>Home Slider Management</h2>
          <div className={styles.toggleWrapper} onClick={handleToggleActive}>
            <span
              className={
                sliderData.isActive
                  ? styles.statusActive
                  : styles.statusInactive
              }
            >
              {sliderData.isActive ? "Active" : "Inactive"}
            </span>
            <div
              className={`${styles.toggleSwitch} ${sliderData.isActive ? styles.toggleOn : ""}`}
            >
              <div className={styles.toggleHandle}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Header Settings Card ── */}
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <h4>Header Settings</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Title <span style={{ color: "red" }}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="title"
                  value={sliderData.title || ""}
                  onChange={handleTextChange}
                  placeholder="e.g., Welcome to Vidyasthanam"
                  required
                />
              </div>
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Slider Description <span style={{ color: "red" }}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="desc"
                  value={sliderData.desc || ""}
                  onChange={handleTextChange}
                  placeholder="A short description for the slider section"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={styles.saveChangesBtn}
            onClick={handleFinalSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <i
                  className="fas fa-spinner fa-spin"
                  style={{ marginRight: "10px" }}
                ></i>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {/* ── Slides Table ── */}
      <div className={styles.card}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Slides Collection</h3>
          <button className={styles.uploadBtn} onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Add New Slide
          </button>
        </div>

        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th style={{ width: "100px", textAlign: "center" }}>Order</th>
                <th style={{ width: "150px" }}>Image Preview</th>
                <th>Source Path</th>
                <th style={{ width: "120px", textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right", width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sliderData.slides.length > 0 ? (
                sliderData.slides.map((slide, index) => (
                  <SlideRow
                    key={index}
                    slide={slide}
                    index={index}
                    totalSlides={sliderData.slides.length}
                    onEdit={openModal}
                    onDelete={deleteSlide}
                    onToggle={toggleSlideStatus}
                    onReorder={updateSlideOrder}
                    stylesRef={styles}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "60px",
                      color: "#999",
                    }}
                  >
                    <i
                      className="fas fa-image fa-3x"
                      style={{
                        marginBottom: "15px",
                        display: "block",
                        color: "#eee",
                      }}
                    ></i>
                    No slides added yet. Click "Add New Slide" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                {editIndex !== null ? "Edit Slide Content" : "Create New Slide"}
              </h3>
              <button className={styles.closeBtn} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Image Upload */}
              <div className={styles.formGroup}>
                <label>
                  Slide Image <span style={{ color: "red" }}>*</span>
                </label>
                <div
                  className={styles.previewBox}
                  style={{ marginBottom: "15px", height: "220px" }}
                >
                  {tempSlide.image ? (
                    <img
                      src={
                        (tempSlide.image?.startsWith("data:")
                          ? ""
                          : process.env.NEXT_PUBLIC_BASE_PATH || "") +
                        tempSlide.image
                      }
                      alt="Slide Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className={styles.noImage}>
                      <i className="fas fa-image fa-4x"></i>
                      <span>No Image Selected</span>
                    </div>
                  )}
                </div>
                <div
                  className={styles.fileInputWrapper}
                  style={{ display: "block", textAlign: "center" }}
                >
                  <button
                    type="button"
                    className={styles.uploadBtn}
                    style={{ margin: "0 auto" }}
                  >
                    <i className="fas fa-cloud-upload-alt"></i>{" "}
                    {tempSlide.image ? "Change Image" : "Select Image"}
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#888",
                      marginTop: "5px",
                    }}
                  >
                    Recommended: 1920x1080px (WebP Format, Max 5MB)
                  </p>
                </div>
              </div>

              {/* Sequence Order */}
              <div className={styles.formGroup}>
                <label>Sequence Order</label>
                <input
                  type="number"
                  className={styles.input}
                  value={tempSlide.order}
                  onChange={(e) =>
                    setTempSlide((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "2px solid #eee",
                  }}
                />
                <small style={{ color: "#666", fontSize: "11px" }}>
                  Determines position in the slider (0 is first)
                </small>
              </div>

              {/* Display Status */}
              <div className={styles.formGroup}>
                <label>Display Status</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    {tempSlide.isActive ? "Visible" : "Hidden"}
                  </span>
                  <div
                    className={`${styles.toggleSwitch} ${
                      tempSlide.isActive ? styles.toggleOn : ""
                    }`}
                    onClick={() =>
                      setTempSlide((prev) => ({
                        ...prev,
                        isActive: !prev.isActive,
                      }))
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.toggleHandle}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.saveChangesBtn}
                onClick={handleSaveModal}
                disabled={loading}
                style={{ width: "100%", padding: "12px" }}
              >
                {loading ? (
                  <>
                    <i
                      className="fas fa-spinner fa-spin"
                      style={{ marginRight: "10px" }}
                    ></i>
                    Saving...
                  </>
                ) : editIndex !== null ? (
                  "Update Slide"
                ) : (
                  "Add Slide"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
