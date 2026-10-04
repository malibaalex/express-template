import { execSync } from "node:child_process";

const setup = () => {
  execSync("pnpm prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });
};

export default setup;
