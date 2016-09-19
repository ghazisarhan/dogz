function HostDetailInterfaceController()
{
	if (! this instanceof HostDetailInterfaceController)
		return new HostDetailInterfaceController();

	this.createInterfaceTriggers();
	this.evts = [];
};

HostDetailInterfaceController.prototype.createInterfaceTriggers = function()
{
	var me = this;

	$('#back-from-host-detailed-view').click(function() {
		$.mobile.changePage("#main");
		return false;
	});

	$('#host-cockpit').on("pagebeforehide", function() {
		me.hide()
		return false;
	});
};

HostDetailInterfaceController.prototype.show = function(events)
{
	$.mobile.changePage('#host-cockpit');
	for(var i in events) {
		var svcEvent = events[i];
		this.evts.push(svcEvent);

		svcEvent.attach(
			'#host-cockpit-services-states'
		);
	}

};


HostDetailInterfaceController.prototype.hide = function()
{

	for(var i in this.evts) {
		this.evts[i].detach('#host-cockpit-services-states');
	}

	this.evts = [];
};
