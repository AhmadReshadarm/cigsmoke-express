import nodemailer from 'nodemailer';

const baseUrl = 'http://localhost:3000'; //TODO change base to the website domain
const sendMail = (token: any, email: string) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail', // TODO use smtp server
    auth: {
      user: 'armreshad@gmail.com',
      pass: 'nosfoqwaokdxgqtq',
    },
  });
  const url = `${baseUrl}/profile/verify/${token}`;
  transporter.sendMail({
    to: email,
    subject: 'cigsmoke confirmation mail',
    html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`, // TODO make the email
  });
};

const sendMailResetPsw = (token: any, email: string) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail', // TODO use smtp server
    auth: {
      user: 'armreshad@gmail.com',
      pass: 'nosfoqwaokdxgqtq',
    },
  });
  const url = `${baseUrl}/profile/pswreset/confirmpsw/${token}`;
  transporter.sendMail({
    to: email,
    subject: 'cigsmoke reset your password',
    html: `Please click this email reset your password: <a href="${url}">${url}</a>`, // TODO make the email
  });
};

export { sendMail, sendMailResetPsw };
