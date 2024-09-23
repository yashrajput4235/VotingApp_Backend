const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    // Check if the request has the Authorization header
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: 'Token not found' });

    // Extract JWT token from Authorization header
    const token = authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request object
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = jwtAuthMiddleware;
