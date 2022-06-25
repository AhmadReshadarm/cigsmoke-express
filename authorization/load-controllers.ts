import { AuthController } from './controllers/auth.controller';
import { AdminController } from './controllers/admin.controller';
import { UserController } from './controllers/user.controller';

const loadControllers = () => {
  return [AuthController, AdminController, UserController];
};

export default loadControllers;
