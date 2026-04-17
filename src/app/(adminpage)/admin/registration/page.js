"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "../admin.module.css";
import api from "@/lib/api";

const Toast = React.memo(({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
  return (
    <div className={`${styles.toast} ${type === "success" ? styles.toastSuccess : styles.toastError}`}>
      <i className={type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle"}></i>
      <div className={styles.toastContent}><p>{message}</p></div>
    </div>
  );
});
Toast.displayName = "Toast";

export default function RegistrationAdminPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pageData, setPageData] = useState({
    metaTitle: "", metaKeywords: "", metaDescription: "", isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/registration");
        if (res.success) setPageData(res.data);
      } catch (err) { addToast("Failed to load registration data", "error"); }
      finally { setLoading(false); }
    })();
  }, [addToast]);

  const putData = async (payload) => {
    const res = await api.put("/registration", payload);
    if (!res.success) throw new Error(res.message);
    return res.data;
  };

  const handleToggleStatus = async () => {
    const next = !pageData.isActive;
    setPageData(p => ({ ...p, isActive: next }));
    try { await putData({ isActive: next }); addToast(`Status: ${next ? "Active" : "Inactive"}`); }
    catch (err) { setPageData(p => ({ ...p, isActive: !next })); addToast(err.message, "error"); }
  };

  const handleSaveAll = async () => {
    const errors = {};
    if (!pageData.metaTitle?.trim()) errors.metaTitle = "Required";
    if (!pageData.metaKeywords?.trim()) errors.metaKeywords = "Required";
    if (!pageData.metaDescription?.trim()) errors.metaDescription = "Required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return addToast("Please fill all required fields", "error");
    }

    setSaving(true);
    try { 
      await putData(pageData); 
      setFormErrors({});
      addToast("Registration settings saved successfully!"); 
    }
    catch (err) { addToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  if (loading && !pageData.metaTitle) return <div className={styles.loadingContainer}><i className="fas fa-spinner fa-spin fa-2x"></i></div>;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.toastContainer}>{toasts.map(t => <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />)}</div>

      <div className={styles.contentHeader}>
        <h2>Registration Page Editor</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className={styles.toggleWrapper} onClick={handleToggleStatus} style={{ transform: 'scale(0.9)' }}>
            <span className={pageData.isActive ? styles.statusActive : styles.statusInactive}>{pageData.isActive ? "Active" : "Inactive"}</span>
            <div className={`${styles.toggleSwitch} ${pageData.isActive ? styles.toggleOn : ""}`}><div className={styles.toggleHandle} /></div>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className={styles.card} style={{ marginBottom: '30px' }}>
        <div className={styles.formSection}>
          <h4>SEO & Meta Details</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Meta Title <span style={{ color: 'red' }}>*</span></label>
              <input type="text" value={pageData.metaTitle} onChange={e => {setPageData({...pageData, metaTitle: e.target.value}); setFormErrors(p => ({...p, metaTitle: null}))}} className={formErrors.metaTitle ? styles.errorInput : ""} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Meta Keywords <span style={{ color: 'red' }}>*</span></label>
              <input type="text" value={pageData.metaKeywords} onChange={e => {setPageData({...pageData, metaKeywords: e.target.value}); setFormErrors(p => ({...p, metaKeywords: null}))}} className={formErrors.metaKeywords ? styles.errorInput : ""} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Meta Description <span style={{ color: 'red' }}>*</span></label>
              <textarea value={pageData.metaDescription} onChange={e => {setPageData({...pageData, metaDescription: e.target.value}); setFormErrors(p => ({...p, metaDescription: null}))}} className={`${styles.textarea} ${formErrors.metaDescription ? styles.errorInput : ""}`} style={{ minHeight: '80px' }} />
            </div>
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button className={styles.saveChangesBtn} onClick={handleSaveAll} disabled={saving}>{saving ? <i className="fas fa-spinner fa-spin" /> : "Save All Changes"}</button>
        </div>
      </div>
    </div>
  );
}
