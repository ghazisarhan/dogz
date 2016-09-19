"use strict";

var Middleware = require('./classes/Middleware').Middleware;
var app = new Middleware();
app.setBrokerAddress("tcp://127.0.0.1:6969");
app.run();
