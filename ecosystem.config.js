// module.exports = {
//   apps: [
//     {
//       name: "vidyasthanam",
//       script: "node_modules/next/dist/bin/next",
//       args: "start -p 3009",
//       cwd: "./",
//       instances: 1,
//       exec_mode: "fork",
//       autorestart: true,
//       watch: false,
//       env: {
//         NODE_ENV: "production",
//         PORT: 3009,
//         HOSTNAME: "0.0.0.0",
//       },
//     },
//   ],
// };

module.exports = {
  apps: [
    {
      name: "vidyasthanam",
      script: "server.js", // <--- Change this from node_modules/... to server.js
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3009,         // Next.js standalone uses this env variable for the port
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
