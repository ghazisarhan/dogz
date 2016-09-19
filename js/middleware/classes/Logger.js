'use strict';

class Logger {

	print(context, msg) {
		if (context.verbose == undefined)
			return;

		if (context.verbose == false)
			return;

		console.log(msg);
	}

}

module.exports.Logger = Logger;
