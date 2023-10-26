module.exports = (name, url) =>
    `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Welcome to Natours</title>
    <style>
      /* CSS styles for the email template */
      body {
        font-family: Arial, sans-serif;
        background-color: #f2f2f2;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #fff;
        padding: 40px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      h1 {
        color: #333;
      }
      p {
        margin-bottom: 20px;
        line-height: 1.5;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(to right bottom, rgba(125, 213, 111, 1), rgba(40, 180, 135, 1))!important;
        color: #ffff!important;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 5px;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
      }
    </style>
  </head>
  <body>
  <div class="container">
    <h1>Welcome to Natours!</h1>
    <p>Dear ${name},</p>
    <p>We received a request to reset the password for your account. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, please click on the following link:</p>
    <a href="${url}">${url}</a>
    <p>Please note that this reset token is only valid for [Validity Duration - e.g., 24 hours]. After that, you'll need to request a new reset token.    </p>
    <p>If you have any questions or need further assistance, please don't hesitate to contact our support team at [Support Email Address].</p>
    <div class="footer">
      <p>Best regards,</p>
      <p>Your Natours Team</p>
    </div>
  </div>
  </body>
</html>`
