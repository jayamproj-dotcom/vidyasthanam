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

const defaultSocial = [
  { platform: "Facebook", link: "", isActive: true, icon: "fab fa-facebook" },
  { platform: "YouTube", link: "", isActive: true, icon: "fab fa-youtube" },
  { platform: "WhatsApp", link: "https://wa.me/919962194779", isActive: true, icon: "fab fa-whatsapp" },
  { platform: "Instagram", link: "", isActive: true, icon: "fab fa-instagram" },
  { platform: "Twitter", link: "", isActive: true, icon: "fab fa-twitter" },
  { platform: "LinkedIn", link: "", isActive: true, icon: "fab fa-linkedin" }
];

export default function MasterSettingsPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [editSmtp, setEditSmtp] = useState(false);

  const [settings, setSettings] = useState({
    smtp: { host: "", port: "", user: "", pass: "", fromEmail: "", senderName: "", encryption: "tls", toEmail: "" },
    socialMedia: defaultSocial
  });

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.dynamic("/settings");
        if (res.success && res.data) {
          const fetchedData = res.data;
          // Merge fetched social media with default icons/structure
          const mergedSocial = defaultSocial.map(def => {
            const found = (fetchedData.socialMedia || []).find(s => s.platform.toLowerCase() === def.platform.toLowerCase());
            return found ? { ...def, link: found.link, isActive: found.isActive ?? true } : def;
          });
          setSettings({
            smtp: {
              host: fetchedData.smtp?.host || "",
              port: fetchedData.smtp?.port || "",
              user: fetchedData.smtp?.user || "",
              pass: fetchedData.smtp?.pass || "",
              senderName: fetchedData.smtp?.senderName || "",
              fromEmail: fetchedData.smtp?.fromEmail || "",
              encryption: fetchedData.smtp?.encryption || "tls",
              toEmail: fetchedData.smtp?.toEmail || ""
            },
            socialMedia: mergedSocial
          });
        }
      } catch (err) {
        addToast("Failed to load settings data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [addToast]);

const handleSmtpChange = (e) => {
  const { name, value } = e.target;

  setSettings(prev => ({
    ...prev,
    smtp: {
      ...prev.smtp,
      [name]: value
    }
  }));
};

  const handleSocialLinkChange = (index, value) => {
    setSettings(prev => {
      const nextSocial = [...prev.socialMedia];
      nextSocial[index] = { ...nextSocial[index], link: value };
      return { ...prev, socialMedia: nextSocial };
    });
  };

  const handleSocialToggle = (index) => {
    setSettings(prev => {
      const nextSocial = [...prev.socialMedia];
      nextSocial[index] = { ...nextSocial[index], isActive: !nextSocial[index].isActive };
      return { ...prev, socialMedia: nextSocial };
    });
  };

  const handleSaveSmtp = async () => {
    const { host, port, user, pass, senderName, fromEmail } = settings.smtp;
    if (editSmtp) {
      if (!host?.trim() || !port?.trim() || !user?.trim() || !pass?.trim() || !senderName?.trim() || !fromEmail?.trim()) {
        addToast("All SMTP fields are required to update mail server parameters.", "error");
        return;
      }
    }

    setSavingSmtp(true);
    try {
      const res = await api.put("/settings", { smtp: settings.smtp });
      if (res.success) {
        addToast("SMTP configuration saved successfully!");
        setEditSmtp(false);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      addToast(err.message || "Failed to save SMTP setup", "error");
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSaveSocial = async () => {
    // If WhatsApp only provided number, format to https://wa.me/number
    const formattedSocial = settings.socialMedia.map(item => {
      if (item.platform.toLowerCase() === "whatsapp" && item.link.trim()) {
        let val = item.link.trim();
        if (!val.startsWith("http://") && !val.startsWith("https://")) {
          const digits = val.replace(/[^0-9]/g, "");
          val = `https://wa.me/${digits || val}`;
        }
        return { ...item, link: val };
      }
      return item;
    });

    setSavingSocial(true);
    try {
      const res = await api.put("/settings", { socialMedia: formattedSocial });
      if (res.success) {
        setSettings(prev => ({ ...prev, socialMedia: formattedSocial }));
        addToast("Social media channels saved successfully!");
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      addToast(err.message || "Failed to save social media settings", "error");
    } finally {
      setSavingSocial(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      <div className={styles.contentHeader}>
        <h2>Platform Configuration</h2>
      </div>

      {/* ── 1. SMTP Setup Card ── */}
      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <h4 style={{ margin: 0 }}>SMTP Mail Server Settings</h4>
              <p style={{ fontSize: "13px", color: "#666", margin: "5px 0 0 0" }}>
                Configure server gateway parameters for outgoing notifications and contact dispatches.
              </p>
            </div>
            {/* <div
              className={styles.toggleWrapper}
              onClick={() => setEditSmtp(!editSmtp)}
              style={{ transform: "scale(0.85)", margin: 0 }}
            >
              <span className={editSmtp ? styles.statusActive : styles.statusInactive}>
                {editSmtp ? "Edit Mode" : "Read Only"}
              </span>
              <div className={`${styles.toggleSwitch} ${editSmtp ? styles.toggleOn : ""}`}>
                <div className={styles.toggleHandle} />
              </div>
            </div> */}
          </div>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>SMTP Hostname <span style={{ color: "#dc3545" }}>*</span></label>
              <input
                type="text"
                name="host"
                value={settings.smtp.host}
                onChange={handleSmtpChange}
                placeholder="smtp.gmail.com / mail.example.com"
                required={editSmtp}
                disabled={!editSmtp}
              />
            </div>
            <div className={styles.formGroup}>
              <label>SMTP Port <span style={{ color: "#dc3545" }}>*</span></label>
              <input
                type="text"
                name="port"
                value={settings.smtp.port}
                onChange={handleSmtpChange}
                placeholder="465 / 587"
                required={editSmtp}
                disabled={!editSmtp}
              />
            </div>
            <div className={styles.formGroup}>
              <label>SMTP Username <span style={{ color: "#dc3545" }}>*</span></label>
              <input
                type="text"
                name="user"
                value={settings.smtp.user}
                onChange={handleSmtpChange}
                placeholder="user@example.com"
                required={editSmtp}
                disabled={!editSmtp}
              />
            </div>
            <div className={styles.formGroup}>
              <label>SMTP Password <span style={{ color: "#dc3545" }}>*</span></label>
              <input
                type="password"
                name="pass"
                value={settings.smtp.pass}
                onChange={handleSmtpChange}
                placeholder="••••••••••••"
                required={editSmtp}
                disabled={!editSmtp}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Sender Name <span style={{ color: "#dc3545" }}>*</span></label>
              <input
                type="text"
                name="senderName"
                value={settings.smtp.senderName || ""}
                onChange={handleSmtpChange}
                placeholder="Vidyasthanam Portal"
                required={editSmtp}
                disabled={!editSmtp}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Sender Identity (From Email) <span style={{ color: "#dc3545" }}>*</span></label>
              <input
                type="email"
                name="fromEmail"
                value={settings.smtp.fromEmail}
                onChange={handleSmtpChange}
                placeholder="noreply@example.com"
                required={editSmtp}
                disabled={!editSmtp}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Encryption Protocol <span style={{ color: "#dc3545" }}>*</span></label>
              <select
                name="encryption"
                value={settings.smtp.encryption || "tls"}
                onChange={handleSmtpChange}
                required={editSmtp}
                disabled={!editSmtp}
              >
                <option value="ssl">SSL</option>
                <option value="tls">TLS</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Recipient Identity (To Email)</label>
              <input
                type="email"
                name="toEmail"
                value={settings.smtp.toEmail || ""}
                onChange={handleSmtpChange}
                placeholder="info@example.com"
              />
            </div>
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={styles.saveChangesBtn}
            onClick={handleSaveSmtp}
            disabled={savingSmtp}
          >
            {savingSmtp ? <i className="fas fa-spinner fa-spin" /> : "Save SMTP Settings"}
          </button>
        </div>
      </div>

      {/* ── 2. Social Media Settings Card ── */}
      <div className={styles.card}>
        <div className={styles.formSection}>
          <h4>Social Media Accounts & Connect</h4>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
            Manage direct profile routing links displayed globally across footer networks. Enter pure numbers for WhatsApp to auto-construct secure direct-chat URLs.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {settings.socialMedia.map((social, index) => (
              <div
                key={social.platform}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  padding: "15px",
                  background: "#fdfdfd",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  flexWrap: "wrap"
                }}
              >
                <div style={{ width: "130px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <i className={social.icon || "fas fa-link"} style={{ fontSize: "18px", color: "#0d6efd", width: "24px" }}></i>
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>{social.platform}</span>
                </div>

                <div style={{ flex: "1", minWidth: "250px" }}>
                  <input
                    type="text"
                    value={social.link}
                    onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                    placeholder={
                      social.platform.toLowerCase() === "whatsapp"
                        ? "e.g. 919962194779 or full https://wa.me/..."
                        : `https://www.${social.platform.toLowerCase()}.com/yourprofile`
                    }
                    style={{
                      width: "95%",
                      padding: "8px 12px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      fontSize: "13px"
                    }}
                  />
                  {social.platform.toLowerCase() === "whatsapp" && (
                    <small style={{ color: "#888", fontSize: "11px", display: "block", marginTop: "4px" }}>
                      Auto-formats simple phone numbers to standard HTTPS format on update.
                    </small>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100px", justifyContent: "flex-end" }}>
                  <div
                    className={styles.toggleWrapper}
                    onClick={() => handleSocialToggle(index)}
                    style={{ transform: "scale(0.85)", margin: 0 }}
                  >
                    <span className={social.isActive ? styles.statusActive : styles.statusInactive}>
                      {social.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className={`${styles.toggleSwitch} ${social.isActive ? styles.toggleOn : ""}`}>
                      <div className={styles.toggleHandle} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={styles.saveChangesBtn}
            onClick={handleSaveSocial}
            disabled={savingSocial}
          >
            {savingSocial ? <i className="fas fa-spinner fa-spin" /> : "Save Social Media Links"}
          </button>
        </div>
      </div>
    </div>
  );
}
