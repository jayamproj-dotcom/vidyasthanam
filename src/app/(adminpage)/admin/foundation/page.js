"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "../admin.module.css";
import api from "@/lib/api";

// ─────────────────────────────────────────────
// 1. Hook & Components
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
            animation: "shimmer 1.2s infinite",
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
            transition: "opacity 0.3s",
          }}
        />
      ) : (
        <i className="fas fa-image" style={{ color: "#ccc" }} />
      )}
    </div>
  );
});
LazyTableImage.displayName = "LazyTableImage";

const Toast = React.memo(({ message, type, onClose }) => {
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
});
Toast.displayName = "Toast";

// ─────────────────────────────────────────────
// 2. Main Page Component
// ─────────────────────────────────────────────
export default function MasterFoundationEditor() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pageData, setPageData] = useState({
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    isActive: true,
    logo: "",
    tamilTitle: "",
    englishTitle: "",
    missionDescription: "",
    foundationEmail: "",
    initiatives: [],
    supportOptions: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'initiatives' or 'supportOptions'
  const [editIndex, setEditIndex] = useState(null);
  const [tempData, setTempData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [modalErrors, setModalErrors] = useState({});

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/foundation");
        if (res.success && res.data) setPageData(res.data);
      } catch (err) {
        addToast("Failed to load foundation data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [addToast]);

  const putData = async (payload) => {
    const res = await api.put("/foundation", payload);
    if (!res.success) throw new Error(res.message);
    return res.data;
  };

  const handleGlobalStatus = async () => {
    const next = !pageData.isActive;
    setPageData((p) => ({ ...p, isActive: next }));
    try {
      await putData({ isActive: next });
      addToast(`Foundation: ${next ? "Active" : "Inactive"}`);
    } catch (err) {
      setPageData((p) => ({ ...p, isActive: !next }));
      addToast(err.message, "error");
    }
  };

  const handleSaveMeta = async () => {
    const errors = {};
    if (!pageData.metaTitle?.trim()) errors.metaTitle = "Required";
    if (!pageData.metaKeywords?.trim()) errors.metaKeywords = "Required";
    if (!pageData.metaDescription?.trim()) errors.metaDescription = "Required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return addToast("Please fill all required SEO fields", "error");
    }
    setSaving(true);
    try {
      await putData({
        metaTitle: pageData.metaTitle,
        metaKeywords: pageData.metaKeywords,
        metaDescription: pageData.metaDescription,
      });
      setFormErrors({});
      addToast("SEO Meta saved");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMission = async () => {
    const errors = {};
    if (!pageData.tamilTitle?.trim()) errors.tamilTitle = "Required";
    if (!pageData.englishTitle?.trim()) errors.englishTitle = "Required";
    if (!pageData.missionDescription?.trim())
      errors.missionDescription = "Required";
    if (!pageData.foundationEmail?.trim()) errors.foundationEmail = "Required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return addToast("Please fill all branding fields", "error");
    }

    setSaving(true);
    try {
      await putData({
        logo: pageData.logo,
        tamilTitle: pageData.tamilTitle,
        englishTitle: pageData.englishTitle,
        missionDescription: pageData.missionDescription,
        foundationEmail: pageData.foundationEmail,
      });
      setFormErrors({});
      addToast("Mission branding saved");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const openModal = (type, index = null) => {
    setModalType(type);
    setEditIndex(index);
    setModalErrors({});
    if (index !== null) setTempData({ ...pageData[type][index] });
    else
      setTempData(
        type === "initiatives"
          ? { title: "", description: "", image: "", isActive: true }
          : {
              title: "",
              description: "",
              icon: "fas fa-heart",
              buttonText: "Donate",
              isActive: true,
            },
      );
    setIsModalOpen(true);
  };

  const handleModalSave = async () => {
    const errors = {};
    if (!tempData.title?.trim()) errors.title = "Required";
    if (!tempData.description?.trim()) errors.description = "Required";
    if (modalType === "initiatives" && !tempData.image)
      errors.image = "Image required";
    if (modalType === "supportOptions") {
      if (!tempData.icon?.trim()) errors.icon = "Icon required";
      if (!tempData.buttonText?.trim())
        errors.buttonText = "Button text required";
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return addToast("Please fill all required fields", "error");
    }

    setSaving(true);
    try {
      const updatedList = [...pageData[modalType]];
      if (editIndex !== null) updatedList[editIndex] = tempData;
      else updatedList.push(tempData);
      await putData({ [modalType]: updatedList });
      setPageData((p) => ({ ...p, [modalType]: updatedList }));
      addToast("Updated successfully");
      setIsModalOpen(false);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, index) => {
    setLoading(true);
    try {
      const updated = pageData[type].filter((_, i) => i !== index);
      await putData({ [type]: updated });
      setPageData((p) => ({ ...p, [type]: updated }));
      addToast("Removed successfully");
    } catch (err) {
      addToast("Failed to remove", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = async (type, index) => {
    const updated = [...pageData[type]];
    updated[index].isActive = !updated[index].isActive;
    try {
      await putData({ [type]: updated });
      setPageData((p) => ({ ...p, [type]: updated }));
      addToast("Status updated");
    } catch (err) {
      addToast("Toggle failed", "error");
    }
  };

  const handleImageUpload = (field) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "logo")
          setPageData((p) => ({ ...p, logo: reader.result }));
        else if (field === "temp")
          setTempData((p) => ({ ...p, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !pageData.tamilTitle)
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );

  return (
    <div className={styles.adminContainer}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className={styles.contentHeader}>
        <h2>Master Foundation Editor</h2>
        <div className={styles.toggleWrapper} onClick={handleGlobalStatus}>
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
          <h4>Foundation SEO Meta Settings</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Title <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={pageData.metaTitle}
                onChange={(e) => {
                  setPageData({ ...pageData, metaTitle: e.target.value });
                  setFormErrors((p) => ({ ...p, metaTitle: null }));
                }}
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
                onChange={(e) => {
                  setPageData({ ...pageData, metaKeywords: e.target.value });
                  setFormErrors((p) => ({ ...p, metaKeywords: null }));
                }}
                className={formErrors.metaKeywords ? styles.errorInput : ""}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Description <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                value={pageData.metaDescription}
                onChange={(e) => {
                  setPageData({ ...pageData, metaDescription: e.target.value });
                  setFormErrors((p) => ({ ...p, metaDescription: null }));
                }}
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

      {/* Mission Branding */}
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <h4>Mission & Brand Settings</h4>
          <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
            <div style={{ width: "200px" }}>
              <label className={styles.label}>Foundation Logo</label>
              <div
                className={styles.previewBox}
                style={{ height: "150px", marginBottom: "10px" }}
              >
                {pageData.logo ? (
                  <img
                    src={
                      (pageData.logo?.startsWith("data:")
                        ? ""
                        : process.env.NEXT_PUBLIC_BASE_PATH || "") +
                      pageData.logo
                    }
                    alt="Logo"
                    style={{ objectFit: "contain", padding: "10px" }}
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
                  style={{ width: "100%", fontSize: "11px" }}
                >
                  <i className="fas fa-cloud-upload-alt" /> Change Logo
                </button>
                <input
                  type="file"
                  onChange={handleImageUpload("logo")}
                  accept="image/*"
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className={styles.grid}>
                <div className={styles.formGroup}>
                  <label>
                    Tamil Title <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={pageData.tamilTitle}
                    onChange={(e) => {
                      setPageData({ ...pageData, tamilTitle: e.target.value });
                      setFormErrors((p) => ({ ...p, tamilTitle: null }));
                    }}
                    className={formErrors.tamilTitle ? styles.errorInput : ""}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    English Title <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={pageData.englishTitle}
                    onChange={(e) => {
                      setPageData({
                        ...pageData,
                        englishTitle: e.target.value,
                      });
                      setFormErrors((p) => ({ ...p, englishTitle: null }));
                    }}
                    className={formErrors.englishTitle ? styles.errorInput : ""}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>
                    Foundation Email <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={pageData.foundationEmail}
                    onChange={(e) => {
                      setPageData({
                        ...pageData,
                        foundationEmail: e.target.value,
                      });
                      setFormErrors((p) => ({ ...p, foundationEmail: null }));
                    }}
                    className={
                      formErrors.foundationEmail ? styles.errorInput : ""
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>
              Mission Description <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              className={`${styles.textarea} ${formErrors.missionDescription ? styles.errorInput : ""}`}
              style={{ minHeight: "120px" }}
              value={pageData.missionDescription}
              onChange={(e) => {
                setPageData({
                  ...pageData,
                  missionDescription: e.target.value,
                });
                setFormErrors((p) => ({ ...p, missionDescription: null }));
              }}
            />
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={styles.saveChangesBtn}
            onClick={handleSaveMission}
            disabled={saving}
          >
            {saving ? (
              <i className="fas fa-spinner fa-spin" />
            ) : (
              "Save Branding"
            )}
          </button>
        </div>
      </div>

      {/* Initiatives Table */}
      <h3 className={styles.sectionHeader}>Our Initiatives</h3>
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>
            Managed Initiatives ({pageData.initiatives.length})
          </h3>
          <button
            className={styles.uploadBtn}
            onClick={() => openModal("initiatives")}
          >
            <i className="fas fa-plus" /> Add Initiative
          </button>
        </div>
        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <div className={styles.tableResponsive}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th style={{ width: "100px" }}>Status</th>
                  <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.initiatives.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <LazyTableImage src={item.image} alt={item.title} />
                    </td>
                    <td style={{ fontWeight: 600, color: "#67080E" }}>
                      {item.title}
                    </td>
                    <td style={{ fontSize: "12px", color: "#666" }}>
                      {item.description}
                    </td>
                    <td>
                      <div
                        className={styles.toggleWrapper}
                        onClick={() => handleItemToggle("initiatives", i)}
                        style={{
                          transform: "scale(0.85)",
                          transformOrigin: "left",
                        }}
                      >
                        <span
                          className={
                            item.isActive
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                        <div
                          className={`${styles.toggleSwitch} ${item.isActive ? styles.toggleOn : ""}`}
                        >
                          <div className={styles.toggleHandle} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className={styles.editBtn}
                          onClick={() => openModal("initiatives", i)}
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete("initiatives", i)}
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

      {/* Support Options Table */}
      <h3 className={styles.sectionHeader}>Support Options</h3>
      <div className={styles.card} style={{ marginBottom: "40px" }}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>
            Ways to Help ({pageData.supportOptions.length})
          </h3>
          <button
            className={styles.uploadBtn}
            onClick={() => openModal("supportOptions")}
          >
            <i className="fas fa-plus" /> Add Option
          </button>
        </div>
        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <div className={styles.tableResponsive}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Button</th>
                  <th style={{ width: "100px" }}>Status</th>
                  <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.supportOptions.map((item, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: "center" }}>
                      <i
                        className={item.icon}
                        style={{ color: "#FF7703", fontSize: "1.2rem" }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.title}</td>
                    <td style={{ fontSize: "12px" }}>{item.description}</td>
                    <td
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#FF7703",
                      }}
                    >
                      {item.buttonText}
                    </td>
                    <td>
                      <div
                        className={styles.toggleWrapper}
                        onClick={() => handleItemToggle("supportOptions", i)}
                        style={{
                          transform: "scale(0.85)",
                          transformOrigin: "left",
                        }}
                      >
                        <span
                          className={
                            item.isActive
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                        <div
                          className={`${styles.toggleSwitch} ${item.isActive ? styles.toggleOn : ""}`}
                        >
                          <div className={styles.toggleHandle} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className={styles.editBtn}
                          onClick={() => openModal("supportOptions", i)}
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete("supportOptions", i)}
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

      {/* Shared Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                {editIndex !== null ? "Edit" : "Add"}{" "}
                {modalType === "initiatives" ? "Initiative" : "Support Option"}
              </h3>
              <button
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div className={styles.modalBody}>
              {modalType === "initiatives" && (
                <div className={styles.formGroup}>
                  <label>
                    Initiative Image <span style={{ color: "red" }}>*</span>
                  </label>
                  <div
                    className={styles.previewBox}
                    style={{
                      height: "180px",
                      marginBottom: "10px",
                      border: modalErrors.image
                        ? "1.5px solid red"
                        : "1px solid #ddd",
                    }}
                  >
                    {tempData.image ? (
                      <img
                        src={
                          (tempData.image?.startsWith("data:")
                            ? ""
                            : process.env.NEXT_PUBLIC_BASE_PATH || "") +
                          tempData.image
                        }
                        alt="Preview"
                      />
                    ) : (
                      <div className={styles.noImage}>
                        <i className="fas fa-image fa-2x" />
                      </div>
                    )}
                  </div>
                  <div className={styles.fileInputWrapper}>
                    <button
                      className={styles.uploadBtn}
                      style={{ width: "100%" }}
                    >
                      <i className="fas fa-upload" /> Change Image
                    </button>
                    <input
                      type="file"
                      onChange={handleImageUpload("temp")}
                      accept="image/*"
                    />
                  </div>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>
                  Title <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  value={tempData.title}
                  onChange={(e) => {
                    setTempData({ ...tempData, title: e.target.value });
                    setModalErrors((p) => ({ ...p, title: null }));
                  }}
                  className={modalErrors.title ? styles.errorInput : ""}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  Description <span style={{ color: "red" }}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${modalErrors.description ? styles.errorInput : ""}`}
                  style={{ minHeight: "80px" }}
                  value={tempData.description}
                  onChange={(e) => {
                    setTempData({ ...tempData, description: e.target.value });
                    setModalErrors((p) => ({ ...p, description: null }));
                  }}
                />
              </div>
              {modalType === "supportOptions" && (
                <>
                  <div className={styles.formGroup}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <label style={{ margin: 0 }}>
                        Icon Class (Font Awesome){" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <a
                        href="https://fontawesome.com/search?o=r&m=free"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "#FF7703",
                          textDecoration: "none",
                          fontWeight: "600",
                        }}
                      >
                        Browse Icons{" "}
                        <i
                          className="fas fa-external-link-alt"
                          style={{ fontSize: "10px", marginLeft: "4px" }}
                        ></i>
                      </a>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "45px",
                          height: "45px",
                          background: "#f8f9fa",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                          color: "#FF7703",
                          border: modalErrors.icon
                            ? "1px solid red"
                            : "1px solid #eee",
                          flexShrink: 0,
                        }}
                      >
                        <i className={tempData.icon || "fas fa-heart"}></i>
                      </div>
                      <input
                        type="text"
                        value={tempData.icon}
                        onChange={(e) => {
                          setTempData({ ...tempData, icon: e.target.value });
                          setModalErrors((p) => ({ ...p, icon: null }));
                        }}
                        className={modalErrors.icon ? styles.errorInput : ""}
                        placeholder="e.g. fas fa-heart"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      Button Text <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={tempData.buttonText}
                      onChange={(e) => {
                        setTempData({
                          ...tempData,
                          buttonText: e.target.value,
                        });
                        setModalErrors((p) => ({ ...p, buttonText: null }));
                      }}
                      className={
                        modalErrors.buttonText ? styles.errorInput : ""
                      }
                    />
                  </div>
                </>
              )}
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
                ) : (
                  "Save Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
