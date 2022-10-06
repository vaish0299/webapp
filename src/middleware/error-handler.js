module.exports = errorHandler;

function errorHandler(err, res, res, next) {
    console.log(err)
    switch (true) {
        case typeof err === 'string':
            const is404 = err.toLowerCase().endsWith('not found');
            const isUserAlreadyPresent = err.toLowerCase().includes('is already registered');
            let statusCode = is404 ? 404 : 400;
            statusCode = isUserAlreadyPresent ? 400 : 404;
            return res.status(statusCode).json({ message: err });
        case err.name === 'UnauthorizedError':
            return res.status(401).json({ message: 'Unauthorized' });
        default:
            return res.status(500).json({ message: err.message });
    }
}