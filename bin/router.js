const routeConfig = {
  "/shippingPaymentRegister": "shippingPaymentRegister/index.html",
};

function route(role, logger) {
  var filePath = routeConfig[role];
  if (!filePath) {
    logger.warn(`unknown role ${role}`);
    filePath = "public/404.html";
  }
  return filePath;
}

module.exports = route;
