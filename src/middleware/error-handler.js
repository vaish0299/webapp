module.exports = errorHandler;

function errorHandler(err, res, res, next) {
    switch (true) {
        case typeof err === 'string':
            const is404 = err.toLowerCase().endsWith('not found');
            const userNotFound = err.includes('User is not present');
            const isUserAlreadyPresent = err.toLowerCase().includes('is already registered');
            const userForbidden = err.toLowerCase().includes('change user name');
            const bad = err.toLowerCase().includes('bad');
            const docNotAccessible = err.includes('Document is not accessible');
            const docNotAvailable = err.includes('Document not available');
            const docDeleteNotAccessible = err.includes('You cannot delete this document');
            const unAuthorized = "Unauthorized";
            const notVerified = err.includes("User Not Verified");

            let statusCode;
            if(is404 || userNotFound || docNotAvailable) {
                statusCode = 404;
            } else if (isUserAlreadyPresent || bad) {
                statusCode = 400;
            }else if(userForbidden || docNotAccessible || docDeleteNotAccessible || unAuthorized || notVerified){
                statusCode = 403;
            }
            return res.status(statusCode).json({ message: err });
        case err.name === 'UnauthorizedError':
            return res.status(401).json({ message: 'Unauthorized' });
        default:
            return res.status(500).json({ message: err.message });
    }
}