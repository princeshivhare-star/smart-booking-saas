const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
};

const templates = {
  welcome: ({ name }) => ({
    subject: 'Welcome to Smart Booking!',
    html: `<h1>Welcome, ${name}!</h1><p>Your account has been created successfully. Start booking services today!</p>`,
  }),
  booking_confirmation: ({ name, bookingRef, service, date, startTime }) => ({
    subject: `Booking Confirmed - #${bookingRef}`,
    html: `
      <h2>Your booking is confirmed!</h2>
      <p>Hi ${name},</p>
      <table>
        <tr><td><strong>Booking Ref:</strong></td><td>#${bookingRef}</td></tr>
        <tr><td><strong>Service:</strong></td><td>${service}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${date}</td></tr>
        <tr><td><strong>Time:</strong></td><td>${startTime}</td></tr>
      </table>
      <p>Thank you for choosing Smart Booking!</p>
    `,
  }),
  booking_cancelled: ({ name, bookingRef, reason }) => ({
    subject: `Booking Cancelled - #${bookingRef}`,
    html: `<h2>Booking Cancelled</h2><p>Hi ${name}, your booking #${bookingRef} has been cancelled. ${reason ? `Reason: ${reason}` : ''}</p>`,
  }),
  booking_rescheduled: ({ name, bookingRef, date, startTime }) => ({
    subject: `Booking Rescheduled - #${bookingRef}`,
    html: `<h2>Booking Rescheduled</h2><p>Hi ${name}, your booking #${bookingRef} has been rescheduled to ${date} at ${startTime}.</p>`,
  }),
};

const sendEmail = async ({ to, subject, template, data, html }) => {
  try {
    const t = getTransporter();
    const content = template && templates[template] ? templates[template](data) : { subject, html };

    if (!t) {
      // Mock mode — just log
      console.log(`📧 [MOCK EMAIL] To: ${to} | Subject: ${content.subject}`);
      return { success: true, mock: true };
    }

    await t.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@smartbooking.com',
      to,
      subject: content.subject,
      html: content.html,
    });

    return { success: true };
  } catch (err) {
    console.error('Email send failed:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendEmail };
