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
};

export default function TeachersPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [teacherData, setTeacherData] = useState({
    title: "",
    desc: "",
    teachers: [],
    isActive: true,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [tempTeacher, setTempTeacher] = useState({
    name: "",
    position: "",
    desc: "",
    avatar: "",
    isActive: true,
  });

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // ✅ Fetch teachers data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.dynamic("/home/teachers");
        if (res.success && res.data) {
          setTeacherData({
            title: res.data.title || "",
            desc: res.data.desc || "",
            teachers: res.data.teachers || [],
            isActive: res.data.isActive ?? true,
          });
        }
      } catch (error) {
        addToast("Failed to load teachers", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleGlobalChange = (e) => {
    const { name, value } = e.target;
    setTeacherData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = async () => {
    const newStatus = !teacherData.isActive;
    const updatedData = { ...teacherData, isActive: newStatus };
    setTeacherData(updatedData);

    try {
      await api.patch("/home/teachers", {
        title: updatedData.title || "Meet Our Teachers",
        desc: updatedData.desc || "Learn from our experts",
        teachers: updatedData.teachers,
        isActive: updatedData.isActive,
      });
      addToast(`Visibility: ${newStatus ? "Active" : "Inactive"}`, "success");
    } catch (error) {
      setTeacherData((prev) => ({ ...prev, isActive: !newStatus }));
      addToast("Failed to update status", "error");
    }
  };

  const toggleTeacherStatus = async (index) => {
    const updatedTeachers = [...teacherData.teachers];
    updatedTeachers[index].isActive = !updatedTeachers[index].isActive;
    const updatedData = { ...teacherData, teachers: updatedTeachers };

    setLoading(true);
    try {
      const res = await api.patch("/home/teachers", {
        title: updatedData.title || "Meet Our Teachers",
        desc: updatedData.desc || "Learn from our experts",
        teachers: updatedData.teachers,
        isActive: updatedData.isActive,
      });
      if (res.success) {
        setTeacherData(updatedData);
        addToast("Teacher status updated!", "success");
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
      setTempTeacher({
        ...teacherData.teachers[index],
        isActive: teacherData.teachers[index].isActive ?? true,
        avatar: teacherData.teachers[index].avatar || "",
      });
    } else {
      setEditIndex(null);
      setTempTeacher({
        name: "",
        position: "",
        desc: "",
        avatar: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!tempTeacher.name.trim()) {
      addToast("Teacher Name is required", "error");
      return;
    }
    if (!tempTeacher.position.trim()) {
      addToast("Position is required", "error");
      return;
    }
    if (!tempTeacher.desc.trim()) {
      addToast("Biography is required", "error");
      return;
    }

    const updatedTeachers = [...teacherData.teachers];
    if (editIndex !== null) {
      updatedTeachers[editIndex] = tempTeacher;
    } else {
      updatedTeachers.push(tempTeacher);
    }

    const updatedData = { ...teacherData, teachers: updatedTeachers };

    setLoading(true);
    try {
      const res = await api.patch("/home/teachers", updatedData);
      if (res.success) {
        setTeacherData(updatedData);
        setIsModalOpen(false);
        addToast(
          editIndex !== null ? "Teacher updated!" : "New teacher added!",
          "success",
        );
      }
    } catch (error) {
      addToast("Failed to save to database", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (index) => {
    const updatedTeachers = teacherData.teachers.filter((_, i) => i !== index);
    const updatedData = { ...teacherData, teachers: updatedTeachers };

    setLoading(true);
    try {
      const res = await api.patch("/home/teachers", updatedData);
      if (res.success) {
        setTeacherData(updatedData);
        addToast("Teacher removed", "success");
      }
    } catch (error) {
      addToast("Failed to remove teacher", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSave = async () => {
    if (!teacherData.title || !teacherData.title.trim()) {
      addToast("Section Title is required", "error");
      return;
    }
    if (!teacherData.desc || !teacherData.desc.trim()) {
      addToast("Intro Description is required", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch("/home/teachers", teacherData);
      if (res.success)
        addToast("Header settings synced successfully!", "success");
    } catch (error) {
      addToast("Failed to save changes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (fetching)
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );

  return (
    <div>
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className={styles.contentHeader}>
        <div className={styles.flexRow}>
          <h2>Teachers Section</h2>
          <div className={styles.toggleWrapper} onClick={handleToggleActive}>
            <span
              className={
                teacherData.isActive
                  ? styles.statusActive
                  : styles.statusInactive
              }
            >
              {teacherData.isActive ? "Active" : "Inactive"}
            </span>
            <div
              className={`${styles.toggleSwitch} ${teacherData.isActive ? styles.toggleOn : ""}`}
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
                value={teacherData.title || ""}
                onChange={handleGlobalChange}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Intro Description <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                name="desc"
                value={teacherData.desc || ""}
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
          <h3 className={styles.listTitle}>Teacher Directory</h3>
          <button className={styles.uploadBtn} onClick={() => openModal()}>
            <i className="fas fa-user-plus"></i> Add New Teacher
          </button>
        </div>

        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <div className={styles.tableResponsive}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th style={{ width: "70px" }}>Avatar</th>
                  <th>Teacher Info</th>
                  <th>Biography</th>
                  <th style={{ width: "100px" }}>Status</th>
                  <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teacherData.teachers.map((t, i) => (
                  <tr key={i}>
                    <td>
                      <div className={styles.profileAvatar}>
                        {t.avatar &&
                        (t.avatar.startsWith("/") ||
                          t.avatar.startsWith("http")) ? (
                          <img
                            src={
                              (t.avatar?.startsWith("data:")
                                ? ""
                                : process.env.NEXT_PUBLIC_BASE_PATH || "") +
                              t.avatar
                            }
                            alt="Profile"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          getInitials(t.name)
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "700", color: "#333" }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#FF7703" }}>
                        {t.position}
                      </div>
                    </td>
                    <td style={{ fontSize: "12px", color: "#666" }}>
                      {t.desc.substring(0, 80)}...
                    </td>
                    <td>
                      <div
                        className={styles.toggleWrapper}
                        onClick={() => toggleTeacherStatus(i)}
                        style={{
                          transform: "scale(0.8)",
                          cursor: "pointer",
                          display: "inline-flex",
                        }}
                      >
                        <span
                          className={
                            t.isActive !== false
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                        >
                          {t.isActive !== false ? "Active" : "Inactive"}
                        </span>
                        <div
                          className={`${styles.toggleSwitch} ${t.isActive !== false ? styles.toggleOn : ""}`}
                        >
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
                          onClick={() => deleteTeacher(i)}
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
      </div>

      {/* Modal / Pop-up */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "700px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                {editIndex !== null
                  ? "Edit Teacher Profile"
                  : "New Teacher Entry"}
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
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={tempTeacher.name}
                    onChange={(e) =>
                      setTempTeacher({ ...tempTeacher, name: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Position / Role</label>
                  <input
                    type="text"
                    value={tempTeacher.position}
                    onChange={(e) =>
                      setTempTeacher({
                        ...tempTeacher,
                        position: e.target.value,
                      })
                    }
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Biography</label>
                  <textarea
                    className={styles.textarea}
                    style={{ minHeight: "150px" }}
                    value={tempTeacher.desc}
                    onChange={(e) =>
                      setTempTeacher({ ...tempTeacher, desc: e.target.value })
                    }
                    placeholder="Write a short bio about the teacher..."
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Display Status</label>
                  <div
                    className={styles.toggleWrapper}
                    onClick={() =>
                      setTempTeacher({
                        ...tempTeacher,
                        isActive: !tempTeacher.isActive,
                      })
                    }
                    style={{ marginTop: "8px" }}
                  >
                    <span
                      className={
                        tempTeacher.isActive
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {tempTeacher.isActive ? "Active" : "Inactive"}
                    </span>
                    <div
                      className={`${styles.toggleSwitch} ${tempTeacher.isActive ? styles.toggleOn : ""}`}
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
