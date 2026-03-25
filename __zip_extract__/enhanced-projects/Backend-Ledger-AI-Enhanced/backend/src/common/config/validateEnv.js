// Environment variable validation using envalid (like POSTFEED)
const { cleanEnv, str, port, url } = require("envalid");

function validateEnv() {
  cleanEnv(process.env, {
    MONGO_URI: url(),
    PORT: port({ default: 3000 }),
    JWT_SECRET: str(),
    // Add other required env vars here
  });
}

module.exports = validateEnv;
