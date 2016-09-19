function EventDetailInterfaceController()
{
	if (! this instanceof EventDetailInterfaceController)
		return new EventDetailInterfaceController();

	this.evt = null;
	this.createInterfaceTriggers();
};

EventDetailInterfaceController.prototype.createInterfaceTriggers = function()
{
	var me = this;

	dc.get('#activate-event-perf-tab').collapsible({
		expand: function() {
			me.rerenderPerformanceGraph();
			return false;
		}
	});

	dc.get('#activate-event-avail-overview-tab').collapsible({
		expand: function() {
			me.rerenderAvailOverviewGraph();
			return false;
		}
	});

	dc.get('#activate-event-avail-evolution-tab').collapsible({
		expand: function() {
			me.rerenderAvailEvolutionGraph();
			dc.get("#event-state-changes").listview('refresh');
			return false;
		}
	});

	dc.get('#event-back-button').click(function() {
		me.hide();
		return false;
	});
};

EventDetailInterfaceController.prototype.rerenderAvailEvolutionGraph = function()
{
	if (this.evt == null) {
		throw 'null event?';
	}
	this.evt.availEvolutionGraph.rerender();
};

EventDetailInterfaceController.prototype.rerenderAvailOverviewGraph = function()
{
	if (this.evt == null) {
		throw 'null event?';
	}
	this.evt.availOverviewGraph.rerender();
};

EventDetailInterfaceController.prototype.rerenderPerformanceGraph = function()
{
	if (this.evt == null) {
		throw 'null event?';
	}
	this.evt.performanceGraph.rerender();
};

EventDetailInterfaceController.prototype.show = function(evt)
{
	this.evt = evt;

	dc.get('#event-descr').html(
		evt.service_description + ' on ' + evt.host_name
	);

	dc.get('#event-output').html(
		evt.output
	);
	dc.get('#event-last-check').html(
		evt.getLastCheckDateTime()
	);

	evt.performanceGraph.render('#event-perf-graph');
	evt.availOverviewGraph.render('#event-avail-graph-overview');
	evt.availEvolutionGraph.render('#event-avail-graph-evolution');
	this.renderStateChanges();

	$.mobile.changePage("#event-details-cockpit");

	return false;
};

EventDetailInterfaceController.prototype.renderStateChanges = function()
{
	var list = dc.get("#event-state-changes");
	for(var i in this.evt.historicData) {

		var hd = this.evt.historicData[i];
		var d = new Date(hd.timestamp * 1000);
		var li = $('<li/>', {
			html: d.toString()
		});
		this.setLiClasses(li, this.evt.historicData[i])
		li.prependTo(list);
	}
	list.listview({
		create: function() {
			list.listview('refresh');
		}
	});
};

EventDetailInterfaceController.prototype.setLiClasses = function(li, evt)
{
	li.removeClass();
	var cssClass = 'unknown-event';
	if (evt.return_code == Event.OK) {
		cssClass = 'ok-event';
	} else if (evt.return_code == Event.WARNING) {
		cssClass = 'warning-event';
	} else if (evt.return_code == Event.CRITICAL) {
		cssClass = 'critical-event';
	}

	li.addClass(cssClass);
	li.addClass("ui-mini");
};

EventDetailInterfaceController.prototype.hide = function()
{
	if (this.evt == null) {
		throw 'null event?';
	}

	this.evt.performanceGraph.destroy();
	this.evt.availOverviewGraph.destroy();
	this.evt.availEvolutionGraph.destroy();

	dc.get("#event-state-changes").empty();

	$.mobile.changePage("#main");
	return false;
};
