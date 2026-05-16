import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { getNavbarData, getCoursesData, getSettingsData, getContactData } from "@/lib/services/dataService";

export default async function Layout({ children }) {
    let navData = [];
    let coursesData = [];
    let settingsData = null;
    let contactData = null;

    try {
        const navRes = await getNavbarData();
        if (navRes.success && navRes.data) {
            navData = navRes.data;
        }

        const coursesRes = await getCoursesData();
        if (coursesRes.success && coursesRes.data?.courses) {
            coursesData = coursesRes.data.courses;
        }

        const settingsRes = await getSettingsData();
        if (settingsRes.success && settingsRes.data) {
            settingsData = settingsRes.data;
        }

        const contactRes = await getContactData();
        if (contactRes.success && contactRes.data) {
            contactData = contactRes.data;
        }
    } catch (err) {
        console.error("Failed to fetch layout data on server:", err);
    }

    return (
        <>
            <Navbar initialData={navData} />
            {children}
            <Footer navData={navData} coursesData={coursesData} settingsData={settingsData} contactData={contactData} />
        </>
    );
}