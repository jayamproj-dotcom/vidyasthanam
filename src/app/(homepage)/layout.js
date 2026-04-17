import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { getNavbarData, getCoursesData } from "@/lib/services/dataService";

export default async function Layout({ children }) {
    let navData = [];
    let coursesData = [];

    try {
        // Fetch Navbar data
        const navRes = await getNavbarData();
        if (navRes.success && navRes.data) {
            navData = navRes.data;
        }


        // Fetch Courses data for Footer
        const coursesRes = await getCoursesData();
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