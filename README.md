# 📘 Vidyasthanam - Next.js Project

## 🚀 Project Overview

Vidyasthanam is a Next.js-based web application deployed under a sub-path with MongoDB as the database. It supports ISR (Incremental Static Regeneration), authentication, and dynamic content rendering.

---

## ⚙️ Configuration

### Next.js Config (`next.config.js`)

```js
const nextConfig = {
  basePath: '/vidyasthanam',
  assetPrefix: '/vidyasthanam/',
  images: {
    qualities: [25, 50, 75, 85, 100],
  },
}

export default nextConfig;
```

### 📌 Explanation

* `basePath` → Runs app under `/vidyasthanam`
* `assetPrefix` → Ensures static files load correctly in subdirectory
* `images.qualities` → Controls image optimization levels

---

## 🔐 Environment Variables (`.env`)

```env
# Local MongoDB
# MONGODB_URI=mongodb://127.0.0.1:27017/vidyasthanam

# Production MongoDB
MONGODB_URI=mongodb://admin:AdminStrongPass123@76.13.244.61:27017/vidyasthanam?authSource=admin

# MongoDB Atlas (Optional)
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/vidyasthanam

NEXT_PUBLIC_BASE_PATH=/vidyasthanam
JWT_SECRET=vidyasthanam_admin_secret_2024
DOMIN_URL=http://localhost:3000

# ISR Revalidation Time (in seconds)
REVALIDATE=60
```

---

## 🛠️ Installation

```bash
npm install
```

---

## ▶️ Run Locally

```bash
npm run dev
```

App will run at:

```
http://localhost:3000/vidyasthanam
```

---

## 📦 Build for Production

```bash
npm run build
npm start
```
---

## 🔄 ISR (Incremental Static Regeneration)

* Controlled using:

```env
REVALIDATE=60
```

* Pages will revalidate every **60 seconds**

---

## 🔑 Authentication

* Uses JWT for authentication
* Secret key:

```env
JWT_SECRET=vidyasthanam_admin_secret_2024
```

⚠️ Change this in production for security

---

## 📁 Project Structure (Simplified)

```
src/
 ├── app/
 ├── components/
 ├── lib/
 ├── models/
 ├── api/
public/
```

---

## ⚠️ Best Practices

* ❌ Do NOT commit `.env` file
* ❌ Avoid uploading `.zip` files to Git
* ✅ Use `.gitignore`
* ✅ Use environment-based configs

---

## 🧑‍💻 Author

Developed by **Sridhar**

---

## 📄 License

This project is for internal / client use.
