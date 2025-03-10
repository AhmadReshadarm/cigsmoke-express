import nodemailer from 'nodemailer';
import { signupEmailTemplate, resetPswEmailTemplate, Payload, tokenEmailTemplate } from './email.template';
import { User } from './email.template';
const baseURL = 'https://wuluxe.ru';
const sendMail = (user: User) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.beget.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@wuluxe.ru',
      pass: process.env.EMAIL_SERVICE_SECRET_KEY,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });
  // const url = `${baseURL}/after-signup/${token}`;
  transporter.sendMail(
    {
      to: user.email,
      from: 'WULUXE <info@wuluxe.ru>',
      subject: `Добро пожаловать в wuluxe.ru ${user.email}`,
      html: signupEmailTemplate(user),
    },
    (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    },
  );
};

const sendMailToken = (payload: Payload) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.beget.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@wuluxe.ru',
      pass: process.env.EMAIL_SERVICE_SECRET_KEY,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });
  // const url = `${baseURL}/after-signup/${payload.token}`;
  // payload.confirmationURL = url;
  transporter.sendMail(
    {
      to: payload.email,
      from: 'WULUXE <info@wuluxe.ru>',
      subject: `Добро пожаловать в wuluxe.ru ${payload.email}`,
      html: tokenEmailTemplate(payload),
    },
    (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    },
  );
};

const sendMailResetPsw = (token: any, user: any) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.beget.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@wuluxe.ru',
      pass: process.env.EMAIL_SERVICE_SECRET_KEY,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });
  const url = `${baseURL}/profile/pswreset/confirmpsw/${token}`;
  transporter.sendMail(
    {
      to: user.email,
      from: 'WULUXE <info@wuluxe.ru>',
      subject: `Сбросить пароль для ${user.email}`,
      html: resetPswEmailTemplate(user.firstName, user.email, url),
    },
    (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    },
  );
};

const sendHelpDiskMail = (userEmail: string, adminEmail: string, text: string) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.beget.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@wuluxe.ru',
      pass: process.env.EMAIL_SERVICE_SECRET_KEY,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  transporter.sendMail(
    {
      to: adminEmail,
      from: 'WULUXE <info@wuluxe.ru>',
      subject: `Вопрос от ${userEmail}`,
      html: `<div><p>Вопрос от <a href="mailto:${userEmail}">${userEmail}</a>:</p></div><br /><div><p>${text}</p></div>`,
    },
    (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    },
  );
};

export { sendMail, sendMailResetPsw, sendHelpDiskMail, sendMailToken };
