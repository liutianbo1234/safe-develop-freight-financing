var express = require('express');
var app = express();

app.use('/shippingPaymentRegister', express.static('abroad'))
app.get('/', function (req, res) {
  res.sendFile( __dirname + "/index.html" );
})

module.exports = app;
