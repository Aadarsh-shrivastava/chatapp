const adminOnlyMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // User is admin, proceed to the next middleware or route handler
  } else {
    res.status(403); // Forbidden
    throw new Error("Access denied, admin privileges required");
  }
};

export default adminOnlyMiddleware;
