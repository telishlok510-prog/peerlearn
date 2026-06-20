import jwt from "jsonwebtoken";

// Creates a signed "login token" (JWT). The frontend stores this and sends it
// with future requests to prove the user is logged in.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;
