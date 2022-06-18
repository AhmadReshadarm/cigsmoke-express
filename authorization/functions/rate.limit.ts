import { rateLimit } from 'express-rate-limit';

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1,
  message: 'Too many request from this IP, please try again after 15 min',
});

export { resetPasswordLimiter };
