const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();
const INTERNAL_PORTAL_URL = process.env.INTERNAL_PORTAL_URL || 'http://127.0.0.1:8000';

// export default function(req, res, next) {
//     console.log('req', res);
//     console.log('originalUrl', req.originalUrl)
//     // console.log('next', next)
//     // console.log('res', res)
//     if (req.method === 'POST') {
//         proxy.web(req, res, {
//             target: INTERNAL_PORTAL_URL + req.originalUrl
//         })
//     } else {
//         next();
//     }
// }

export default function (req, res, next) {
    // req is the Node.js http request object
    console.log('In middleware', req.url, req.originalUrl)
    if (req.originalUrl.startsWith('/accounts/') && req.method === 'POST') {
        console.log('starts with accounts and is a POST', req.url, req.originalUrl)
        console.log(INTERNAL_PORTAL_URL + req.originalUrl)
        proxy.web(req, res, {
          target: INTERNAL_PORTAL_URL
        }, next)

    } 
    // res is the Node.js http response object
  
    // next is a function to call to invoke the next middleware
    // Don't forget to call next at the end if your middleware is not an endpoint!
    next()
  }
  
// module.exports = { path: '/accounts', handler: app }

// app.get('/say/:word', (req, res) => {
//   res.json(req.params)
// })
