"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import styles from "./admin.module.css";

import { useToast } from "@/components/ToastContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const msg = params.get("message");
    if (msg) {
      addToast(msg, "error");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Using the newly formatted api wrapper
      const data = await api.post("/admin/login", { email: email.trim(), password: password.trim() });

      if (data.success) {
        addToast("Login successful! Redirecting...", "success");
          router.push("/admin/navbar");
      } else {
        addToast(data.message || "Invalid email or password.", "error");
        setLoading(false);
      }
    } catch (error) {
      addToast(error.message || "An error occurred. Please try again.", "error");
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoWrapper}>
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logocanva1.png`}
            alt="Logo"
            width={100}
            height={100}
            priority
          />
        </div>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
                suppressHydrationWarning={true}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <div className={styles.inputWrapper}>
              <i className="fas fa-lock"></i>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin@123"
                required
                suppressHydrationWarning={true}
              />
              <i
                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} ${styles.eyeIcon}`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
