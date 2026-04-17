"use client";

import React, { useState, useEffect } from "react";
import styles from "../admin.module.css";
import api from "@/lib/api";

// ─────────────────────────────────────────────
// 1. Custom Hook: Intersection Observer
// ─────────────────────────────────────────────
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// ─────────────────────────────────────────────
// 2. Lazy Image with Shimmer Skeleton
// ─────────────────────────────────────────────
const LazyTableImage = React.memo(({ src, alt, height = 45, width = 80 }) => {
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
      {/* Shimmer */}
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

      {/* Render <img> only when scrolled into view */}
      {isVisible && src ? (
        <img
          src={src}
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
          <i className="fas fa-image" style={{ color: "#ccc", fontSize: "14px" }} />
        </div>
      ) : null}
    </div>
  );
});
LazyTableImage.displayName = "LazyTableImage";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
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

export default function NavbarPage() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [navItems, setNavItems] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tempItem, setTempItem] = useState({
    name: "",
    path: "",
    bannerImage: "",
    isActive: true,
    order: 0
  });

  const addToast = (message, type) => {
    setToasts([...toasts, { id: Date.now(), message, type }]);
  };

  const removeToast = (id) => {
    setToasts(toasts.filter(t => t.id !== id));
  };

  const fetchItems = async () => {
    try {
      const res = await api.get("/navbar");
      if (res.success) setNavItems(res.data);
    } catch (error) {
      addToast("Failed to load navbar items", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditId(item._id);
      setTempItem({ ...item });
    } else {
      setEditId(null);
      setTempItem({
        name: "",
        path: "",
        bannerImage: "",
        isActive: true,
        order: navItems.length
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempItem({ ...tempItem, bannerImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!tempItem.name || !tempItem.path) {
      addToast("Name and Path are required", "error");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (editId) {
        res = await api.patch("/navbar", { id: editId, ...tempItem });
      } else {
        res = await api.post("/navbar", tempItem);
      }

      if (res.success) {
        addToast(editId ? "Navbar item updated" : "New link added", "success");
        fetchItems();
        setIsModalOpen(false);
      }
    } catch (error) {
      addToast(error.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      const res = await api.patch("/navbar", { id: item._id, isActive: !item.isActive });
      if (res.success) {
        fetchItems();
        addToast(`Status: ${!item.isActive ? "Active" : "Inactive"}`, "success");
      }
    } catch (error) {
      addToast("Failed to update status", "error");
    }
  };

  const deleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      const res = await api.delete("/navbar", { id });
      if (res.success) {
        fetchItems();
        addToast("Link removed", "success");
      }
    } catch (error) {
      addToast("Delete failed", "error");
    }
  };

  const updateNavOrder = async (index, newOrder) => {
    const itemsCount = navItems.length;
    if (newOrder < 0 || newOrder >= itemsCount) return;

    const updatedItems = [...navItems];
    const [movedItem] = updatedItems.splice(index, 1);

    // Insert at new position
    updatedItems.splice(newOrder, 0, movedItem);

    // Normalize order values and sync each to DB
    setLoading(true);
    try {
      // We need to update multiple items at once ideally, but for now we'll do them sequentially or adjust the logic.
      // Better approach: send the whole ordered array or update each one.
      // Since we want to be professional, let's update all whose order changed.
      const promises = updatedItems.map((item, idx) => {
        if (item.order !== idx) {
          return api.patch("/navbar", { id: item._id, order: idx });
        }
        return Promise.resolve(null);
      });

      await Promise.all(promises);
      addToast("Nav order updated successfully!", "success");
      fetchItems();
    } catch (error) {
      addToast("Failed to update order", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className={styles.loadingContainer}><i className="fas fa-spinner fa-spin fa-2x"></i></div>;

  return (
    <div>
      {/* Shimmer keyframe — injected once */}
      <style>{`
        @keyframes lazyShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className={styles.toastContainer}>
        {toasts.map(t => <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />)}
      </div>

      <div className={styles.contentHeader}>
        <h2>Navbar Menu Management</h2>
      </div>

      <div className={styles.card}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Navigation Links</h3>
          <button className={styles.uploadBtn} onClick={() => openModal()}>
          <i className="fas fa-plus"></i> Add New Link
        </button>
        </div>
        <div className={styles.formSection} style={{ borderBottom: "none" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Banner Image</th>
                <th>Name</th>
                <th>Page Path</th>
                <th style={{ width: "80px" }}>Order</th>
                <th style={{ width: "120px" }}>Status</th>
                <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {navItems.map((item, i) => (
                <tr key={item._id}>
                  <td>
                    <LazyTableImage src={item.bannerImage} alt={item.name} />
                  </td>
                  <td style={{ fontWeight: "700" }}>{item.name}</td>
                  <td style={{ color: "#FF7703", fontSize: "12px" }}>{item.path}</td>
                  <td style={{ textAlign: "center" }}>
                    <select
                      value={i}
                      onChange={(e) => updateNavOrder(i, parseInt(e.target.value))}
                      className={styles.select}
                      style={{ width: "60px", padding: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                    >
                      {navItems.map((_, idx) => (
                        <option key={idx} value={idx}>
                          {idx + 1}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className={styles.toggleWrapper} onClick={() => toggleStatus(item)} style={{ transform: "scale(0.8)", display: "inline-flex" }}>
                      <span className={item.isActive ? styles.statusActive : styles.statusInactive}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                      <div className={`${styles.toggleSwitch} ${item.isActive ? styles.toggleOn : ""}`}>
                        <div className={styles.toggleHandle}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionContainer}>
                      <button className={styles.editBtn} onClick={() => openModal(item)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className={styles.deleteBtn} onClick={() => deleteItem(item._id)}>
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

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} style={{ maxWidth: "600px" }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editId ? "Edit Link" : "Add New Navbar Link"}</h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.grid}>
                <div className={styles.formGroup}>
                  <label>Display Name</label>
                  <input type="text" value={tempItem.name} onChange={e => setTempItem({ ...tempItem, name: e.target.value })} placeholder="e.g. About Us" />
                </div>
                <div className={styles.formGroup}>
                  <label>Page Path</label>
                  <input 
                    type="text" 
                    value={tempItem.path} 
                    onChange={e => setTempItem({ ...tempItem, path: e.target.value })} 
                    placeholder="e.g. /about" 
                    disabled={!!editId}
                    style={editId ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Page Header Banner Image</label>
                  <div className={styles.uploadContainer}>
                    <div className={styles.previewBox} style={{ height: "150px" }}>
                      {tempItem.bannerImage ? (
                        <img loading="lazy" src={tempItem.bannerImage.startsWith("data:image") ? tempItem.bannerImage : (tempItem.bannerImage.startsWith("http") ? tempItem.bannerImage : `${tempItem.bannerImage}`)} alt="Banner" />
                      ) : (
                        <div className={styles.noImage}>
                          <i className="fas fa-image fa-2x"></i>
                          <span>No Image Selected</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.fileInputWrapper}>
                      <button className={styles.uploadBtn} style={{ width: "100%" }}>
                        <i className="fas fa-upload"></i> Upload Banner Image
                      </button>
                      <input type="file" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Display Order</label>
                  <small style={{ color: "#666", fontSize: "11px" }}>
                  Determines position in the slider (0 is first)
                </small>

                  <input 
                    type="number" 
                    value={tempItem.order ?? 0} 
                    onChange={e => setTempItem({ ...tempItem, order: e.target.value === "" ? 0 : parseInt(e.target.value) })} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Visibility Status</label>
                  <div className={styles.toggleWrapper} onClick={() => setTempItem({ ...tempItem, isActive: !tempItem.isActive })} style={{ marginTop: "8px" }}>
                    <span className={tempItem.isActive ? styles.statusActive : styles.statusInactive}>
                      {tempItem.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className={`${styles.toggleSwitch} ${tempItem.isActive ? styles.toggleOn : ""}`}>
                      <div className={styles.toggleHandle}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveChangesBtn} style={{ width: "100%" }} onClick={handleSave} disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : "Save Link Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
