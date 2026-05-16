# Deployment Guide: vidyasthanam.com (DirectAdmin Standalone)

This guide outlines the steps to deploy the Next.js application using the **Standalone** method, which is optimized for performance and lower memory usage on DirectAdmin servers.

---

## 1. Local Configuration
Ensure `next.config.mjs` has the standalone output enabled:
```javascript
const nextConfig = {
  output: 'standalone',
  // ... other configs
}
```

## 2. Build Process
Run the production build:
```bash
npm run build
```

## 3. Prepare Deployment Package
Next.js generates a minimal app in `.next/standalone`. You must manually add static files and your PM2 config to it:

1.  **Copy `public/`** folder into `.next/standalone/public`
2.  **Copy `.next/static/`** folder into `.next/standalone/.next/static`
3.  **Create/Copy `ecosystem.config.js`** into `.next/standalone/` with the following content:

```javascript
module.exports = {
  apps: [{
    name: "vidyasthanam",
    script: "server.js",
    env: {
      NODE_ENV: "production",
      PORT: 3009
    }
  }]
};
```

## 4. Upload & Server Setup
1.  **Zip everything** inside the `.next/standalone` folder.
2.  **Upload & Extract** on your server (recommended: `/home/username/vidyasthanam-app/`).
3.  **Create `.env`** in the server folder with production values (MongoDB URI, JWT Secret, etc.).
4.  **Start the App** via SSH:
    ```bash
    pm2 start ecosystem.config.js
    pm2 save
    ```

## 5. Reverse Proxy (.htaccess)
Place this `.htaccess` file in your domain's **`public_html`** folder to link the domain to the app:

```apache
Options -Indexes
RewriteEngine On

# Allow direct access to uploads if they are stored in public_html
RewriteCond %{REQUEST_URI} !^/uploads/

# Forward all other traffic to the Node.js app on port 3009
RewriteRule ^(.*)$ http://127.0.0.1:3009/$1 [P,L]

ProxyPreserveHost On
```

---
*Note: If you receive a 503 error, ensure the PM2 process is running (`pm2 status`). If you receive a 500 error, ensure `mod_proxy` is enabled on your server.*
