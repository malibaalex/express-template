import UserValidators from "@/app/validators/user/index.js";
import IdValidator from "@/app/validators/validator-id.js";

const Id = new IdValidator();

const Validators = { UserValidators, Id };

export default Validators;
