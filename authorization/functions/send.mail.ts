import nodemailer from 'nodemailer';

export const sendMail = (token: any, email: string) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail', // TODO use smtp server
    auth: {
      user: 'armreshad@gmail.com',
      pass: 'nosfoqwaokdxgqtq',
    },
  });
  const url = `http://localhost:3000/authorize/${token}`; // TODO redirect to the frontend
  transporter.sendMail({
    to: email,
    subject: 'cigsmoke confirmation mail',
    html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`, // TODO make the email
  });
};
