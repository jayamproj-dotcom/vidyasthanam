"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../../admin.module.css";
import api from "@/lib/api";

// ─────────────────────────────────────────────
// 1. Custom Hook: Intersection Observer
// ─────────────────────────────────────────────
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// ─────────────────────────────────────────────
// 2. Lazy Image with Shimmer Skeleton
// ─────────────────────────────────────────────
const LazyTableImage = React.memo(({ src, alt, height = 60, width = 100 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: "hidden",
        borderRadius: "8px",
        border: "1px solid #eee",
        background: "#f0f0f0",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "lazyShimmer 1.2s infinite",
          }}
        />
      )}

      {isVisible && src ? (
        <img
          src={
            (src?.startsWith("data:")
              ? ""
              : process.env.NEXT_PUBLIC_BASE_PATH || "") + src
          }
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s ease",
            display: "block",
          }}
        />
      ) : !src ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i
            className="fas fa-image"
            style={{ color: "#ccc", fontSize: "18px" }}
          />
        </div>
      ) : null}
    </div>
  );
});

// Reusable Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
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

export default function CoursesPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [courseData, setCourseData] = useState({
    title: "",
    desc: "",
    bgImage: "", // Section background
    courses: [],
    isActive: true,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [tempCourse, setTempCourse] = useState({
    icon: "fas fa-music",
    name: "",
    desc: "",
    isActive: true,
    points: [""],
  });

  const sectionFileRef = useRef(null);

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.dynamic("/home/courses");
        if (res.success) {
          setCourseData({
            title: res.data.title || "",
            desc: res.data.desc || "",
            bgImage: res.data.bgImage || "",
            courses: Array.isArray(res.data.courses) ? res.data.courses : [],
            isActive: res.data.isActive ?? true,
          });
        }
      } catch (error) {
        addToast("Failed to load courses data", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchCourses();
  }, []);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast("File size too large (max 5MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setLoading(true);
    reader.onloadend = () => {
      callback(reader.result);
      setLoading(false);
      // Reset input value so same file can be selected again
      e.target.value = "";
    };
    reader.onerror = () => {
      addToast("Failed to read file", "error");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleActive = async () => {
    const newStatus = !courseData.isActive;
    setCourseData((prev) => ({ ...prev, isActive: newStatus }));

    try {
      const res = await api.patch("/home/courses", {
        ...courseData,
        isActive: newStatus,
      });

      if (res.success && res.data) {
        addToast(
          `Section visibility: ${newStatus ? "Active" : "Inactive"}.`,
          "success",
        );
        setCourseData({
          ...res.data,
          courses: Array.isArray(res.data.courses) ? res.data.courses : [],
        });
      }
    } catch (error) {
      setCourseData((prev) => ({ ...prev, isActive: !newStatus }));
      addToast(error.message || "Failed to update status", "error");
    }
  };

  const toggleCourseStatus = async (index) => {
    const updatedCourses = [...courseData.courses];
    updatedCourses[index].isActive = !updatedCourses[index].isActive;
    const updatedData = { ...courseData, courses: updatedCourses };

    setLoading(true);
    try {
      const res = await api.patch("/home/courses", updatedData);
      if (res.success && res.data) {
        setCourseData({
          ...res.data,
          courses: Array.isArray(res.data.courses) ? res.data.courses : [],
        });
        addToast(
          `Course status: ${updatedCourses[index].isActive ? "Active" : "Inactive"}`,
          "success",
        );
      }
    } catch (error) {
      addToast(error.message || "Failed to update status", "error");
    } finally {
      setLoading(false);
    }
  };

  // Modal Functions
  const openModal = (index = null) => {
    if (index !== null) {
      setEditIndex(index);
      setTempCourse({
        ...courseData.courses[index],
        points: courseData.courses[index].points || [""],
        isActive: courseData.courses[index].isActive ?? true,
      });
    } else {
      setEditIndex(null);
      setTempCourse({
        icon: "fas fa-music",
        name: "",
        desc: "",
        isActive: true,
        points: [""],
      });
    }
    setIsModalOpen(true);
  };

  const handlePointChange = (idx, value) => {
    const newPoints = [...tempCourse.points];
    newPoints[idx] = value;
    setTempCourse({ ...tempCourse, points: newPoints });
  };

  const addPoint = () => {
    setTempCourse({ ...tempCourse, points: [...tempCourse.points, ""] });
  };

  const removePoint = (idx) => {
    const newPoints = tempCourse.points.filter((_, i) => i !== idx);
    setTempCourse({
      ...tempCourse,
      points: newPoints.length ? newPoints : [""],
    });
  };

  const handleSaveModal = async () => {
    if (!(tempCourse?.name || "").trim() || !(tempCourse?.desc || "").trim()) {
      addToast("Name and Description are required!", "error");
      return;
    }

    const updatedCourses = [...(courseData?.courses || [])];
    const filteredPoints = (tempCourse?.points || []).filter(
      (p) => p && p.trim(),
    );
    const courseToSave = { ...tempCourse, points: filteredPoints };

    if (editIndex !== null) {
      updatedCourses[editIndex] = courseToSave;
    } else {
      updatedCourses.push(courseToSave);
    }

    const updatedData = { ...courseData, courses: updatedCourses };

    setLoading(true);
    try {
      const res = await api.patch("/home/courses", updatedData);
      if (res.success && res.data) {
        setCourseData({
          ...res.data,
          courses: Array.isArray(res.data.courses) ? res.data.courses : [],
        });
        setIsModalOpen(false);
        addToast(
          editIndex !== null ? "Course updated!" : "New course added!",
          "success",
        );
      }
    } catch (error) {
      addToast(error.message || "Failed to save course", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (index) => {
    const updatedCourses = courseData.courses.filter((_, i) => i !== index);
    const updatedData = { ...courseData, courses: updatedCourses };

    setLoading(true);
    try {
      const res = await api.patch("/home/courses", updatedData);
      if (res.success && res.data) {
        setCourseData({
          ...res.data,
          courses: Array.isArray(res.data.courses) ? res.data.courses : [],
        });
        addToast("Course removed successfully!", "success");
      }
    } catch (error) {
      addToast(error.message || "Failed to delete course", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSave = async () => {
    if (!(courseData?.title || "").trim() || !(courseData?.desc || "").trim()) {
      addToast("Title and Description are required!", "error");
      return;
    }

    console.log("SENDING PATCH /home/courses:", {
      title: courseData.title,
      hasBgImage: !!courseData.bgImage,
      bgImageLength: courseData.bgImage?.length || 0,
      bgImageStart: courseData.bgImage?.substring(0, 50),
    });

    setLoading(true);
    try {
      const res = await api.patch("/home/courses", courseData);
      if (res.success && res.data) {
        console.log("PATCH RESPONSE:", res.data);
        setCourseData({
          ...res.data,
          courses: Array.isArray(res.data.courses) ? res.data.courses : [],
        });
        addToast("Section settings saved!", "success");
      }
    } catch (error) {
      addToast(error.message || "Failed to save changes", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className={styles.loadingContainer}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div className={styles.contentHeader}>
        <div className={styles.flexRow}>
          <h2>Courses Section</h2>
          <div className={styles.toggleWrapper} onClick={handleToggleActive}>
            <span
              className={
                courseData.isActive
                  ? styles.statusActive
                  : styles.statusInactive
              }
            >
              {courseData.isActive ? "Active" : "Inactive"}
            </span>
            <div
              className={`${styles.toggleSwitch} ${courseData.isActive ? styles.toggleOn : ""}`}
            >
              <div className={styles.toggleHandle}></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card} style={{ marginBottom: "30px" }}>
        <div className={styles.formSection}>
          <h4>Section Header Settings</h4>
          <div className={styles.grid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Section Title <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={courseData.title || ""}
                onChange={handleTextChange}
                placeholder="e.g., Our Main Courses"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Section Subtitle / Description{" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                name="desc"
                className={styles.textarea}
                style={{ minHeight: "80px" }}
                value={courseData.desc || ""}
                onChange={handleTextChange}
                placeholder="Describe what these courses are about..."
              />
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                marginBottom: "25px",
                padding: "20px",
                background: "#f9f9f9",
                borderRadius: "12px",
                border: "1px dashed #ddd",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>
                    Courses Section Background
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "15px",
                    }}
                  >
                    This image will appear as the backdrop for the entire
                    Courses section on the homepage.
                  </p>
                  <div className={styles.fileInputWrapper}>
                    <button
                      className={styles.uploadBtn}
                      style={{ width: "100%", maxWidth: "200px" }}
                      onClick={() => sectionFileRef.current.click()}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-image"></i> Change Background
                        </>
                      )}
                    </button>
                    <input
                      type="file"
                      hidden
                      ref={sectionFileRef}
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, (data) => {
                          console.log("File loaded successfully into state");
                          setCourseData((prev) => ({ ...prev, bgImage: data }));
                        })
                      }
                    />
                  </div>
                  {courseData.bgImage?.startsWith("data:") && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#FF7703",
                        marginTop: "10px",
                      }}
                    >
                      <i className="fas fa-check-circle"></i> New local image
                      selected.
                    </p>
                  )}
                </div>
                <div
                  className={styles.previewBox}
                  style={{
                    width: "150px",
                    height: "80px",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                    background: "#fff",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {courseData.bgImage ? (
                    <img
                      src={
                        (courseData.bgImage?.startsWith("data:")
                          ? ""
                          : process.env.NEXT_PUBLIC_BASE_PATH || "") +
                        courseData.bgImage
                      }
                      alt="Section BG Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        console.error("Preview image failed to load");
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#ccc",
                        textAlign: "center",
                        padding: "20px",
                      }}
                    >
                      No Background
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.btnContainer} style={{ marginTop: "20px" }}>
          <button
            className={styles.saveChangesBtn}
            onClick={handleFinalSave}
            disabled={loading}
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              "Save Section Settings"
            )}
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Course Directory</h3>
          <button className={styles.uploadBtn} onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Add New Course
          </button>
        </div>
        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Icon</th>
                <th>Course Name</th>
                <th>Description</th>
                <th style={{ width: "100px" }}>Status</th>
                <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(courseData?.courses) &&
                courseData.courses.map((course, index) => (
                  <tr key={index}>
                    <td>
                      <div
                        className={styles.profileAvatar}
                        style={{
                          width: "40px",
                          height: "40px",
                          background: "#f8f9fa",
                          color: "#FF7703",
                        }}
                      >
                        <i className={course.icon || "fas fa-music"}></i>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "700" }}>{course.name}</div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        {course.points?.length || 0} highlight points
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        {course.desc?.substring(0, 80)}...
                      </div>
                    </td>
                    <td>
                      <div
                        className={styles.toggleWrapper}
                        onClick={() => toggleCourseStatus(index)}
                        style={{
                          transform: "scale(0.8)",
                          cursor: "pointer",
                          display: "inline-flex",
                        }}
                      >
                        <span
                          className={
                            course.isActive !== false
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                        >
                          {course.isActive !== false ? "Active" : "Inactive"}
                        </span>
                        <div
                          className={`${styles.toggleSwitch} ${course.isActive !== false ? styles.toggleOn : ""}`}
                        >
                          <div className={styles.toggleHandle}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionContainer}>
                        <button
                          className={styles.editBtn}
                          onClick={() => openModal(index)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => deleteCourse(index)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {(!courseData?.courses || courseData.courses.length === 0) && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#ccc",
                    }}
                  >
                    No courses added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Course */}
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
              <h3>{editIndex !== null ? "Edit Course" : "New Course Entry"}</h3>
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <label style={{ margin: 0 }}>Icon Class</label>
                    <a
                      href="https://fontawesome.com/search?o=r&m=free"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "#FF7703",
                        textDecoration: "none",
                        fontWeight: "600",
                      }}
                    >
                      Browse Icons{" "}
                      <i
                        className="fas fa-external-link-alt"
                        style={{ fontSize: "10px", marginLeft: "4px" }}
                      ></i>
                    </a>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "45px",
                        height: "45px",
                        background: "#f8f9fa",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        color: "#FF7703",
                        border: "1px solid #eee",
                        flexShrink: 0,
                      }}
                    >
                      <i className={tempCourse.icon || "fas fa-music"}></i>
                    </div>
                    <input
                      type="text"
                      value={tempCourse.icon}
                      onChange={(e) =>
                        setTempCourse({ ...tempCourse, icon: e.target.value })
                      }
                      placeholder="e.g. fas fa-guitar"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Course Name</label>
                  <input
                    type="text"
                    value={tempCourse.name}
                    onChange={(e) =>
                      setTempCourse({ ...tempCourse, name: e.target.value })
                    }
                    placeholder="e.g. Carnatic Vocal"
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Full Description</label>
                  <textarea
                    className={styles.textarea}
                    style={{ minHeight: "100px" }}
                    value={tempCourse.desc}
                    onChange={(e) =>
                      setTempCourse({ ...tempCourse, desc: e.target.value })
                    }
                    placeholder="Provide a detailed description of the course..."
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    Highlight Points / Curriculum Basics
                    <button
                      type="button"
                      onClick={addPoint}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#FF7703",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      <i className="fas fa-plus"></i> Add Point
                    </button>
                  </label>
                  {tempCourse.points.map((point, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handlePointChange(idx, e.target.value)}
                        placeholder="e.g. Basic music theory"
                      />
                      <button
                        type="button"
                        onClick={() => removePoint(idx)}
                        className={styles.deleteBtn}
                        style={{ padding: "0 10px", height: "40px" }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Display Status</label>
                  <div
                    className={styles.toggleWrapper}
                    onClick={() =>
                      setTempCourse({
                        ...tempCourse,
                        isActive: !tempCourse.isActive,
                      })
                    }
                    style={{ marginTop: "8px" }}
                  >
                    <span
                      className={
                        tempCourse.isActive
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {tempCourse.isActive ? "Active" : "Inactive"}
                    </span>
                    <div
                      className={`${styles.toggleSwitch} ${tempCourse.isActive ? styles.toggleOn : ""}`}
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
                  "Submit Course Data"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
