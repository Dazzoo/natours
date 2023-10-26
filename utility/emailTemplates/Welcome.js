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
    <p>Thank you for joining our online community. We are excited to have you on board!</p>
    <p>Our website offers a variety of tours to help you explore and discover new places.</p>
    <p>If you have any questions or need assistance, feel free to contact our support team.</p>
    <p>Get started now and enjoy all the benefits! Just click the button below.</p>
    <p>Please, click on the button below to verify your email address.</p>
    <a class="cta-button" href="${url}">Get Started</a>
    <div class="footer">
      <p>Best regards,</p>
      <p>Your Natours Team</p>
    </div>
  </div>
  </body>
</html>`
