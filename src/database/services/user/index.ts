import CreateUserService from "@/database/services/user/user-create.js";
import GetOneUserByEmailService from "@/database/services/user/user-get-one-by-email.js";
import SiginUserService from "@/database/services/user/user-login.js";
import UpdateUserService from "@/database/services/user/user-update.js";

const CreateUser = new CreateUserService();
const GetUserByEmail = new GetOneUserByEmailService();
const SignInUser = new SiginUserService();
const UpdateUser = new UpdateUserService();

const UserServices = {
  CreateUser,
  GetUserByEmail,
  SignInUser,
  UpdateUser,
};

export default UserServices;
