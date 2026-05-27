# Deployment Guide: vidyasthanam.com (DirectAdmin Standalone)

This guide explains how to deploy the Next.js application using the Standalone production build with PM2 on a DirectAdmin server.

---

# 1. Local Configuration

Ensure `next.config.mjs` contains:

```javascript
const nextConfig = {
  output: "standalone",
};

export default nextConfig;
2. Build the Application

Run:

npm install
npm run build
3. Enable .env Support in Standalone Server

The standalone server.js does not automatically load .env.

Install dotenv:

npm install dotenv

Open:

.next/standalone/server.js

Add this as the FIRST LINE:

require("dotenv").config();

Example:

require("dotenv").config();

const path = require("path");

const dir = path.join(__dirname);

process.env.NODE_ENV = "production";
process.chdir(__dirname);

const currentPort = parseInt(process.env.PORT, 10) || 3000;

This allows:

PORT=3009

to work correctly in production.

or

* directly goto the server.js file change port for 

const currentPort = parseInt(process.env.PORT, 10) || 3000 -> this port value can be change to run;

4. Prepare Standalone Deployment Folder

After build, copy required files into .next/standalone.

Copy public
cp -r public .next/standalone/
Copy static assets
cp -r .next/static .next/standalone/.next/
5. Create PM2 Config

Create:

.next/standalone/ecosystem.config.js

Content:

module.exports = {
  apps: [
    {
      name: "vidyasthanam",
      script: "server.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

PORT will be loaded from .env.

6. Create Production .env

Inside:

.next/standalone/.env

Add:

MONGODB_URI=mongodb://127.0.0.1:27017/vidyasthanam

NEXT_PUBLIC_BASE_PATH=

JWT_SECRET=your_secure_secret

DOMAIN_URL=https://www.vidyasthanam.com

REVALIDATE=60

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key

RECAPTCHA_SECRET_KEY=your_secret_key

PORT=3009

Important:

Keep only ONE JWT_SECRET
Never commit .env to GitHub
7. Upload to Server

Zip everything INSIDE:

.next/standalone/

Upload and extract to:

/home/username/vidyasthanam-app/

Example structure:

vidyasthanam-app/
├── .env
├── ecosystem.config.js
├── server.js
├── public/
├── .next/
└── node_modules/
8. Start Application

SSH into server:

cd ~/vidyasthanam-app

Start PM2:

pm2 start ecosystem.config.js

Save PM2:

pm2 save

Check status:

pm2 status

Check logs:

pm2 logs vidyasthanam
9. Verify Port

Check if app listens on 3009:

ss -tulpn | grep 3009

You should see:

LISTEN 0 511 0.0.0.0:3009
10. DirectAdmin Reverse Proxy

Place this .htaccess inside:

domains/vidyasthanam.com/public_html/.htaccess

Content:

Options -Indexes

RewriteEngine On

# Allow uploads directly
RewriteCond %{REQUEST_URI} !^/uploads/

# Proxy all requests to Node.js app
RewriteRule ^(.*)$ http://127.0.0.1:3009/$1 [P,L]

ProxyPreserveHost On
11. Common Errors
503 Service Unavailable

Check:

pm2 status

If app is offline:

pm2 logs vidyasthanam

Usually caused by:

missing .env
wrong PORT
app crash
missing dependencies
PORT Not Working

Verify:

cat .env

Verify server.js contains:

require("dotenv").config();

Verify logs:

pm2 logs vidyasthanam
500 Internal Server Error

Enable Apache proxy modules:

mod_proxy
mod_proxy_http
mod_rewrite
12. Restart Application After Update
pm2 restart vidyasthanam
13. Rebuild Deployment

After code changes:

npm run build

Repeat:

copy public
copy static
upload standalone
restart PM2
14. Security Recommendations

Immediately rotate:

MongoDB password
JWT secrets
reCAPTCHA secrets

Do not expose credentials publicly.