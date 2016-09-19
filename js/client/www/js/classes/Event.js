/**
 * represents an event. it may be an
 * ok, warning, critical or unknown
 * event.
 */
function Event(rawObject)
{
	if (! this instanceof Event) {
		return new Event(rawObject);
	}

	this.views = [];
	this.metrics = [];
	this.performanceGraph = new EventPerformanceGraph(this);
	this.availOverviewGraph = new EventAvailOverviewGraph(this);
	this.availEvolutionGraph = new EventAvailEvolutionGraph(this);
	this.metricsParser = new MetricsParser(this);
	this.clickCallBack = null;
	this.output_array = [];
	this.maxHistoricData = 20;
	this.historicData = [];
	this.attachedTo = {};

	// set basic properties to null
	for(var prop in Event.basicProperties) {
		var name = Event.basicProperties[prop];
		this[name] = null;
	}

	if (rawObject == undefined) {
		return;
	}

	this.updateEventData(rawObject);
};

Event.prototype.parseMetrics = function()
{
	return this.metricsParser.parse();
};

Event.prototype.getLastCheckDateTime = function()
{
	var date = new Date(this.timestamp * 1000);
	return date.toLocaleTimeString()
};

/**
 * overwrite event basic properties
 * based on another event
 */
Event.prototype.updateEventData = function(rawObject)
{

	if (
	    rawObject.return_code > Event.UNKNOWN ||
	    rawObject.return_code < Event.OK
	) {
		rawObject.return_code = Event.UNKNOWN;
	}

	for(var prop in Event.basicProperties) {
		var name = Event.basicProperties[prop];
		this[name] = rawObject[name];
	}

	// update views
	for(var i in this.views) {
		this.views[i].refresh();
	}

	this.manageHistoricData(rawObject)
	this.performanceGraph.rerender();
	this.availOverviewGraph.rerender();
	this.availEvolutionGraph.rerender();
};

Event.prototype.manageHistoricData = function(rawObject)
{
	if (
	    rawObject.historicData == undefined ||
	    rawObject.historicData.length == 0
	) {
		this.pushHistoricData(rawObject);
		return;
	}

	for(var i in rawObject.historicData) {
		this.pushHistoricData(rawObject.historicData[i]);
	}
};

Event.prototype.pushHistoricData = function(rawObject)
{
	var obj = {};
	for(var prop in Event.basicProperties) {
		var name = Event.basicProperties[prop];
		obj[name] = rawObject[name];
	}

	this.historicData.push(obj);
	if (this.historicData.length > this.maxHistoricData)
		this.historicData.shift();
};

/**
 * set callback for when user clicks on any 
 * event's view representation
 */
Event.prototype.setClickCallback = function(cb)
{
	this.clickCallBack = cb;
	for(var i in this.views) {
		this.views[i].setClickCallback(cb);
	}
};


/**
 * return an unique identifier for this event,
 * by now it is a string merging host_name and 
 * service_description
 */
Event.prototype.getUniqueIndex = function()
{
	return this.host_name + '-' + this.service_description;
};

/**
 * attach a new view representation to
 * an html list(<ul>)
 */
Event.prototype.attach = function(where, onlyOnce)
{
	var vis = new EventVisualRepresentation(this);
	vis.setClickCallback(this.clickCallBack);
	vis.attach(where);
	this.views.push(vis);
	this.attachedTo[where] = true;
};

/**
 * return if event is attached to a <ul>
 */
Event.prototype.isAttachedTo = function(to)
{
	return (this.attachedTo[to] != undefined);
};

/**
 * removes the event view representations
 * attached to 'from' html list(<ul>)
 */
Event.prototype.detach = function(from)
{
	for(var i in this.views) {
		if (this.views[i].attachedTo != from) {
			continue;
		}
		this.views[i].detach();
		delete this.views[i];
	}

	delete this.attachedTo[from];
};

Event.OK = 0;
Event.WARNING = 1;
Event.CRITICAL = 2;
Event.UNKNOWN = 3;
Event.SOFTSTATE = 0;
Event.HARDSTATE = 1;
Event.basicProperties = [
	'scheduled_downtime_depth',
	'host_name',
	'timestamp',
	'service_description',
	'state_type',
	'output',
	'return_code',
	'perf_data',
	'current_attempt',
	'state',
	'notifications_enabled'
];

