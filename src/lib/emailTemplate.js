export function generateContactEmailHtml({ name, email_id, phone_no, subject, message }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Message - Vidyasthanam</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #ffedd5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(127, 29, 29, 0.08);
      border: 1px solid #fed7aa;
    }
    .header {
      background-color: #ff6b00;
      color: #ffffff;
      padding: 25px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 5px 0 0;
      font-size: 14px;
      opacity: 0.95;
    }
    .content {
      padding: 30px 25px;
    }
    .content h2 {
      font-size: 18px;
      color: #7f1d1d;
      margin-top: 0;
      border-bottom: 2px solid #fed7aa;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    .info-table th {
      text-align: left;
      padding: 10px 12px;
      background-color: #fff7ed;
      color: #7f1d1d;
      font-weight: 600;
      width: 35%;
      border-bottom: 1px solid #fed7aa;
      font-size: 14px;
    }
    .info-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #fed7aa;
      color: #212529;
      font-size: 14px;
    }
    .message-box {
      background-color: #fff7ed;
      border-left: 4px solid #ff6b00;
      padding: 15px 20px;
      border-radius: 0 4px 4px 0;
      margin-top: 10px;
      white-space: pre-wrap;
      font-size: 14px;
      color: #343a40;
    }
    .footer {
      background-color: #ffedd5;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #7f1d1d;
      border-top: 1px solid #fed7aa;
      opacity: 0.85;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vidyasthanam Platform</h1>
      <p>New Contact Form Dispatch Received</p>
    </div>
    <div class="content">
      <h2>Submission Details</h2>
      <table class="info-table">
        <tr>
          <th>Sender Name</th>
          <td>${escapeHtml(name)}</td>
        </tr>
        <tr>
          <th>Email Address</th>
          <td><a href="mailto:${escapeHtml(email_id)}" style="color: #ff6b00; text-weight: 600; text-decoration: none;">${escapeHtml(email_id)}</a></td>
        </tr>
        <tr>
          <th>Phone Number</th>
          <td>${escapeHtml(phone_no)}</td>
        </tr>
        <tr>
          <th>Subject</th>
          <td><strong>${escapeHtml(subject)}</strong></td>
        </tr>
      </table>
      
      <h3 style="font-size: 15px; color: #7f1d1d; margin-bottom: 5px;">Message Content:</h3>
      <div class="message-box">${escapeHtml(message)}</div>
    </div>
    <div class="footer">
      This notification was automatically dispatched from the Vidyasthanam Public Gateway portal.
    </div>
  </div>
</body>
</html>
  `;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateRegistrationEmailHtml({ name, dob, gender, address, phone, email, message }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Student Registration - Vidyasthanam</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #ffedd5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(127, 29, 29, 0.08);
      border: 1px solid #fed7aa;
    }
    .header {
      background-color: #ff6b00;
      color: #ffffff;
      padding: 25px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 5px 0 0;
      font-size: 14px;
      opacity: 0.95;
    }
    .content {
      padding: 30px 25px;
    }
    .content h2 {
      font-size: 18px;
      color: #7f1d1d;
      margin-top: 0;
      border-bottom: 2px solid #fed7aa;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    .info-table th {
      text-align: left;
      padding: 10px 12px;
      background-color: #fff7ed;
      color: #7f1d1d;
      font-weight: 600;
      width: 35%;
      border-bottom: 1px solid #fed7aa;
      font-size: 14px;
    }
    .info-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #fed7aa;
      color: #212529;
      font-size: 14px;
    }
    .message-box {
      background-color: #fff7ed;
      border-left: 4px solid #ff6b00;
      padding: 15px 20px;
      border-radius: 0 4px 4px 0;
      margin-top: 10px;
      white-space: pre-wrap;
      font-size: 14px;
      color: #343a40;
    }
    .footer {
      background-color: #ffedd5;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #7f1d1d;
      border-top: 1px solid #fed7aa;
      opacity: 0.85;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vidyasthanam Portal</h1>
      <p>New Student Registration Received</p>
    </div>
    <div class="content">
      <h2>Application Profile</h2>
      <table class="info-table">
        <tr>
          <th>Full Name</th>
          <td><strong>${escapeHtml(name)}</strong></td>
        </tr>
        <tr>
          <th>Date of Birth</th>
          <td>${escapeHtml(dob)}</td>
        </tr>
        <tr>
          <th>Gender</th>
          <td>${escapeHtml(gender)}</td>
        </tr>
        <tr>
          <th>Phone Number</th>
          <td>${escapeHtml(phone)}</td>
        </tr>
        <tr>
          <th>Email Address</th>
          <td><a href="mailto:${escapeHtml(email)}" style="color: #ff6b00; text-decoration: none; font-weight: 600;">${escapeHtml(email)}</a></td>
        </tr>
        <tr>
          <th>Complete Address</th>
          <td>${escapeHtml(address)}</td>
        </tr>
      </table>
      
      ${message ? `
      <h3 style="font-size: 15px; color: #7f1d1d; margin-bottom: 5px;">Additional Notes / Questions:</h3>
      <div class="message-box">${escapeHtml(message)}</div>
      ` : ''}
    </div>
    <div class="footer">
      This profile was registered via the public Vidyasthanam admissions portal.
    </div>
  </div>
</body>
</html>
  `;
}
