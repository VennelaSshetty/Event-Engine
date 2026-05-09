const crypto = require("crypto");

function generateApiKey() {
  return "sk_test_" + crypto.randomBytes(16).toString("hex");
}

module.exports = generateApiKey;