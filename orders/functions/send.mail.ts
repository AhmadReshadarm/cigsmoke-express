import nodemailer from 'nodemailer';
import path from 'path';
const sendInvoice = (pdf: any, userEmail: any) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.beget.com',
    port: 465,
    secure: true,
    auth: {
      user: 'checkout@wuluxe.ru',
      pass: process.env.CHECKOUT_MAIL_SECRET,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });
  transporter.sendMail(
    {
      to: userEmail,
      from: 'checkout@wuluxe.ru',
      subject: `Счет на оплату на ${userEmail}`,
      html: path.join(__dirname, './index.html'),
      // attachments: [
      //   {
      //     filename: 'wuluxe.pdf',
      //     path: path.join(__dirname, '../wuluxe.pdf'),
      //     contentType: 'application/pdf',
      //   },
      // ],
    },
    (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    },
  );
};

export { sendInvoice };
