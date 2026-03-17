const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Token comes in the header: "Authorization: Bearer eyJhbG..."
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token, access denied' });
    }

    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId to the request so routes can use it
    req.userId = decoded.userId;

    next(); // move on to the actual route handler

  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;