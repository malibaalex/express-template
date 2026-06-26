import UserAuthentication from "@/app/middlewares/user/authentication.js";
import CheckEmailExists from "@/app/middlewares/user/check-email-exists.js";

const CheckEmail = new CheckEmailExists();
const UserAuth = new UserAuthentication();

const UserMiddleWares = { CheckEmail, UserAuth };

export default UserMiddleWares;
