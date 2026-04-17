"use client";

import React, { useState, useEffect } from "react";
import styles from "../../admin.module.css";
import api from "@/lib/api";

// Reusable Toast Component
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

export default function EventsPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [eventData, setEventData] = useState({
    title: "",
    desc: "",
    videos: [],
    isActive: true
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [tempVideo, setTempVideo] = useState({
    link: "",
    date: { day: "", month: "" },
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

  // ✅ Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.dynamic("/home/events");
        if (res.success) {
          setEventData({
            ...res.data,
            title: res.data.title || "",
            desc: res.data.desc || "",
            isActive: res.data.isActive ?? true,
            videos: res.data.videos || []
          });
        }
      } catch (error) {
        addToast("Failed to load events", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchEvents();
  }, []);

  const handleGlobalChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = async () => {
    const newStatus = !eventData.isActive;
    setEventData((prev) => ({ ...prev, isActive: newStatus }));
    try {
      await api.patch("/home/events", { ...eventData, isActive: newStatus });
      addToast(`Visibility: ${newStatus ? "Active" : "Inactive"}`, "success");
    } catch (error) {
      setEventData((prev) => ({ ...prev, isActive: !newStatus }));
      addToast("Failed to update status", "error");
    }
  };

  const toggleVideoStatus = async (index) => {
    const updatedVideos = [...eventData.videos];
    updatedVideos[index].isActive = !updatedVideos[index].isActive;
    const updatedData = { ...eventData, videos: updatedVideos };

    setLoading(true);
    try {
      const res = await api.patch("/home/events", updatedData);
      if (res.success) {
        setEventData({
          ...eventData,
          videos: updatedVideos
        });
        addToast(`Video status: ${updatedVideos[index].isActive ? "Active" : "Inactive"}`, "success");
      }
    } catch (error) {
      addToast("Failed to update status", "error");
    } finally {
      setLoading(false);
    }
  };

  // Modal Functions
  const openModal = (index = null) => {
    if (index !== null) {
      setEditIndex(index);
      setTempVideo({ 
        ...eventData.videos[index], 
        date: { ...eventData.videos[index].date },
        isActive: eventData.videos[index].isActive ?? true
      });
    } else {
      setEditIndex(null);
      setTempVideo({ 
        link: "", 
        date: { day: "", month: "" }, 
        desc: "",
        isActive: true 
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!tempVideo.link.trim()) {
      addToast("YouTube Link is required", "error");
      return;
    }
    if (!tempVideo.date.day.trim() || !tempVideo.date.month.trim()) {
      addToast("Event date is required", "error");
      return;
    }

    const updatedVideos = [...eventData.videos];
    if (editIndex !== null) {
      updatedVideos[editIndex] = tempVideo;
    } else {
      updatedVideos.push(tempVideo);
    }

    const updatedData = { ...eventData, videos: updatedVideos };
    
    setLoading(true);
    try {
      const res = await api.patch("/home/events", updatedData);
      if (res.success) {
        setEventData(updatedData);
        setIsModalOpen(false);
        addToast(editIndex !== null ? "Event highlight updated!" : "New event added!", "success");
      } else {
        addToast(res.error || "Failed to save to database", "error");
      }
    } catch (error) {
      addToast(error.message || "Failed to save to database", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (index) => {
      const updatedVideos = eventData.videos.filter((_, i) => i !== index);
      const updatedData = { ...eventData, videos: updatedVideos };
      
      setLoading(true);
      try {
        const res = await api.patch("/home/events", updatedData);
        if (res.success) {
          setEventData(updatedData);
          addToast("Event highlight removed", "success");
        }
      } catch (error) {
        addToast("Failed to remove event", "error");
      } finally {
        setLoading(false);
      }
  };

  const handleFinalSave = async () => {
    if (!(eventData.title || "").trim() || !(eventData.desc || "").trim()) {
       addToast("Section Title and Description are required", "error");
       return;
    }

    setLoading(true);
    try {
      const res = await api.patch("/home/events", eventData);
      if (res.success) addToast("Section settings synced successfully!", "success");
    } catch (error) {
      addToast("Failed to save changes", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className={styles.loadingContainer}><i className="fas fa-spinner fa-spin fa-2x"></i></div>;

  return (
    <div>
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className={styles.contentHeader}>
        <div className={styles.flexRow}>
          <h2>Events Section</h2>
          <div className={styles.toggleWrapper} onClick={handleToggleActive}>
            <span
              className={
                eventData.isActive ? styles.statusActive : styles.statusInactive
              }
            >
              {eventData.isActive ? "Active" : "Inactive"}
            </span>
            <div
              className={`${styles.toggleSwitch} ${eventData.isActive ? styles.toggleOn : ""}`}
            >
              <div className={styles.toggleHandle}></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <h4>Header Settings</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Section Title <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                name="title"
                value={eventData.title || ""}
                onChange={handleGlobalChange}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Intro Description <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                name="desc"
                value={eventData.desc || ""}
                onChange={handleGlobalChange}
              />
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
                <i className="fas fa-spinner fa-spin me-2"></i> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>YouTube Highlights</h3>
          <button className={styles.uploadBtn} onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Add Video Highlight
          </button>
        </div>
        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th style={{ width: "100px" }}>Date</th>
                <th>Description / Caption</th>
                <th style={{ width: "220px" }}>Video Link</th>
                <th style={{ width: "100px" }}>Status</th>
                <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {eventData.videos.map((v, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: "700", color: "#666" }}>
                      {v.date.day} {v.date.month}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#333",
                        fontWeight: "500",
                      }}
                    >
                      {v.desc.substring(0, 100)}...
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#FF7703",
                        wordBreak: "break-all",
                      }}
                    >
                      {v.link}
                    </div>
                  </td>
                  <td>
                    <div
                      className={styles.toggleWrapper}
                      onClick={() => toggleVideoStatus(i)}
                      style={{ transform: "scale(0.8)", cursor: "pointer", display: "inline-flex" }}
                    >
                      <span className={v.isActive !== false ? styles.statusActive : styles.statusInactive}>
                        {v.isActive !== false ? "Active" : "Inactive"}
                      </span>
                      <div className={`${styles.toggleSwitch} ${v.isActive !== false ? styles.toggleOn : ""}`}>
                        <div className={styles.toggleHandle}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionContainer}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openModal(i)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteVideo(i)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Pop-up */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            style={{ maxWidth: "700px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                {editIndex !== null
                  ? "Edit Video Highlight"
                  : "New Video Highlight"}
              </h3>
              <button
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.grid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>YouTube Embed Link</label>
                  <input
                    type="text"
                    value={tempVideo.link}
                    onChange={(e) =>
                      setTempVideo({ ...tempVideo, link: e.target.value })
                    }
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Event Day</label>
                  <input
                    type="text"
                    value={tempVideo.date.day}
                    onChange={(e) =>
                      setTempVideo({
                        ...tempVideo,
                        date: { ...tempVideo.date, day: e.target.value },
                      })
                    }
                    placeholder="e.g. 15"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Event Month</label>
                  <input
                    type="text"
                    value={tempVideo.date.month}
                    onChange={(e) =>
                      setTempVideo({
                        ...tempVideo,
                        date: { ...tempVideo.date, month: e.target.value },
                      })
                    }
                    placeholder="e.g. Jan"
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Caption / Description</label>
                  <textarea
                    className={styles.textarea}
                    style={{ minHeight: "100px" }}
                    value={tempVideo.desc}
                    onChange={(e) =>
                      setTempVideo({ ...tempVideo, desc: e.target.value })
                    }
                    placeholder="Describe the event..."
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Display Status</label>
                  <div
                    className={styles.toggleWrapper}
                    onClick={() => setTempVideo({ ...tempVideo, isActive: !tempVideo.isActive })}
                    style={{ marginTop: "8px" }}
                  >
                    <span
                      className={
                        tempVideo.isActive
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {tempVideo.isActive ? "Active" : "Inactive"}
                    </span>
                    <div
                      className={`${styles.toggleSwitch} ${tempVideo.isActive ? styles.toggleOn : ""}`}
                    >
                      <div className={styles.toggleHandle}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.saveChangesBtn}
                style={{ width: "100%" }}
                onClick={handleSaveModal}
                disabled={loading}
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  "Apply Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
