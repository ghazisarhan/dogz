'use strict';

class Message {

	constructor(rawObj) {
		this.content = null;
		this.type = null;

		if (rawObj != undefined) {
			for(var prop in rawObj) {
				this[prop] = rawObj[prop];
			}
			return;
		}
	}

	setType(type) {
		this.type = type;
	}

	setContent(content) {
		this.content = content;
	}

	convertToJson() {
		return JSON.stringify(this);
	}

}

module.exports.Message = Message;
