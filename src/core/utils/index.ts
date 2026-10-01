import PasswordUtils from "./password-utils.js";
import omitProperty from "./omit-property.js";
import { env } from "./env-utils.js";
import TokenUtils from "./token.js";
import { CookieUtils } from "./coockie-util.js";
import port from "./port.js";

const Password = new PasswordUtils();
const Token = new TokenUtils(env);
const Cookie = new CookieUtils(env);

const Util = {
  port,
  omitProperty,
  Password,
  Token,
  Cookie,
} as const;

export default Util;
