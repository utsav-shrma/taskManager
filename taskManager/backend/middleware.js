const jwt = require('jsonwebtoken');
const secret = 'my-secret-key';
const User = require('./userModel');

async function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try{

      const payload = jwt.verify(token, secret);
      //req.user = payload;
       //if user exists with the given id 
      const userdetail = await User.findById( payload.userId );
      if (!userdetail) {
        return res.status(401).json({ error: 'User Does not exist' });
      }
      req.user = userdetail;
      next();
      }
    catch(err){

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: ' token expired' });
      }

      return res.status(403).json({ error: 'Invalid token' });
    }


   
  }

  function authorize(role) {
    return (req, res, next) => {
      // Check if the user is authenticated and has the required role
      if (req.user && req.user.role === role) {
        console.log(role);
        console.log(req.user.role);
        return next(); // User has the required role, proceed to the next middleware/route
      }
  
      return res.status(403).json({ message: 'Forbidden' }); // User does not have the required role, deny access
    };
    
  }

  module.exports = {authenticateToken,authorize};
