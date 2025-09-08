const { createProxyMiddleware } = require("http-proxy-middleware");

function createProxy(target, pathRewrite = { "^/api": "" }) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req, res) => {
        if (req.user) {
          proxyReq.setHeader('x-user-id', req.user._id);
          proxyReq.setHeader('x-user-role', req.user.role);
        }
      }
    }
  });
}

module.exports = createProxy;
