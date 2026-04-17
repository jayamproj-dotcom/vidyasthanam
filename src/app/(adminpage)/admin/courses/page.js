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

// ── Empty course template ──────────────────────────────────────────────────────
const EMPTY_COURSE = {
  name: "",
  number: "",
  fees: "",
  desc: "",
  icon: "fas fa-music",
  points: [""],
  paymentInfo: [""],
  isActive: true,
  order: 0,
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function MasterCoursesEditor() {
  const [toasts, setToasts]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving,  setSaving]        = useState(false);

  // Page-level data (meta + toggle)
  const [pageData, setPageData] = useState({
    metaTitle:       "",
    metaKeywords:    "",
    metaDescription: "",
    isActive:        true,
  });

  // Courses list
  const [courses, setCourses] = useState([]);

  // Validation States
  const [formErrors, setFormErrors] = useState({});
  const [modalErrors, setModalErrors] = useState({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex,   setEditIndex]   = useState(null);
  const [tempCourse,  setTempCourse]  = useState({ ...EMPTY_COURSE });

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
        const json = await api.get("/courses");
        if (!json.success) throw new Error(json.message);

        if (json.data) {
          const { metaTitle, metaKeywords, metaDescription, isActive, courses: c } =
            json.data;

          setPageData({ metaTitle, metaKeywords, metaDescription, isActive });
          setCourses(c || []);
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
    const json = await api.put("/courses", payload);
    if (!json.success) throw new Error(json.message);
    return json.data;
  };

  // ── Validation helpers ───────────────────────────────────────────────────────
  const validateSEO = () => {
    const errors = {};
    if (!pageData.metaTitle.trim()) errors.metaTitle = "Meta title is required";
    if (!pageData.metaKeywords.trim()) errors.metaKeywords = "Meta keywords are required";
    if (!pageData.metaDescription.trim()) errors.metaDescription = "Meta description is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateModal = () => {
    const errors = {};
    if (!tempCourse.name.trim()) errors.name = "Course name is required";
    if (!tempCourse.number.trim()) errors.number = "Course code is required";
    
    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Save SEO section ─────────────────────────────────────────────────────────
  const handleSaveSEO = async () => {
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
      addToast("Meta data saved successfully!", "success");
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
      // Revert on error
      setPageData((prev) => ({ ...prev, isActive: !next }));
      addToast(`Toggle failed: ${err.message}`, "error");
    }
  };

  // ── Save all courses ─────────────────────────────────────────────────────────
  const handleSaveAllCourses = async () => {
    setSaving(true);
    try {
      // Clean up empty strings before saving
      const cleanedCourses = courses.map(c => ({
        ...c,
        points: c.points.map(p => p.trim()).filter(p => p !== ""),
        paymentInfo: c.paymentInfo.map(i => i.trim()).filter(i => i !== ""),
      }));

      await putData({ courses: cleanedCourses });
      addToast("Courses saved successfully!", "success");
    } catch (err) {
      addToast(`Save failed: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const openModal = (index = null) => {
    setModalErrors({}); // Reset error states
    if (index !== null) {
      setEditIndex(index);
      // Deep-clone so edits don't mutate state directly
      setTempCourse({
        ...courses[index],
        points:      [...(courses[index].points      || [""])],
        paymentInfo: [...(courses[index].paymentInfo || [""])],
      });
    } else {
      setEditIndex(null);
      setTempCourse({ ...EMPTY_COURSE, points: [""], paymentInfo: [""] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSaveCourse = async () => {
    if (!validateModal()) {
      addToast("Please fill all required course fields", "error");
      return;
    }

    setSaving(true);
    try {
      const updated = [...courses];
      if (editIndex !== null) {
        updated[editIndex] = tempCourse;
      } else {
        updated.push({ ...tempCourse, order: courses.length });
      }

      // Clean up empty strings before saving
      const cleanedCourses = updated.map(c => ({
        ...c,
        points: c.points.map(p => p.trim()).filter(p => p !== ""),
        paymentInfo: c.paymentInfo.map(i => i.trim()).filter(i => i !== ""),
      }));

      await putData({ courses: cleanedCourses });
      setCourses(cleanedCourses);
      
      addToast(
        editIndex !== null ? "Course updated successfully!" : "Course added successfully!",
        "success"
      );
      closeModal();
    } catch (err) {
      addToast(`Failed to sync changes: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (index) => {
    const updated = courses.filter((_, i) => i !== index);

    setCourses(updated);
    try {
      await putData({ courses: updated });
      addToast("Course removed successfully!", "success");
    } catch (err) {
      setCourses(previousCourses);
      addToast(`Delete failed: ${err.message}`, "error");
    }
  };

  const toggleCourseStatus = async (index) => {
    const updated = [...courses];
    const nextStatus = !updated[index].isActive;
    updated[index].isActive = nextStatus;

    const previousCourses = [...courses];
    setCourses(updated);

    try {
      await putData({ courses: updated });
      addToast(`Course is now ${nextStatus ? "Active" : "Inactive"}`, "success");
    } catch (err) {
      setCourses(previousCourses);
      addToast(`Toggle failed: ${err.message}`, "error");
    }
  };

  // ── Dynamic list helpers inside modal ────────────────────────────────────────
  const updateListField = (field, index, value) => {
    const list = [...tempCourse[field]];
    list[index] = value;
    setTempCourse((prev) => ({ ...prev, [field]: list }));
  };

  const addListItem = (field) => {
    setTempCourse((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeListItem = (field, index) => {
    if (tempCourse[field].length <= 1) return;
    setTempCourse((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // ── Meta input change ─────────────────────────────────────────────────────────
  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setPageData((prev) => ({ ...prev, [name]: value }));
    // Clear error if user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );

  return (
    <div className={styles.coursesEditorContainer}>

      {/* ── Toasts ── */}
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* ── Header ── */}
      <div className={styles.contentHeader}>
        <h2>Master Courses Editor</h2>
        <div className={styles.toggleWrapper} onClick={handleTogglePageActive} style={{ cursor: "pointer" }}>
          <span className={pageData.isActive ? styles.statusActive : styles.statusInactive}>
            {pageData.isActive ? "Active" : "Inactive"}
          </span>
          <div className={`${styles.toggleSwitch} ${pageData.isActive ? styles.toggleOn : ""}`}>
            <div className={styles.toggleHandle} />
          </div>
        </div>
      </div>

      {/* ── 1. SEO Meta Section ── */}
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <h4>SEO &amp; Meta Settings</h4>
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
                className={formErrors.metaTitle ? styles.errorInput : ""}
                suppressHydrationWarning
              />
              {formErrors.metaTitle && <span className={styles.errorMessage}><i className="fas fa-exclamation-triangle" style={{marginRight: '5px'}} /> {formErrors.metaTitle}</span>}
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Keywords (separated by commas) <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="metaKeywords"
                value={pageData.metaKeywords}
                onChange={handleMetaChange}
                placeholder="Keyword1, Keyword2"
                className={formErrors.metaKeywords ? styles.errorInput : ""}
                suppressHydrationWarning
              />
              {formErrors.metaKeywords && <span className={styles.errorMessage}><i className="fas fa-exclamation-triangle" style={{marginRight: '5px'}} /> {formErrors.metaKeywords}</span>}
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Description <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                name="metaDescription"
                value={pageData.metaDescription}
                onChange={handleMetaChange}
                className={`${styles.textarea} ${formErrors.metaDescription ? styles.errorInput : ""}`}
                style={{ minHeight: "80px" }}
                suppressHydrationWarning
              />
              {formErrors.metaDescription && <span className={styles.errorMessage}><i className="fas fa-exclamation-triangle" style={{marginRight: '5px'}} /> {formErrors.metaDescription}</span>}
            </div>
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={styles.saveChangesBtn}
            onClick={handleSaveSEO}
            disabled={saving}
            suppressHydrationWarning
          >
            {saving ? <i className="fas fa-spinner fa-spin" /> : "Save Meta Data"}
          </button>
        </div>
      </div>

      {/* ── 2. Courses Table ── */}
      <div className={styles.card}>
        <div className={styles.formSection}>
          <div className={styles.listHeader}>
            <h3 className={styles.listTitle}>Active Courses List</h3>
            <button className={styles.uploadBtn} onClick={() => openModal()}>
              <i className="fas fa-plus"></i> Add New Course
            </button>
          </div>  

          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Course ID</th>
                <th>Course Title</th>
                <th>Fees</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#999", padding: "30px" }}>
                    No courses yet. Click "Add New Course" to get started.
                  </td>
                </tr>
              ) : (
                courses.map((course, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: "bold", color: "#67080E" }}>{course.number}</td>
                    <td>{course.name}</td>
                    <td>{course.fees}</td>
                    <td>
                      <div 
                        className={styles.toggleWrapper} 
                        onClick={() => toggleCourseStatus(index)}
                        style={{ transform: 'scale(0.85)', originX: 'left' }}
                      >
                        <span className={course.isActive ? styles.statusActive : styles.statusInactive}>
                          {course.isActive ? "Active" : "Inactive"}
                        </span>
                        <div className={`${styles.toggleSwitch} ${course.isActive ? styles.toggleOn : ""}`}>
                          <div className={styles.toggleHandle} />
                        </div>
                      </div>
                    </td>
                    <td style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button className={styles.editBtn} onClick={() => openModal(index)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => deleteCourse(index)}>
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

      {/* ── 3. Course Modal ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "800px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.modalHeader}>
              <h3>{editIndex !== null ? "Edit Course" : "Add New Course"}</h3>
              <button className={styles.closeBtn} onClick={closeModal}>
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Body */}
            <div className={styles.modalBody}>
              <div className={styles.grid}>

                {/* Course Name */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Course Name <span style={{ color: "red" }}>*</span></label>
                  <input
                    type="text"
                    value={tempCourse.name}
                    onChange={(e) => {
                      setTempCourse((p) => ({ ...p, name: e.target.value }));
                      if (modalErrors.name) setModalErrors(p => ({ ...p, name: null }));
                    }}
                    className={modalErrors.name ? styles.errorInput : ""}
                    placeholder="e.g. Online Carnatic Music Theory Workshop Level I"
                  />
                  {modalErrors.name && <span className={styles.errorMessage}><i className="fas fa-exclamation-triangle" style={{marginRight: '5px'}} /> {modalErrors.name}</span>}
                </div>

                {/* Course Number */}
                <div className={styles.formGroup}>
                  <label>Course Code / Number <span style={{ color: "red" }}>*</span></label>
                  <input
                    type="text"
                    value={tempCourse.number}
                    onChange={(e) => {
                      setTempCourse((p) => ({ ...p, number: e.target.value }));
                      if (modalErrors.number) setModalErrors(p => ({ ...p, number: null }));
                    }}
                    className={modalErrors.number ? styles.errorInput : ""}
                    placeholder="e.g. VS1426"
                  />
                  {modalErrors.number && <span className={styles.errorMessage}><i className="fas fa-exclamation-triangle" style={{marginRight: '5px'}} /> {modalErrors.number}</span>}
                </div>

                {/* Fees */}
                <div className={styles.formGroup}>
                  <label>Fees Structure</label>
                  <input
                    type="text"
                    value={tempCourse.fees}
                    onChange={(e) => setTempCourse((p) => ({ ...p, fees: e.target.value }))}
                    placeholder="e.g. $60 CAD / $70 USD"
                  />
                </div>

                {/* Icon */}
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>Icon Class (Font Awesome)</label>
                    <a 
                      href="https://fontawesome.com/search?o=r&m=free" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#FF7703', textDecoration: 'none', fontWeight: '600' }}
                    >
                      Browse Icons <i className="fas fa-external-link-alt" style={{ fontSize: '10px', marginLeft: '4px' }}></i>
                    </a>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '45px', 
                      height: '45px', 
                      background: '#f8f9fa', 
                      borderRadius: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '20px',
                      color: '#FF7703',
                      border: '1px solid #eee',
                      flexShrink: 0
                    }}>
                      <i className={tempCourse.icon || "fas fa-music"}></i>
                    </div>
                    <input
                      type="text"
                      value={tempCourse.icon}
                      onChange={(e) => setTempCourse((p) => ({ ...p, icon: e.target.value }))}
                      placeholder="e.g. fas fa-guitar"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Course Display Status</label>
                  <div 
                    className={styles.toggleWrapper} 
                    onClick={() => setTempCourse(prev => ({ ...prev, isActive: !prev.isActive }))}
                    style={{ marginTop: '8px' }}
                  >
                    <span className={tempCourse.isActive ? styles.statusActive : styles.statusInactive}>
                      {tempCourse.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className={`${styles.toggleSwitch} ${tempCourse.isActive ? styles.toggleOn : ""}`}>
                      <div className={styles.toggleHandle} />
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Short Description</label>
                  <textarea
                    className={styles.textarea}
                    style={{ minHeight: "70px" }}
                    value={tempCourse.desc}
                    onChange={(e) => setTempCourse((p) => ({ ...p, desc: e.target.value }))}
                    placeholder="Brief description of this course…"
                  />
                </div>

                {/* Course Features / Points */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <h4 className={styles.sectionHeader} style={{ fontSize: "14px", marginTop: "20px" }}>
                    Course Features &amp; Details
                  </h4>
                  {tempCourse.points.map((point, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => updateListField("points", idx, e.target.value)}
                        placeholder="e.g. Faculty: Ms. Bhargavi Hariharan"
                      />
                      <button
                        className={styles.deleteBtn}
                        onClick={() => removeListItem("points", idx)}
                        disabled={tempCourse.points.length === 1}
                      >
                        <i className="fas fa-minus" />
                      </button>
                    </div>
                  ))}
                  <button
                    className={styles.uploadBtn}
                    style={{ fontSize: "12px", padding: "5px 12px" }}
                    onClick={() => addListItem("points")}
                  >
                    + Add Detail Line
                  </button>
                </div>

                {/* Payment Info */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <h4 className={styles.sectionHeader} style={{ fontSize: "14px", marginTop: "20px" }}>
                    Payment Information
                  </h4>
                  {tempCourse.paymentInfo.map((info, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <textarea
                        className={styles.textarea}
                        style={{ minHeight: "60px" }}
                        value={info}
                        onChange={(e) => updateListField("paymentInfo", idx, e.target.value)}
                        placeholder="Payment method or instruction…"
                      />
                      <button
                        className={styles.deleteBtn}
                        style={{ height: "fit-content" }}
                        onClick={() => removeListItem("paymentInfo", idx)}
                        disabled={tempCourse.paymentInfo.length === 1}
                      >
                        <i className="fas fa-minus" />
                      </button>
                    </div>
                  ))}
                  <button
                    className={styles.uploadBtn}
                    style={{ fontSize: "12px", padding: "5px 12px" }}
                    onClick={() => addListItem("paymentInfo")}
                  >
                    + Add Payment Option
                  </button>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button
                className={styles.saveChangesBtn}
                style={{ width: "100%" }}
                onClick={handleSaveCourse}
                disabled={saving}
              >
                {saving ? (
                  <i className="fas fa-spinner fa-spin" />
                ) : (
                  editIndex !== null ? "Save Course Changes" : "Create New Course"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}