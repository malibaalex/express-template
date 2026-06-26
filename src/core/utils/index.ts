import PasswordUtils from "@/core/utils/password-utils.js";
import omitProperty from "@/core/utils/omit-property.js";
import TokenUtils from "@/core/utils/token.js";
import port from "@/core/utils/port.js";

const Password = new PasswordUtils();
const Token = new TokenUtils();

/**
 * Aggregated Utility object used by the Base class.
 * Note: .js extensions are mandatory for NodeNext resolution.
 */
const Util = {
  port,
  omitProperty,
  Password,
  Token,
} as const;

export default Util;
