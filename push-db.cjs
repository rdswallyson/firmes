require("dotenv").config();
const { execSync } = require("child_process");
execSync("npx prisma db push --schema=packages/db/prisma/schema.prisma --accept-data-loss", {
  stdio: "inherit",
  env: process.env,
});
