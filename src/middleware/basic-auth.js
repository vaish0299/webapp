const userService = require('../../src/user/user-service');
module.exports = authorize;

async function authorize(req, res, next) {

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    try{
        const  user = await userService.authenticate({ username, password});
        if (!user) {
            return res.status(401).json({ message: 'Invalid Authentication Credentials' });
        }
    
        req.user = user
        next();
    }catch(err){
        res.sendStatus(401)
        return;
    }
  

}