function NetworkCockpit()
{
	if (! this instanceof NetworkCockpit)
		return new NetworkCockpit();

	this.pushSenderId = "200352441541";
	this.mainInterfaceController = null;
	this.configInterfaceController = null;
	this.eventsManager = null;
	this.deviceuuid = null;
	this.ioSocketManager = null;
};

NetworkCockpit.prototype.run = function()
{
	this.eventsManager = new EventsManager();
	this.configInterfaceController = new ConfigInterfaceController();
	this.mainInterfaceController = new MainInterfaceController();
	this.showInitialPage();
};

NetworkCockpit.prototype.showInitialPage = function()
{
	if (localStorage.getItem('server-address') == null) {
		this.configInterfaceController.show();
		return;
	}

	this.startIOSocket();
	this.startPushManager();
	this.mainInterfaceController.show(
		this.eventsManager,
		this.configInterfaceController
	);
};

NetworkCockpit.prototype.newMessageArrived = function(msg)
{
	var msg = JSON.parse(msg);
	var evt = new Event(msg.content);
	this.eventsManager.addEvent(evt);
};

NetworkCockpit.prototype.startIOSocket = function()
{
	var me = this;
	if (this.ioSocketManager != null) {
		this.ioSocketManager.disconnect();
	}

	this.ioSocketManager = new IOSocketManager(this.eventsManager);
	this.ioSocketManager.setNewMessageCallBack(function(msg) {
		me.newMessageArrived(msg);
	});
	this.ioSocketManager.connect(localStorage.getItem('server-address'));
};

NetworkCockpit.prototype.startPushManager = function()
{
	var me = this;

	this.pushManager = new PushManager();
	this.pushManager.setRegisteredCallBack(function(data) {
		me.ioSocketManager.sendPushRegistrationId(
			data.registrationId
		);
	});
	this.pushManager.register(this.pushSenderId);
};
