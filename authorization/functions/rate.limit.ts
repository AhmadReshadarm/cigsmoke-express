import { rateLimit } from 'express-rate-limit';

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1,
  message: 'Too many request from this IP, please try again after 15 min',
});

const changePasswordLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1,
  message: 'Too many request from this IP, please try again after 24 hour',
});

export { resetPasswordLimiter, changePasswordLimiter };
