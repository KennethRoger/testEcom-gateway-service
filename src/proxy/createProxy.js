const { createProxyMiddleware } = require("http-proxy-middleware");
function createProxy(target, pathRewrite = { "^/api/": ""}) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite
  });
}

module.exports = createProxy;