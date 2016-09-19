function MainInterfaceController()
{
	if (! this instanceof MainInterfaceController)
		return new MainInterfaceController();

	this.socket = null;
	this.eventsManager = null;
	this.hostsOnHostsSelection = [];
	this.configInterfaceController = null;
	this.eventDetailInterfaceController = new EventDetailInterfaceController();
	this.hostDetailInterfaceController = new HostDetailInterfaceController();
};

MainInterfaceController.prototype.show = function(eventsManager, configController)
{

	this.setEventsManager(eventsManager);
	this.configInterfaceController = configController;

	this.createInterfaceTriggers();
	$.mobile.defaultPageTransition = 'none';
	$.mobile.changePage("#main");
};

MainInterfaceController.prototype.setEventsManager = function(em)
{
	var me = this;

	this.eventsManager = em;
	this.eventsManager.eventsLineGraph.render(
		'#event-graphs-container'
	);

	this.eventsManager.setEventClickCallback(function(evt) {
		me.eventDetailInterfaceController.show(evt);
	});

	this.eventsManager.setNewEventCallback(function(evt) {
		me.addOptionToHostsSelection(evt);
	});
};

MainInterfaceController.prototype.createInterfaceTriggers = function()
{
	var me = this;

	$('#select-hosts').change(function() {
		me.goToHostDetailedView();
		return false;
	});
	$('#reset-configuration').click(function() {
		me.configInterfaceController.show();
		return false;
	});
};

MainInterfaceController.prototype.addOptionToHostsSelection = function(evt)
{

	if (this.hostsOnHostsSelection.indexOf(evt.host_name) >= 0) {
		return;
	}

	this.hostsOnHostsSelection.push(evt.host_name);

	var opt = $('<option/>');
	opt.attr({'value': evt.host_name}).text(evt.host_name);
	dc.get('#select-hosts').append(opt);
};

MainInterfaceController.prototype.goToHostDetailedView = function()
{
	var host =  dc.get('#select-hosts').val();
	if (host == '*') {
		return;
	}

	this.hostDetailInterfaceController.show(
		this.eventsManager.getServicesStatusByHost(host)
	);

	dc.get('#select-hosts').prop('selectedIndex', 0);
	dc.get('#select-hosts').selectmenu('refresh');

};
