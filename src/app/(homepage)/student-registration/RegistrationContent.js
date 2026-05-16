"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/components/Banner";
import api from "@/lib/api";
import ReCAPTCHA from "react-google-recaptcha";

const FloatingToast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      top: "30px",
      right: "30px",
      zIndex: 999999,
      background: type === "success" ? "#ecfdf5" : "#fef2f2",
      borderLeft: `5px solid ${type === "success" ? "#198754" : "#dc3545"}`,
      padding: "16px 24px",
      borderRadius: "8px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      display: "flex",
      alignItems: "center",
      gap: "15px",
      minWidth: "300px",
      maxWidth: "450px"
    }}>
      <i className={type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle"} style={{ fontSize: "22px", color: type === "success" ? "#198754" : "#dc3545" }}></i>
      <div style={{ flex: 1, fontSize: "15px", color: "#333", fontWeight: 500 }}>{message}</div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#999", padding: "0 5px", lineHeight: 1 }}>&times;</button>
    </div>
  );
};

export default function RegistrationContent({ initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = React.useRef(null);

  useEffect(() => {
    // Hide preloader when component mounts
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setStatusMsg({ type: "error", text: "Please complete the reCAPTCHA verification to confirm you are not a robot." });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const data = await api.post("/registration/send", { ...formData, recaptchaToken });
      if (data.success) {
        setStatusMsg({ type: "success", text: data.message || "Registration submitted successfully!" });
        if (window.Swal) {
          window.Swal.fire({
            icon: "success",
            title: "Registration submitted successfully!",
            text: "We will contact you shortly.",
            confirmButtonColor: "#67080E"
          });
        }
        setFormData({
          name: "",
          dob: "",
          gender: "",
          address: "",
          phone: "",
          email: "",
          message: "",
        });
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);
      } else {
        setStatusMsg({ type: "error", text: data.message || "Failed to submit registration. Please try again." });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message || "Network error encountered while submitting." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inner-page">
      <Banner />
      {statusMsg && (
        <FloatingToast
          message={statusMsg.text}
          type={statusMsg.type}
          onClose={() => setStatusMsg(null)}
        />
      )}

      <section className="registration-container">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="registration-card">
                <div className="form-icon">
                  <i className="fas fa-user-graduate"></i>
                  <span className="form-title">Registration Form</span>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label fw-600">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="dob" className="form-label fw-600">
                        Date of Birth <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        suppressHydrationWarning
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600">Gender <span className="text-danger">*</span></label>
                    <div className="d-flex gap-4">
                      {["Male", "Female", "Other"].map((option) => (
                        <div key={option} className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gender"
                            id={option.toLowerCase()}
                            value={option}
                            checked={formData.gender === option}
                            onChange={handleChange}
                            required
                            suppressHydrationWarning
                          />
                          <label
                            className="form-check-label"
                            htmlFor={option.toLowerCase()}
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label fw-600">
                      Address <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter your complete address"
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label fw-600">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter your 10-digit phone number"
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label fw-600">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                        suppressHydrationWarning
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="message" className="form-label fw-600">
                      Additional Information
                    </label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      rows="3"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Any additional information or questions"
                    ></textarea>
                  </div>

                  <div className="mb-4 d-flex justify-content-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Ldep-ksAAAAAO3ciMHhD8mPdWVAvMEp-j3k-jxr"}
                      onChange={(token) => setRecaptchaToken(token)}
                      onExpired={() => setRecaptchaToken(null)}
                      suppressHydrationWarning
                    />
                  </div>

                  <button type="submit" className="btn btn-register" suppressHydrationWarning>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit Registration"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
