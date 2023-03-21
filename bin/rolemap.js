const ROLE_MAP = {
  "shippingPaymentRegister": "shippingPaymentRegister",
}

function mapToRole(rolePath) {
  var role = ROLE_MAP[rolePath];
  return role ? role : rolePath;
}

module.exports = mapToRole;
