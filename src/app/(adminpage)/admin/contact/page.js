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

export default function MasterContactEditor() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [contactData, setContactData] = useState({
    metaTitle: "", metaKeywords: "", metaDescription: "", isActive: true,
   title: "", description: "",
    phone1: "", phone1Note: "", phone2: "", phone2Note: "", email: "", googleMapUrl: ""
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
        const res = await api.dynamic("/contact");
        if (res.success && res.data) setContactData(res.data);
      } catch (err) { addToast("Failed to load contact data", "error"); }
      finally { setLoading(false); }
    })();
  }, [addToast]);

  const putData = async (payload) => {
    const res = await api.put("/contact", payload);
    if (!res.success) throw new Error(res.message);
    return res.data;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleToggleStatus = async () => {
    const next = !contactData.isActive;
    setContactData(p => ({ ...p, isActive: next }));
    try { await putData({ isActive: next }); addToast(`Status: ${next ? "Active" : "Inactive"}`); }
    catch (err) { setContactData(p => ({ ...p, isActive: !next })); addToast(err.message, "error"); }
  };

  const handleSaveSEO = async () => {
    const errors = {};
    if (!contactData.metaTitle?.trim()) errors.metaTitle = "Required";
    if (!contactData.metaKeywords?.trim()) errors.metaKeywords = "Required";
    if (!contactData.metaDescription?.trim()) errors.metaDescription = "Required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...errors }));
      return addToast("Please fill all required SEO fields", "error");
    }

    setSaving(true);
    try { 
      await putData({
        metaTitle: contactData.metaTitle.trim(),
        metaKeywords: contactData.metaKeywords.trim(),
        metaDescription: contactData.metaDescription.trim(),
      }); 
      addToast("SEO & Meta details saved successfully!"); 
    }
    catch (err) { addToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const handleSaveDetails = async () => {
    const errors = {};
    if (!contactData.title?.trim()) errors.title = "Title required";
    if (!contactData.phone1?.trim()) errors.phone1 = "Phone required";
    if (!contactData.email?.trim()) errors.email = "Email required";
    if (!contactData.googleMapUrl?.trim()) errors.googleMapUrl = "Google Map URL required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...errors }));
      return addToast("Please fill all required Contact Details fields", "error");
    }

    setSaving(true);
    try { 
      await putData({
        title: contactData.title.trim(),
        description: contactData.description?.trim() || "",
        phone1: contactData.phone1.trim(),
        phone1Note: contactData.phone1Note?.trim() || "",
        phone2: contactData.phone2?.trim() || "",
        phone2Note: contactData.phone2Note?.trim() || "",
        email: contactData.email.trim(),
        googleMapUrl: contactData.googleMapUrl.trim(),
      }); 
      addToast("Contact Details synced successfully!"); 
    }
    catch (err) { addToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  if (loading && !contactData.metaTitle) return <div className={styles.loadingContainer}><i className="fas fa-spinner fa-spin fa-2x"></i></div>;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.toastContainer}>{toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}</div>

      <div className={styles.contentHeader}>
        <h2>Contact Page Editor</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className={styles.toggleWrapper} onClick={handleToggleStatus} style={{ transform: 'scale(0.9)' }}>
            <span className={contactData.isActive ? styles.statusActive : styles.statusInactive}>{contactData.isActive ? "Active" : "Inactive"}</span>
            <div className={`${styles.toggleSwitch} ${contactData.isActive ? styles.toggleOn : ""}`}><div className={styles.toggleHandle} /></div>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <h4>SEO & Meta Details</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Meta Title <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="metaTitle" value={contactData.metaTitle} onChange={handleChange} className={formErrors.metaTitle ? styles.errorInput : ""} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Meta Keywords <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="metaKeywords" value={contactData.metaKeywords} onChange={handleChange} className={formErrors.metaKeywords ? styles.errorInput : ""} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Meta Description <span style={{ color: 'red' }}>*</span></label>
              <textarea name="metaDescription" value={contactData.metaDescription} onChange={handleChange} className={`${styles.textarea} ${formErrors.metaDescription ? styles.errorInput : ""}`} style={{ minHeight: "80px" }} />
            </div>
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={styles.saveChangesBtn}
            onClick={handleSaveSEO}
            disabled={saving}
          >
            {saving ? <i className="fas fa-spinner fa-spin" /> : "Save Meta Details"}
          </button>
        </div>
      </div>

      {/* Contact Info Card */}
      <div className={styles.card}>
        <div className={styles.formSection}>
          <h4>Contact Details & Text</h4>
          <div className={styles.grid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label>Section Title <span style={{ color: 'red' }}>*</span></label><input type="text" name="title" value={contactData.title} onChange={handleChange} className={formErrors.title ? styles.errorInput : ""} /></div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label>Sub-title / Description</label><textarea className={styles.textarea} style={{ minHeight: "80px" }} name="description" value={contactData.description} onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>Phone 1 (Call) <span style={{ color: 'red' }}>*</span></label><input type="text" name="phone1" value={contactData.phone1} onChange={handleChange} className={formErrors.phone1 ? styles.errorInput : ""} /></div>
              <div className={styles.formGroup}><label>Phone 1 Note</label><input type="text" name="phone1Note" value={contactData.phone1Note} onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>Phone 2 (WhatsApp)</label><input type="text" name="phone2" value={contactData.phone2} onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>Phone 2 Note</label><input type="text" name="phone2Note" value={contactData.phone2Note} onChange={handleChange} /></div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label>Official Email <span style={{ color: 'red' }}>*</span></label><input type="email" name="email" value={contactData.email} onChange={handleChange} className={formErrors.email ? styles.errorInput : ""} /></div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Google Map Embed URL <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  name="googleMapUrl" 
                  value={contactData.googleMapUrl || ""} 
                  onChange={handleChange} 
                  placeholder="https://www.google.com/maps/embed?pb=..." 
                  className={formErrors.googleMapUrl ? styles.errorInput : ""}
                />
                <small style={{ color: "#666", fontSize: "11px", marginTop: "4px", display: "block" }}>
                  Paste the "src" attribute value from your Google Maps iframe embed code.
                </small>
              </div>
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={styles.saveChangesBtn}
            onClick={handleSaveDetails}
            disabled={saving}
          >
            {saving ? <i className="fas fa-spinner fa-spin" /> : "Save Contact Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
