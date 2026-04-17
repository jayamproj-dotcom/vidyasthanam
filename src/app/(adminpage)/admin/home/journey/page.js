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

export default function JourneyPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [journeyData, setJourneyData] = useState({
    title: "",
    desc: "",
    isActive: true
  });

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // ✅ Fetch journey data
  useEffect(() => {
    const fetchJourney = async () => {
      try {
        const res = await api.dynamic("/home/journey");
        if (res.success) {
          setJourneyData({
            ...res.data,
            isActive: res.data.isActive ?? true
          });
        }
      } catch (error) {
        addToast("Failed to load journey data", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchJourney();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJourneyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = async () => {
    const newStatus = !journeyData.isActive;
    setJourneyData((prev) => ({ ...prev, isActive: newStatus }));
    try {
      await api.patch("/home/journey", { ...journeyData, isActive: newStatus });
      addToast(`Visibility: ${newStatus ? "Active" : "Inactive"}`, "success");
    } catch (error) {
      setJourneyData((prev) => ({ ...prev, isActive: !newStatus }));
      addToast("Failed to update status", "error");
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!(journeyData.title || "").trim() || !(journeyData.desc || "").trim()) {
      addToast("Both heading and invitation message are required!", "error");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.patch("/home/journey", journeyData);
      if (res.success) {
        addToast("Journey section updated successfully!", "success");
      } else {
        addToast(res.error || "Failed to save changes", "error");
      }
    } catch (error) {
      addToast(error.message || "Failed to save changes", "error");
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
          <h2>Journey Section</h2>
          <div className={styles.toggleWrapper} onClick={handleToggleActive}>
            <span className={journeyData.isActive ? styles.statusActive : styles.statusInactive}>
              {journeyData.isActive ? "Active" : "Inactive"}
            </span>
            <div className={`${styles.toggleSwitch} ${journeyData.isActive ? styles.toggleOn : ""}`}>
              <div className={styles.toggleHandle}></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.formSection} style={{ borderBottom: 'none' }}>
          <h4>Journey Footer Branding</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Catchy Heading <span style={{color: 'red'}}>*</span></label>
              <div className={styles.inputWrapper}>
                <input type="text" name="title" value={journeyData.title || ""} onChange={handleChange} />
              </div>
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Invitation Message <span style={{color: 'red'}}>*</span></label>
              <textarea 
                className={styles.textarea} 
                style={{ minHeight: "150px" }}
                name="desc" 
                value={journeyData.desc || ""} 
                onChange={handleChange}
                placeholder="e.g. Discover the joy of learning with expert guidance..."
              />
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
              Saving Changes...
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
