"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import api from "@/lib/api";

const Navbar = ({ initialData = [] }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState(() => {
    return initialData
      .filter((item) => item.isActive)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/" || pathname === "/home";

  // Returns " active" string if the path matches current route
  const isActive = (path) => {
    if (!mounted) return "";
    if (path === "/" || path === "/home") {
      return pathname === "/" || pathname === "/home" ? " active" : "";
    }
    return pathname.startsWith(path) ? " active" : "";
  };

  // Split nav items: home, contact, and everything in between
  const contactItem = navItems.find((i) => i.path === "/contact");
  const middleItems = navItems.filter(
    (i) =>
      i.path !== "/" &&
      i.path !== "/home" &&
      i.path !== "/contact"
  );


  return (
    <>
      {/* ── Topbar ── */}
      <div className={styles["topbar-wrapper"]}>
        <div className={styles["marquee"]}>
          <span className={styles["marquee-content"]}>
            <i className="fas fa-bullhorn me-2"></i> Courses start from Tamil
            New Year. Registrations Open.
          </span>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav
        className="navbar navbar-expand-custom navbar-dark"
        style={{
          backgroundColor: isHome ? "transparent" : "#FFEECB",
          position: isHome ? "absolute" : "relative",
          width: "100%",
          zIndex: 10,
        }}
      >
        <div className="container-fluid">
          <div className="row w-100 align-items-center">
            {/* ── Logo ── */}
            <div className="col-4 d-flex align-items-center">
              <Link
                href="/"
                className="d-flex align-items-center text-decoration-none"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logocanva1.png`}
                  alt="Vidyasthanam Logo"
                  id="logo"
                  className="me-2"
                  width={100}
                  height={100}
                  priority
                />
                <span className="navbar-brand mb-0 h1 navbar-home">
                  Vidyasthanam
                </span>
              </Link>
            </div>

            {/* ── Nav + Toggle ── */}
            <div className="col-8 d-flex justify-content-end align-items-center">
              {/* ── Desktop Nav ── */}
              <div
                className="collapse navbar-collapse d-none d-xl-block"
                id="navbarNav"
              >
                <ul className="navbar-nav ms-auto align-items-center text-nowrap">
                  {/* Home icon button */}
                  <li className="nav-item">
                    <Link
                      href="/"
                      className={`nav-link navbar-home${isActive("/")}`}
                      style={{
                        background: "#ff7703",
                        borderRadius: "50%",
                        padding: "14px 18px",
                      }}
                    >
                      <i
                        className="fas fa-home"
                        style={{ color: "#fff", padding: "8px 8px" }}
                      />
                    </Link>
                  </li>

                  {/* All middle items (including vidyasthanam-foundation, student-registration, etc.) */}
                  {middleItems.map((item) => (
                    <li className="nav-item" key={item._id}>
                      <Link
                        href={item.path}
                        className={`nav-link navbar-home${isActive(item.path)}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}

                  {/* Contact — always rendered, uses DB label if available */}
                  <li className="nav-item ms-lg-3">
                    <Link
                      href="/contact"
                      className={`nav-link contact-btn${isActive("/contact")}`}
                    >
                      {contactItem?.name ?? "Contact us"}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* ── Mobile Toggler ── */}
              <button
                className="navbar-toggler d-xl-none border-0"
                type="button"
                onClick={() => setIsMenuOpen(true)}
              >
                <span className="navbar-toggler-icon" />
              </button>

              {/* ── Overlay ── */}
              {isMenuOpen && (
                <div
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.5)",
                    zIndex: 2000,
                  }}
                />
              )}

              {/* ── Sidebar ── */}
              <div
                style={{
                  background: "#fff",
                  height: "100vh",
                  width: "300px",
                  padding: "60px 20px 20px",
                  position: "fixed",
                  top: 0,
                  right: 0,
                  zIndex: 2001,
                  transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
                  boxShadow: "-5px 0 15px rgba(0,0,0,0.1)",
                  overflowY: "auto",
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    border: "none",
                    background: "transparent",
                    fontSize: "24px",
                    color: "#333",
                    cursor: "pointer",
                    padding: "10px",
                  }}
                >
                  <i className="fas fa-times" />
                </button>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {/* Home */}
                  <li className="nav-item border-bottom pb-2">
                    <Link
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="nav-link text-dark d-flex align-items-center gap-2"
                    >
                      <i className="fas fa-home" style={{ color: "#ff7703" }} />{" "}
                      Home
                    </Link>
                  </li>

                  {/* All middle items */}
                  {middleItems.map((item) => (
                    <li className="nav-item border-bottom pb-2" key={item._id}>
                      <Link
                        href={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`nav-link text-dark${isActive(item.path)}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}

                  {/* Contact */}
                  <li className="nav-item mt-3">
                    <Link
                      href="/contact"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn w-100 text-white"
                      style={{
                        background: "#ff7703",
                        borderRadius: "30px",
                        padding: "12px",
                      }}
                    >
                      {contactItem?.name ?? "Contact us"}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
