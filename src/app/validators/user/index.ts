import SignupUserValidator from "@/app/validators/user/user-create.js";
import SignInUserValidator from "@/app/validators/user/user-login.js";
import UpdateUserValidator from "@/app/validators/user/user-update.js";

const Signup = new SignupUserValidator();
const SignIn = new SignInUserValidator();
const Update = new UpdateUserValidator();
const UserValidators = { Signup, SignIn, Update };

export default UserValidators;
