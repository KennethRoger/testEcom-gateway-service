const jwt = require("jsonwebtoken");

const throwError = require("../utils/errorObject");
const HttpStatus = require("../utils/httpStatusCodes");

function authorize(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const requiredRole = roles;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(throwError("Auth token not provided", HttpStatus.UNAUTHORIZED));
    }
    
    const token = authHeader.split(" ")[1].trim();
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userRole = decoded.role;
  
      if (!requiredRole.includes(userRole)) {
        return next(throwError("Forbidden access!", HttpStatus.FORBIDDEN));
      }

      req.user = decoded;
      next();
    } catch (err) {
      return next(throwError("Invalid or expired token", HttpStatus.FORBIDDEN));
    }
  }
}

module.exports = { authorize };