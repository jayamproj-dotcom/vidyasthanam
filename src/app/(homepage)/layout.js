import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";

export default async function Layout({ children }) {
    let navData = [];
    let coursesData = [];

    try {
        // Fetch Navbar data
        const navRes = await api.get("/navbar", {
            next: {
                revalidate: parseInt(process.env.REVALIDATE) || 60,
                tags: ["navbar-data"]
            }
        });
        if (navRes.success) {
            navData = navRes.data;
        }

        // Fetch Courses data for Footer
        const coursesRes = await api.get("/courses", {
            next: {
                revalidate: parseInt(process.env.REVALIDATE) || 60,
                tags: ["courses-data"]
            }
        });
        if (coursesRes.success && coursesRes.data?.courses) {
            coursesData = coursesRes.data.courses;
        }
    } catch (err) {
        console.error("Failed to fetch layout data on server:", err);
    }

    return (
        <>
            <Navbar initialData={navData} />
            {children}
            <Footer navData={navData} coursesData={coursesData} />
        </>
    );
}