import { Poppins, Kadwa, Tangerine, Yatra_One, Playfair_Display } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const kadwa = Kadwa({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kadwa",
  display: "swap",
});

const tangerine = Tangerine({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-tangerine",
  display: "swap",
});

const yatraOne = Yatra_One({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-yatra-one",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

const baseUrl = process.env.DOMAIN_URL || "http://localhost:3000";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  metadataBase: new URL(`${baseUrl}${basePath}`),
  title: {
    default: "Vidyasthanam - School of Indian Music, Culture & Languages",
    template: "%s | Vidyasthanam"
  },
  description: "Learn Carnatic, Hindustani, Veena, Vocal, and Languages at Vidyasthanam, Chennai.",
  keywords: ["Indian Music", "Culture", "Languages", "Carnatic Music", "Hindustani Music", "Vocal Training", "Veena", "Sanskrit", "Tamil", "Chennai"],
  authors: [{ name: "Vidyasthanam" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Vidyasthanam",
    title: "Vidyasthanam - School of Indian Music, Culture & Languages",
    description: "Learn Carnatic, Hindustani, Veena, Vocal, and Languages at Vidyasthanam, Chennai.",
    images: [
      {
        url: "/logocanva1.png",
        width: 800,
        height: 600,
        alt: "Vidyasthanam Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidyasthanam - School of Indian Music, Culture & Languages",
    description: "Learn Carnatic, Hindustani, Veena, Vocal, and Languages at Vidyasthanam, Chennai.",
    images: ["/logocanva1.png"],
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${kadwa.variable} ${tangerine.variable} ${yatraOne.variable} ${playfairDisplay.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Font Awesome 6.5.2 (Latest) - Consolidates all previous versions */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        
        {/* Google Recaptcha Enterprise */}
        <script src="https://www.google.com/recaptcha/enterprise.js" async defer></script>
      </head>
      <body className={poppins.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

