import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { promisify } from 'util';
import fs from 'fs';
const sendInvoice = async (data: any, userEmail: any) => {
  const readFile = promisify(fs.readFile);
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
  let html = await readFile('./index.html', 'utf8');
  let template = handlebars.compile(html);
  let htmlToSend = template(data);
  transporter.sendMail(
    {
      to: userEmail,
      from: 'checkout@wuluxe.ru',
      subject: `Счет на оплату на ${userEmail}`,
      html: htmlToSend,
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
