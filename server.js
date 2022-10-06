const app = require('./src/app')

const port = process.env.NODE_ENV === 'ci' ? (process.env.PORT || 80) : 8000;
const server = app.listen(port, () => console.log('Srver Started on ' + port));

module.exports = server;