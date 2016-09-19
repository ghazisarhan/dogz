'use strict';

class Utils {

	cloneObject(obj) {

		if (obj == null || typeof obj != 'object') {
			return obj;
		}

		var temp = {};
		for (var key in obj) {
			temp[key] = this.cloneObject(obj[key]);
		}

		return temp;
	}

}

module.exports.Utils = Utils;
