import CreateUserController from "@/app/controllers/user/user-create.js";
import LogInUserController from "@/app/controllers/user/user-login.js";
import UpdateUserController from "@/app/controllers/user/user-update.js";
import LogOutUserController from "@/app/controllers/user/logout-controller.js";
import RefreshTokenController from "@/app/controllers/user/refresh-token-controller.js";
import GetUserController from "@/app/controllers/user/get-user-controller.js";

const CreateUser = new CreateUserController();
const SignIn = new LogInUserController();
const Update = new UpdateUserController();
const Logout = new LogOutUserController();
const RefreshToken = new RefreshTokenController();
const GetUser = new GetUserController();

const UserControllers = {
  CreateUser,
  SignIn,
  Update,
  Logout,
  RefreshToken,
  GetUser,
};

export default UserControllers;
