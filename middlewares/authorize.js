const authorize = (...roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next(); // 角色匹配，允許存取
        } else {
            res.status(403).json({ message: "Access denied" });
        }
    };
  };
  
  module.exports = authorize;
  