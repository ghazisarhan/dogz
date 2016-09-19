function EventsManager()
{
	if (! this instanceof EventsManager)
		return new EventsManager();

	this.eventsLineGraph = new EventsLineGraph();
	this.upperCounters = new UpperCounters();
	this.onlyHard = false;
	this.totalProblems = 0;
	this.servicesLastStates = {};
	this.eventClickCallback = null;
	this.newEventCallback = null;
};

EventsManager.prototype.setNewEventCallback = function(cb)
{
	this.newEventCallback = cb;
};

EventsManager.prototype.setEventClickCallback = function(cb)
{
	this.eventClickCallback = cb;
};

EventsManager.prototype.updateServiceState = function(evt)
{
	if (this.servicesLastStates[evt.host_name] == undefined) {
		this.servicesLastStates[evt.host_name] = {}
	}

	if (this.servicesLastStates[evt.host_name][evt.service_description] == undefined) {
		evt.setClickCallback(this.eventClickCallback);
		this.servicesLastStates[evt.host_name][evt.service_description] = evt;
		return;
	}

	this.servicesLastStates[evt.host_name][evt.service_description].updateEventData(evt);
};

EventsManager.prototype.processRecovery = function(evt)
{
	// a recovery event may 
	// arrive first than an alert
	if (this.totalProblems > 0) {
		this.totalProblems--;
	}
	evt.detach('#eventslist');
};

EventsManager.prototype.getServiceState = function(evt)
{

	var host = evt.host_name;
	var svc = evt.service_description;
	if (this.servicesLastStates[host][svc] == undefined) {
		throw 'unknown service';
	}

	return this.servicesLastStates[host][svc];
};

EventsManager.prototype.addEvent = function(evt)
{

	if (! evt instanceof Event)
		throw 'Invalid event';

	this.updateServiceState(evt);
	evt = this.getServiceState(evt);
	this.eventsLineGraph.newEvent(evt);
	this.upperCounters.up(evt);

	if (this.newEventCallback != null) {
		this.newEventCallback(evt);
	}

	if (evt.return_code == Event.OK) {
		this.processRecovery(evt);
		return;
	}

	if (this.onlyHard) {
		if (evt.state_type == Event.SOFTSTATE)
			return;

		if (evt.scheduled_downtime_depth != 0)
			return;

		if (evt.problem_has_been_acknowledged != 0)
			return;

		if (evt.notifications_enabled == 0)
			return;

	}
	this.totalProblems++;

	if (evt.isAttachedTo('#eventslist') === true) {
		return;
	}

	evt.attach('#eventslist');

};

EventsManager.prototype.getServicesStatusByHost = function(hostname)
{
	if (this.servicesLastStates[hostname] == undefined) {
		return {};
	}

	return this.servicesLastStates[hostname];
}
