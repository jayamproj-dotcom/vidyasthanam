"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "../admin.module.css";
import api from "@/lib/api";

// ── Toast ──────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
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
          type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle"
        }
      />
      <div className={styles.toastContent}>
        <p>{message}</p>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function MasterPublicationsEditor() {
  const [toasts, setToasts]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving,  setSaving]        = useState(false);
  const [activeTab, setActiveTab]   = useState("publications"); // 'publications' or 'resources'

  // Page-level data
  const [pageData, setPageData] = useState({
    metaTitle:       "",
    metaKeywords:    "",
    metaDescription: "",
    isActive:        true,
  });

  // Data lists
  const [data, setData] = useState({
    publications: [],
    resources: [],
  });

  // Validation States
  const [formErrors, setFormErrors] = useState({});
  const [modalErrors, setModalErrors] = useState({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex,   setEditIndex]   = useState(null);
  const [tempDoc,     setTempDoc]     = useState({ name: "", path: "", isActive: true });

  // ── Toast helpers ────────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Fetch on mount ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const json = await api.get("/publications");
        if (!json.success) throw new Error(json.message);

        if (json.data) {
          const { metaTitle, metaKeywords, metaDescription, isActive, publications, resources } = json.data;
          setPageData({ metaTitle, metaKeywords, metaDescription, isActive });
          setData({ publications: publications || [], resources: resources || [] });
        }
      } catch (err) {
        addToast(`Failed to load data: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  // ── Generic PUT helper ───────────────────────────────────────────────────────
  const putData = async (payload) => {
    const json = await api.put("/publications", payload);
    if (!json.success) throw new Error(json.message);
    return json.data;
  };

  // ── Validation helpers ───────────────────────────────────────────────────────
  const validateSEO = () => {
    const errors = {};
    if (!pageData.metaTitle?.trim()) errors.metaTitle = "Meta title is required";
    if (!pageData.metaKeywords?.trim()) errors.metaKeywords = "Meta keywords are required";
    if (!pageData.metaDescription?.trim()) errors.metaDescription = "Meta description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateModal = () => {
    const errors = {};
    if (!tempDoc.name?.trim()) errors.name = "Document name is required";
    if (!tempDoc.path?.trim()) errors.path = "PDF path is required";
    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Save page settings ───────────────────────────────────────────────────────
  const handleSavePageSettings = async () => {
    if (!validateSEO()) {
      addToast("Please fix the errors in the SEO section", "error");
      return;
    }
    setSaving(true);
    try {
      await putData({
        metaTitle:       pageData.metaTitle.trim(),
        metaKeywords:    pageData.metaKeywords.trim(),
        metaDescription: pageData.metaDescription.trim(),
      });
      setFormErrors({}); // Clear validation errors on success
      addToast("Page settings saved successfully!", "success");
    } catch (err) {
      addToast(`Save failed: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePageActive = async () => {
    const next = !pageData.isActive;
    setPageData((prev) => ({ ...prev, isActive: next }));
    try {
      await putData({ isActive: next });
      addToast(`Page marked as ${next ? "Active" : "Inactive"}`, "success");
    } catch (err) {
      setPageData((prev) => ({ ...prev, isActive: !next }));
      addToast(`Toggle failed: ${err.message}`, "error");
    }
  };

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const openModal = (index = null) => {
    setModalErrors({});
    if (index !== null) {
      setEditIndex(index);
      setTempDoc({ ...data[activeTab][index] });
    } else {
      setEditIndex(null);
      setTempDoc({ name: "", path: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSaveDoc = async () => {
    if (!validateModal()) {
      addToast("Please fill all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const updatedList = [...data[activeTab]];
      if (editIndex !== null) {
        updatedList[editIndex] = tempDoc;
      } else {
        updatedList.push(tempDoc);
      }

      const updatedAllData = { ...data, [activeTab]: updatedList };

      await putData(updatedAllData);
      setData(updatedAllData);
      
      addToast(
        editIndex !== null ? "Document updated successfully!" : "Document added successfully!",
        "success"
      );
      closeModal();
    } catch (err) {
      addToast(`Failed to sync changes: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteDoc = async (index) => {
    const updatedList = data[activeTab].filter((_, i) => i !== index);
    const updatedAllData = { ...data, [activeTab]: updatedList };
    
    setLoading(true);
    try {
      await putData(updatedAllData);
      setData(updatedAllData);
      addToast("Document removed successfully!", "success");
    } catch (err) {
      addToast(`Delete failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleDocStatus = async (index) => {
    const updatedList = [...data[activeTab]];
    const nextStat = !updatedList[index].isActive;
    updatedList[index].isActive = nextStat;
    const updatedAllData = { ...data, [activeTab]: updatedList };

    setLoading(true);
    try {
      await putData(updatedAllData);
      setData(updatedAllData);
      addToast(`Document is now ${nextStat ? "Active" : "Inactive"}`, "success");
    } catch (err) {
      addToast(`Toggle failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setPageData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      addToast("Only PDF files are allowed", "error");
      return;
    }

    setSaving(true);
    try {
      const reader = new FileReader();
      const uploadPromise = new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = reader.result;
            const res = await api.post("/upload", {
              file: base64,
              fileName: file.name,
              type: 'pdf'
            });

            if (res.success) {
              setTempDoc(prev => ({ ...prev, path: res.path }));
              addToast("File uploaded successfully!", "success");
              resolve();
            } else {
              reject(new Error(res.message));
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("File reading failed"));
      });

      reader.readAsDataURL(file);
      await uploadPromise;
    } catch (err) {
      addToast(`Upload failed: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading && !data.publications.length && !pageData.metaTitle)
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );

  return (
    <div className={styles.adminContainer}>

      {/* ── Toasts ── */}
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* ── Header ── */}
      <div className={styles.contentHeader}>
        <h2>Publications & Resources Editor</h2>
        <div className={styles.toggleWrapper} onClick={handleTogglePageActive} style={{ cursor: "pointer" }}>
          <span className={pageData.isActive ? styles.statusActive : styles.statusInactive}>
            {pageData.isActive ? "Active" : "Inactive"}
          </span>
          <div className={`${styles.toggleSwitch} ${pageData.isActive ? styles.toggleOn : ""}`}>
            <div className={styles.toggleHandle} />
          </div>
        </div>
      </div>

      {/* ── 1. SEO Settings ── */}
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <h4>SEO Meta Settings</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Meta Title <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                name="metaTitle"
                value={pageData.metaTitle}
                onChange={handleTextChange}
                className={formErrors.metaTitle ? styles.errorInput : ""}
              />
              {formErrors.metaTitle && <span className={styles.errorMessage}>{formErrors.metaTitle}</span>}
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Meta Keywords <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                name="metaKeywords"
                value={pageData.metaKeywords}
                onChange={handleTextChange}
                className={formErrors.metaKeywords ? styles.errorInput : ""}
              />
              {formErrors.metaKeywords && <span className={styles.errorMessage}>{formErrors.metaKeywords}</span>}
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Meta Description <span style={{ color: "red" }}>*</span></label>
              <textarea
                name="metaDescription"
                value={pageData.metaDescription}
                onChange={handleTextChange}
                className={`${styles.textarea} ${formErrors.metaDescription ? styles.errorInput : ""}`}
                style={{ minHeight: "60px" }}
              />
              {formErrors.metaDescription && <span className={styles.errorMessage}>{formErrors.metaDescription}</span>}
            </div>
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button className={styles.saveChangesBtn} onClick={handleSavePageSettings} disabled={saving}>
            {saving ? <i className="fas fa-spinner fa-spin" /> : "Save Meta Data"}
          </button>
        </div>
      </div>

      {/* ── 2. Category Tabs ── */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap" }}>
        <button
          className={`${styles.categoryBtn} ${activeTab === "publications" ? styles.active : ""}`}
          onClick={() => setActiveTab("publications")}
          style={{ 
            padding: "10px 25px", 
            borderRadius: "8px", 
            background: activeTab === "publications" ? "#67080E" : "#f8f9fa",
            color: activeTab === "publications" ? "white" : "#555",
            fontWeight: "600",
            border: activeTab === "publications" ? "none" : "1px solid #ddd"
          }}
        >
          Publications List ({data.publications.length})
        </button>
        <button
          className={`${styles.categoryBtn} ${activeTab === "resources" ? styles.active : ""}`}
          onClick={() => setActiveTab("resources")}
          style={{ 
            padding: "10px 25px", 
            borderRadius: "8px", 
            background: activeTab === "resources" ? "#67080E" : "#f8f9fa",
            color: activeTab === "resources" ? "white" : "#555",
            fontWeight: "600",
            border: activeTab === "resources" ? "none" : "1px solid #ddd"
          }}
        >
          Resources List ({data.resources.length})
        </button>
      </div>

      {/* ── 3. Data Table ── */}
      <div className={styles.card}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>{activeTab === 'publications' ? "Current Publications" : "Current Resources"}</h3>
          <button className={styles.uploadBtn} onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Add New {activeTab === 'publications' ? "Publication" : "Resource"}
          </button>
        </div>

        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>PDF File Path</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ textAlign: "right", width: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data[activeTab].length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#999", padding: "30px" }}>
                    No items found in this category.
                  </td>
                </tr>
              ) : (
                data[activeTab].map((doc, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: "bold", color: "#333" }}>{doc.name}</td>
                    <td style={{ color: "#777", fontSize: '12px', wordBreak: 'break-all', maxWidth: '300px' }}>{doc.path}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={styles.toggleWrapper} onClick={() => toggleDocStatus(index)} style={{ transform: 'scale(0.85)', transformOrigin: 'left center', margin: 0 }}>
                          <span className={doc.isActive ? styles.statusActive : styles.statusInactive}>
                            {doc.isActive ? "Active" : "Inactive"}
                          </span>
                          <div className={`${styles.toggleSwitch} ${doc.isActive ? styles.toggleOn : ""}`}>
                            <div className={styles.toggleHandle} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                        {doc.path && (
                          <a 
                            href={doc.path} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.editBtn} 
                            style={{ 
                              background: 'transparent', 
                              color: '#FF7703', 
                              border: '1px solid #FF7703',
                              padding: '6px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Preview PDF"
                          >
                            <i className="fas fa-eye" />
                          </a>
                        )}
                        <button className={styles.editBtn} onClick={() => openModal(index)} title="Edit Document" style={{ padding: '6px 10px' }}>
                          <i className="fas fa-edit" />
                        </button>
                        <button className={styles.deleteBtn} onClick={() => deleteDoc(index)} title="Delete Document" style={{ padding: '6px 10px' }}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Modal ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} style={{ maxWidth: "650px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editIndex !== null ? "Edit Document" : "Add New Document"}</h3>
              <button className={styles.closeBtn} onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.grid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Document Display Name <span style={{ color: "red" }}>*</span></label>
                  <input
                    type="text"
                    value={tempDoc.name}
                    onChange={(e) => {
                       setTempDoc({ ...tempDoc, name: e.target.value });
                       if (modalErrors.name) setModalErrors(p => ({ ...p, name: null }));
                    }}
                    className={modalErrors.name ? styles.errorInput : ""}
                    placeholder="e.g. Back to Roots"
                  />
                  {modalErrors.name && <span className={styles.errorMessage}>{modalErrors.name}</span>}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>PDF Document <span style={{ color: "red" }}>*</span></label>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div className={styles.fileInputWrapper} style={{ flexShrink: 0 }}>
                      <button className={styles.uploadBtn} type="button">
                        <i className="fas fa-file-pdf"></i> Upload PDF
                      </button>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileUpload}
                        disabled={saving}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={tempDoc.path}
                        readOnly
                        placeholder="Path will appear after upload..."
                        className={modalErrors.path ? styles.errorInput : ""}
                        style={{ background: '#f8f9fa', cursor: 'default' }}
                      />
                    </div>
                  </div>
                  {modalErrors.path && <span className={styles.errorMessage}>{modalErrors.path}</span>}
                  <p style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
                    Current path: <span style={{ fontFamily: 'monospace' }}>{tempDoc.path || "None selected"}</span>
                  </p>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Display Status</label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div 
                      className={styles.toggleWrapper} 
                      onClick={() => setTempDoc(prev => ({ ...prev, isActive: !prev.isActive }))}
                    >
                      <span className={tempDoc.isActive ? styles.statusActive : styles.statusInactive}>
                        {tempDoc.isActive ? "Active" : "Inactive"}
                      </span>
                      <div className={`${styles.toggleSwitch} ${tempDoc.isActive ? styles.toggleOn : ""}`}>
                        <div className={styles.toggleHandle} />
                      </div>
                    </div>
                    
                    {tempDoc.path && (
                      <a 
                        href={tempDoc.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.uploadBtn}
                        style={{ 
                          height: '38px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          background: 'white',
                          color: '#FF7703',
                          border: '1.5px solid #FF7703',
                          padding: '0 20px',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}
                      >
                        <i className="fas fa-external-link-alt" style={{ marginRight: '8px' }}></i> Preview Document
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.saveChangesBtn} style={{ width: "100%" }} onClick={handleSaveDoc} disabled={saving}>
                {saving ? (
                  <i className="fas fa-spinner fa-spin" />
                ) : (
                  editIndex !== null ? "Update Document" : "Save Document"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
