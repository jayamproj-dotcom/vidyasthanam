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

// ── Empty event template ───────────────────────────────────────────────────────
const EMPTY_EVENT = {
  dateLabel: "",
  videos: [{ title: "", url: "" }],
  isActive: true,
  order: 0,
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function MasterEventsEditor() {
  const [toasts, setToasts]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving,  setSaving]        = useState(false);

  // Page-level data (meta + banner)
  const [pageData, setPageData] = useState({
    metaTitle:       "",
    metaKeywords:    "",
    metaDescription: "",
    isActive:        true,
  });

  // Events list
  const [events, setEvents] = useState([]);

  // Validation States
  const [formErrors, setFormErrors] = useState({});
  const [modalErrors, setModalErrors] = useState({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex,   setEditIndex]   = useState(null);
  const [tempEvent,   setTempEvent]   = useState({ ...EMPTY_EVENT });

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
        const json = await api.get("/events");
        if (!json.success) throw new Error(json.message);

        const { metaTitle, metaKeywords, metaDescription, bannerImage, isActive, events: e } =
          json.data;

        setPageData({ metaTitle, metaKeywords, metaDescription, bannerImage, isActive });
        setEvents(e || []);
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
    const json = await api.put("/events", payload);
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
    if (!tempEvent.dateLabel?.trim()) errors.dateLabel = "Event date/label is required";
    
    // Validate videos
    const videoErrors = [];
    tempEvent.videos.forEach((video, idx) => {
      if (!video.title?.trim() || !video.url?.trim()) {
        videoErrors[idx] = "Title and URL are required";
      }
    });

    if (videoErrors.length > 0) errors.videos = videoErrors;
    
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
      setFormErrors({}); // Clear highlights on success
      addToast("Page settings saved successfully!", "success");
    } catch (err) {
      addToast(`Save failed: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle page active ───────────────────────────────────────────────────────
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
      setTempEvent({
        ...events[index],
        videos: [...events[index].videos.map(v => ({ ...v }))],
      });
    } else {
      setEditIndex(null);
      setTempEvent({ ...EMPTY_EVENT, videos: [{ title: "", url: "" }] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSaveEvent = async () => {
    if (!validateModal()) {
      addToast("Please fill all required event fields", "error");
      return;
    }

    setSaving(true);
    try {
      const updated = [...events];
      if (editIndex !== null) {
        updated[editIndex] = tempEvent;
      } else {
        updated.push({ ...tempEvent, order: events.length });
      }

      // Clean up empty lines
      const cleanedEvents = updated.map(e => ({
        ...e,
        videos: e.videos.filter(v => v.title?.trim() && v.url?.trim()),
      }));

      await putData({ events: cleanedEvents });
      setEvents(cleanedEvents);
      
      addToast(
        editIndex !== null ? "Event group updated successfully!" : "Event group added successfully!",
        "success"
      );
      closeModal();
    } catch (err) {
      addToast(`Failed to sync changes: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (index) => {
    const updated = events.filter((_, i) => i !== index);
    setLoading(true);
    try {
      await putData({ events: updated });
      setEvents(updated);
      addToast("Event group removed successfully!", "success");
    } catch (err) {
      addToast(`Delete failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleEventStatus = async (index) => {
    const updated = [...events];
    const nextStatus = !updated[index].isActive;
    updated[index].isActive = nextStatus;

    setLoading(true);
    try {
      await putData({ events: updated });
      setEvents(updated);
      addToast(`Event is now ${nextStatus ? "Active" : "Inactive"}`, "success");
    } catch (err) {
      addToast(`Toggle failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Video field helpers inside modal ─────────────────────────────────────────
  const addVideoRow = () => {
    setTempEvent((prev) => ({
      ...prev,
      videos: [...prev.videos, { title: "", url: "" }],
    }));
  };

  const removeVideoRow = (vIdx) => {
    if (tempEvent.videos.length <= 1) return;
    setTempEvent((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== vIdx),
    }));
  };

  const updateVideoField = (vIdx, field, value) => {
    const updatedVideos = [...tempEvent.videos];
    updatedVideos[vIdx][field] = value;
    setTempEvent((prev) => ({ ...prev, videos: updatedVideos }));
    if (modalErrors.videos?.[vIdx]) {
        setModalErrors(prev => ({ ...prev, videos: null }));
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setPageData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading && !events.length && !pageData.metaTitle)
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
        <h2>Master Events & Recordings Editor</h2>
        <div className={styles.toggleWrapper} onClick={handleTogglePageActive} style={{ cursor: "pointer" }}>
          <span className={pageData.isActive ? styles.statusActive : styles.statusInactive}>
            {pageData.isActive ? "Active" : "Inactive"}
          </span>
          <div className={`${styles.toggleSwitch} ${pageData.isActive ? styles.toggleOn : ""}`}>
            <div className={styles.toggleHandle} />
          </div>
        </div>
      </div>

      {/* ── 1. SEO & Banner ── */}
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <h4>SEO &amp; Page Banner Settings</h4>
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
            {saving ? <i className="fas fa-spinner fa-spin" /> : "Save Meta Settings"}
          </button>
        </div>
      </div>

      {/* ── 2. Events List ── */}
      <div className={styles.card}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Event Audio/Video Recordings</h3>
          <button className={styles.uploadBtn} onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Add New Event Group
          </button>
        </div>

        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Event Date/Label</th>
                <th>Videos Count</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#999", padding: "30px" }}>
                    No events yet. Click "Add New Event Group" to get started.
                  </td>
                </tr>
              ) : (
                events.map((event, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: "bold", color: "#67080E" }}>
                      <i className="fas fa-calendar-alt" style={{ marginRight: '8px', opacity: 0.6 }} />
                      {event.dateLabel}
                    </td>
                    <td>{event.videos?.length || 0} Recordings</td>
                    <td>
                      <div className={styles.toggleWrapper} onClick={() => toggleEventStatus(index)} style={{ transform: 'scale(0.85)', originX: 'left' }}>
                        <span className={event.isActive ? styles.statusActive : styles.statusInactive}>
                          {event.isActive ? "Active" : "Inactive"}
                        </span>
                        <div className={`${styles.toggleSwitch} ${event.isActive ? styles.toggleOn : ""}`}>
                          <div className={styles.toggleHandle} />
                        </div>
                      </div>
                    </td>
                    <td style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button className={styles.editBtn} onClick={() => openModal(index)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => deleteEvent(index)}>
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Event Modal ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} style={{ maxWidth: "850px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editIndex !== null ? "Edit Event Recordings" : "New Event Group"}</h3>
              <button className={styles.closeBtn} onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.grid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Event Date / Label <span style={{ color: "red" }}>*</span></label>
                  <input
                    type="text"
                    value={tempEvent.dateLabel}
                    onChange={(e) => {
                       setTempEvent({ ...tempEvent, dateLabel: e.target.value });
                       if (modalErrors.dateLabel) setModalErrors(p => ({ ...p, dateLabel: null }));
                    }}
                    className={modalErrors.dateLabel ? styles.errorInput : ""}
                    placeholder="e.g. 19 Feb 2026 or Annual Day 2026"
                  />
                  {modalErrors.dateLabel && <span className={styles.errorMessage}>{modalErrors.dateLabel}</span>}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Display Status</label>
                  <div 
                    className={styles.toggleWrapper} 
                    onClick={() => setTempEvent(prev => ({ ...prev, isActive: !prev.isActive }))}
                    style={{ marginTop: '8px' }}
                  >
                    <span className={tempEvent.isActive ? styles.statusActive : styles.statusInactive}>
                      {tempEvent.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className={`${styles.toggleSwitch} ${tempEvent.isActive ? styles.toggleOn : ""}`}>
                      <div className={styles.toggleHandle} />
                    </div>
                  </div>
                </div>
              </div>

              <h4 className={styles.sectionHeader} style={{ fontSize: "16px", marginTop: '20px' }}>Videos & Iframe URLs</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
                {tempEvent.videos.map((video, vIdx) => (
                  <div key={vIdx} style={{ padding: "15px", background: "#f9f9f9", borderRadius: "12px", border: "1px solid #eee", position: "relative" }}>
                    <button 
                       className={styles.deleteBtn} 
                       style={{ position: "absolute", top: "10px", right: "10px", width: '30px', height: '30px', padding: 0 }}
                       onClick={() => removeVideoRow(vIdx)}
                       disabled={tempEvent.videos.length === 1}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                    
                    <div className={styles.grid}>
                       <div className={styles.formGroup}>
                          <label style={{ fontSize: "12px" }}>Video Title</label>
                          <input
                            type="text"
                            value={video.title}
                            onChange={(e) => updateVideoField(vIdx, "title", e.target.value)}
                            className={modalErrors.videos?.[vIdx] ? styles.errorInput : ""}
                            placeholder="e.g. Aparna Sainath Performance"
                          />
                       </div>
                       <div className={styles.formGroup}>
                          <label style={{ fontSize: "12px" }}>YouTube Embed URL</label>
                          <input
                            type="text"
                            value={video.url}
                            onChange={(e) => updateVideoField(vIdx, "url", e.target.value)}
                            className={modalErrors.videos?.[vIdx] ? styles.errorInput : ""}
                            placeholder="https://www.youtube.com/embed/..."
                          />
                       </div>
                    </div>
                    {modalErrors.videos?.[vIdx] && <span className={styles.errorMessage} style={{ marginTop: '5px', display: 'block' }}>{modalErrors.videos[vIdx]}</span>}
                  </div>
                ))}
              </div>

              <button className={styles.uploadBtn} style={{ marginTop: "20px", width: "100%", justifyContent: "center" }} onClick={addVideoRow}>
                <i className="fas fa-plus"></i> Add Another Video to this Event
              </button>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.saveChangesBtn} style={{ width: "100%" }} onClick={handleSaveEvent} disabled={saving}>
                {saving ? (
                  <i className="fas fa-spinner fa-spin" />
                ) : (
                  editIndex !== null ? "Update Event Group" : "Create Event Group"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
