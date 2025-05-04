module.exports = (role) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          message: 'Unauthenticated',
          errors: { auth: ['You must be logged in'] }
        });
      }
  
      if (req.user.role !== role) {
        return res.status(403).json({
          message: 'Unauthorized',
          errors: { role: ['You do not have the required permissions'] }
        });
      }
  
      next();
    };
  };