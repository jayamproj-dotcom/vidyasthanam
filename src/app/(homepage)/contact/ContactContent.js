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

export default function ContactContent({ initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    email_id: "",
    phone_no: "",
    subject: "",
    message: "",
  });

  const [contactInfo, setContactInfo] = useState(initialData || {});
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const data = await api.post("/contact/send", { ...formData, recaptchaToken });
      if (data.success) {
        setStatusMsg({ type: "success", text: data.message || "Message sent successfully!" });
        setFormData({
          name: "",
          email_id: "",
          phone_no: "",
          subject: "",
          message: "",
        });
        // Reset the declarative reCAPTCHA widget
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);
      } else {
        setStatusMsg({ type: "error", text: data.message || "Failed to relay message. Please try again." });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message || "Network interruption encountered while sending your message." });
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

      <section className="contact-section">
        <div className="container">
          <div>
            <h1 className="section-title text-center">Get In Touch</h1>
          </div>

          <div className="row g-4">
            <div className="col-lg-5">
              <div>
                <h3 className="contact-title">{contactInfo.title}</h3>
                <p className="text-muted mb-4">{contactInfo.description}</p>

                <div className="contact-info-item">
                  <div className="contact-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div>
                    <h5 className="mb-1">Phone</h5>
                    <div className="mb-0 text-muted">
                      <a href={`tel:${(contactInfo.phone1 || "").replace(/\s/g, '')}`} className="d-block mb-2 text-decoration-none text-reset">
                        <span style={{ fontWeight: 600, fontSize: "1.1rem", display: "block", letterSpacing: "0.5px" }}>{contactInfo.phone1}</span>
                        <span className="small d-block">{contactInfo.phone1Note}</span>
                      </a>
                      <a href={`https://wa.me/${(contactInfo.phone2 || "").replace(/[^0-9]/g, '')}`} target="_blank" className="d-block text-decoration-none text-reset">
                        <span style={{ fontWeight: 600, fontSize: "1.1rem", display: "block", letterSpacing: "0.5px" }}>{contactInfo.phone2}</span>
                        <span className="small d-block">{contactInfo.phone2Note}</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h5 className="mb-1">Email</h5>
                    <p className="text-muted mb-0">{contactInfo.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="contact-card">
                <h3 className="contact-title mb-4">Send us a Message</h3>
                {/* {statusMsg && (
                  <div className={`alert ${statusMsg.type === "success" ? "alert-success" : "alert-danger"} mb-4`} role="alert">
                    {statusMsg.text}
                  </div>
                )} */}
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required suppressHydrationWarning />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address <span className="text-danger">*</span></label>
                      <input type="email" className="form-control" name="email_id" value={formData.email_id} onChange={handleChange} required suppressHydrationWarning />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                      <input type="tel" className="form-control" name="phone_no" value={formData.phone_no} onChange={handleChange} required suppressHydrationWarning />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Subject <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="subject" value={formData.subject} onChange={handleChange} required suppressHydrationWarning />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Message <span className="text-danger">*</span></label>
                      <textarea className="form-control" name="message" rows="6" value={formData.message} onChange={handleChange} required></textarea>
                    </div>
                    <div className="col-12 d-flex justify-content-center my-3">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Ldep-ksAAAAAO3ciMHhD8mPdWVAvMEp-j3k-jxr"}
                        onChange={(token) => setRecaptchaToken(token)}
                        onExpired={() => setRecaptchaToken(null)}
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !recaptchaToken} suppressHydrationWarning>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="map-section py-0">
        <div className="ratio ratio-21x9" style={{ minHeight: "450px" }}>
          <iframe
            src={contactInfo.googleMapUrl || "htts://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497511.23106585274!2d79.8789962410795!3d13.047985943115949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1756980625038!5m2!1sen!2sin"}
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
