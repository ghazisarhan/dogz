function PushManager()
{
	if (! this instanceof PushManager) {
		return new PushManager();
	}

	this.pendingPush = null;
	this.registrationId = null;
	this.registeredCallBack = null;
	this.push = null;
};

PushManager.prototype.register = function(senderId) {

	this.push = PushNotification.init({
		android: {
			senderID: senderId,
			sound: false,
			vibrate: false,
			clearNotifications: true,
			icon: "teste"
		},
		ios: {}, 
		windows: {}
	});

	this.bindPushEvents();
};

PushManager.prototype.setRegisteredCallBack = function(cb) {
	this.registeredCallBack = cb;
};

PushManager.prototype.bindPushEvents = function() {

	var me = this;
	this.push.on('registration', function(data) {
		me.registrationId = data.registrationId;
		if (me.registeredCallBack != null) {
			me.registeredCallBack(data);
		}
	});

	this.push.on('error', function(err) {
		me.receivedPushError(err);
	});

	this.push.on('notification', function(data) {
		me.receivedPushNotification(data);
	});

};

PushManager.prototype.receivedPushError = function(err) {
	// do nothing by now
};

PushManager.prototype.receivedPushNotification = function(data) {
	this.pendingPush = data;
};

PushManager.prototype.unregister = function() {

	if (this.registrationId == null) {
		return;
	}

	this.push.unregister(
		function(){}, 
		function(){}
	);
};
