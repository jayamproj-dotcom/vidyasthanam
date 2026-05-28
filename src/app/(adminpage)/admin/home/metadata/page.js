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
    <div className={`${styles.toast} ${type === "success" ? styles.toastSuccess : styles.toastError}`}>
      <i className={type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle"}></i>
      <div className={styles.toastContent}>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default function HomeMetadataPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    keywords: "",
    isActive: true
  });

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.dynamic("/home/metadata");
        if (res.success) {
          setMetadata({
            ...res.data,
            isActive: res.data.isActive ?? true
          });
        }
      } catch (error) {
        addToast("Failed to load metadata", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchMetadata();
  }, []);

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "title":
        if (!value.trim()) {
          error = "Meta title is required";
        } 
        break;
        
      case "description":
        if (!value.trim()) {
          error = "Meta description is required";
        } 
        break;
        
      case "keywords":
        if (!value.trim()) {
          error = "Keywords are required";
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.title = validateField("title", metadata.title);
    newErrors.description = validateField("description", metadata.description);
    newErrors.keywords = validateField("keywords", metadata.keywords);
    
    setErrors(newErrors);
    
    // Return true if no errors
    return !Object.values(newErrors).some(error => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleToggleActive = async () => {
    const newStatus = !metadata.isActive;
    setMetadata((prev) => ({ ...prev, isActive: newStatus }));
    try {
      await api.patch("/home/metadata", { ...metadata, isActive: newStatus });
      addToast(`Home SEO Tags: ${newStatus ? "Active" : "Inactive"}`, "success");
    } catch (error) {
      setMetadata((prev) => ({ ...prev, isActive: !newStatus }));
      addToast("Failed to update status", "error");
    }
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      addToast("Please fix the validation errors before saving", "error");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await api.patch("/home/metadata", metadata);
      if (res.success) {
        addToast("Home Meta Data synced successfully!", "success");
      } else {
        addToast(res.error || "Failed to save data", "error");
      }
    } catch (error) {
      addToast(error.message || "Failed to save data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className={styles.loadingContainer}><i className="fas fa-spinner fa-spin fa-2x"></i></div>;

  return (
    <div>
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      <div className={styles.contentHeader}>
        <div className={styles.flexRow}>
          <h2>Home Metadata</h2>
          {/* <div className={styles.toggleWrapper} onClick={handleToggleActive}>
            <span className={metadata.isActive ? styles.statusActive : styles.statusInactive}>
              {metadata.isActive ? "Active" : "Inactive"}
            </span>
            <div className={`${styles.toggleSwitch} ${metadata.isActive ? styles.toggleOn : ""}`}>
              <div className={styles.toggleHandle}></div>
            </div>
          </div> */}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.formSection} style={{ borderBottom: 'none' }}>
          <h4>SEO & Meta Settings</h4>
          
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Title <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                type="text" 
                name="title" 
                value={metadata.title} 
                onChange={handleChange} 
                onBlur={handleBlur}
                placeholder="e.g. Vidyasthanam - School of Indian Music, Culture and Languages"
                className={errors.title ? styles.errorInput : ""}
              />
              {errors.title && (
                <div className={styles.errorMessage}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '5px' }}></i>
                  {errors.title}
                </div>
              )}
            </div>
            
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Meta Description <span style={{ color: "red" }}>*</span>
              </label>
              <textarea 
                className={`${styles.textarea} ${errors.description ? styles.errorInput : ""}`}
                name="description" 
                value={metadata.description} 
                onChange={handleChange} 
                onBlur={handleBlur}
                placeholder="Briefly describe your school and its offerings..."
                style={{ minHeight: '100px' }}
              />
              {errors.description && (
                <div className={styles.errorMessage}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '5px' }}></i>
                  {errors.description}
                </div>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Keywords (separated by commas) <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                type="text" 
                name="keywords" 
                value={metadata.keywords} 
                onChange={handleChange} 
                onBlur={handleBlur}
                placeholder="Music, Veena, Sanskrit, Tamil, Chennai, Montreal..."
                className={errors.keywords ? styles.errorInput : ""}
              />
              {errors.keywords && (
                <div className={styles.errorMessage}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '5px' }}></i>
                  {errors.keywords}
                </div>
              )}
              {metadata.keywords && !errors.keywords && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Keyword count: {metadata.keywords.split(",").filter(k => k.trim()).length} keywords
                </div>
              )}
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
                <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
                Saving Settings...
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