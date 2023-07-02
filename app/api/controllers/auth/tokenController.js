const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

// Returns secret only known to server at runtime
exports.getSecret = () => {
  return secret;
};

// Returns token
exports.getToken = (payload, secretOrPrivateKey, options) => {
  // If no options object supplied, make token expire in 24h
  if (!options) {
    options = { expiresIn: "48h" };
  }
  return jwt.sign(payload, secretOrPrivateKey, options);
};

// Returns result of token validation
exports.validateToken = (token, secretOrPrivateKey) => {
  try {
    return jwt.verify(token, secretOrPrivateKey);
  } catch (err) {
    return err;
  }
};

// Returns validation result of token
exports.token_post = (req, res) => {
  res.send(this.validateToken(req.header.Authorization, this.getSecret()));
};

exports.hasPermission = (token, resource) => {
  const result = this.validateToken(token, this.getSecret());
  if (result.name === "JsonWebTokenError") {
    return false;
  } else if (result.permissions) {
    let permissionSet = new Set(result.permissions);
    console.log("permissions in token", JSON.stringify(permissionSet));
    return permissionSet.has(resource);
  } else {
    return false;
  }
};

exports.validate_token = (req, res) => {
  const token = req.get("Authorization");
  const result = this.validateToken(token, this.getSecret());
  if (result.name === "JsonWebTokenError") {
    res.status(200);
    res.json({ valid: false });
  } else {
    res.status(200);
    res.json({ valid: true });
  }
};
