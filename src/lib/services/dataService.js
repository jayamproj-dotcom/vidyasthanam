import { connectToDatabase } from "@/lib/mongodb";
import { unstable_cache } from "next/cache";
import Home from "@/models/Home";
import About from "@/models/About";
import Contact from "@/models/Contact";
import Course from "@/models/Course";
import Event from "@/models/Event";
import Gallery from "@/models/Gallery";
import Foundation from "@/models/Foundation";
import Registration from "@/models/Registration";
import Navbar from "@/models/Navbar";
import Publication from "@/models/Publication";
import Setting from "@/models/Setting";

const REVALIDATE_TIME = parseInt(process.env.REVALIDATE) || 60;

const handleRequest = async (model, query = {}) => {
  try {
    await connectToDatabase();
    const data = await model.findOne(query);
    // Convert Mongoose document to plain object for caching
    return JSON.parse(JSON.stringify({ success: true, data }));
  } catch (error) {
    console.error(`Error fetching ${model.modelName}:`, error);
    return { success: false, error: error.message };
  }
};

const handleRequestList = async (model, query = {}, sort = {}) => {
  try {
    await connectToDatabase();
    const data = await model.find(query).sort(sort);
    // Convert Mongoose documents to plain objects for caching
    return JSON.parse(JSON.stringify({ success: true, data }));
  } catch (error) {
    console.error(`Error fetching ${model.modelName} list:`, error);
    return { success: false, error: error.message };
  }
};

export const getHomeData = unstable_cache(
  () => handleRequest(Home),
  ["home-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["home-data"] }
);

export const getAboutData = unstable_cache(
  () => handleRequest(About),
  ["about-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["about-data"] }
);

export const getContactData = unstable_cache(
  () => handleRequest(Contact),
  ["contact-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["contact-data"] }
);

export const getCoursesData = unstable_cache(
  () => handleRequest(Course),
  ["courses-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["courses-data"] }
);

export const getEventsData = unstable_cache(
  () => handleRequest(Event),
  ["events-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["events-data"] }
);

export const getGalleryData = unstable_cache(
  () => handleRequest(Gallery),
  ["gallery-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["gallery-data"] }
);

export const getFoundationData = unstable_cache(
  () => handleRequest(Foundation),
  ["foundation-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["foundation-data"] }
);

export const getRegistrationData = unstable_cache(
  () => handleRequest(Registration),
  ["registration-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["registration-data"] }
);

export const getNavbarData = unstable_cache(
  () => handleRequestList(Navbar, {}, { order: 1 }),
  ["navbar-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["navbar-data"] }
);

export const getPublicationsData = unstable_cache(
  () => handleRequest(Publication),
  ["publications-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["publications-data"] }
);

export const getSettingsData = unstable_cache(
  () => handleRequest(Setting),
  ["settings-data-cache"],
  { revalidate: REVALIDATE_TIME, tags: ["settings-data"] }
);


