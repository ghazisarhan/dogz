"use strict";

if (process.env.server == undefined) {
	console.log("Environment variable `server' not set, bailing out.");
	process.exit(1);
}

console.log("Going to connect on " + process.env.server);

var Middleware = require('./classes/Middleware').Middleware;
var app = new Middleware();
app.setBrokerAddress(process.env.server);
app.run();
