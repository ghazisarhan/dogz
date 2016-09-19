function EventPerformanceGraph(evt)
{
	if (! this instanceof EventPerformanceGraph)
		return new EventPerformanceGraph(evt);

	this.evt = evt;
	this.chart = null;
	this.renderedTo = null;
};

EventPerformanceGraph.prototype.destroy = function()
{
	if (this.chart == null) {
		return;
	}

	this.chart.detach();
	this.renderedTo = null;
	this.chart = null;
};

EventPerformanceGraph.prototype.render = function(where)
{

	var i;
	if (this.chart != null) {
		return;
	}

	var entries = this.evt.parseMetrics();
	if (entries.length == 0) {
		return;
	}

	this.renderedTo = where;
	if (entries.length == 1) {
		return this.renderBarGraph(where, entries[0]);
	}

	return this.renderHistoricGraph(where, entries);
};

EventPerformanceGraph.prototype.rerender = function()
{
	if (this.chart == null) {
		return;
	}

	if (dc.get(this.renderedTo).is(":visible") == false)
		return;

	var origPlace = this.renderedTo;
	this.destroy();
	this.render(origPlace);
};

EventPerformanceGraph.prototype.renderHistoricGraph = function(where, entries)
{
	var i;
	var j;
	var ticks = [];
	var values = [];

	for(i in entries) {

		var entry = entries[i];
		ticks.push(
			entry.time.getHours() + ":" + 
			entry.time.getMinutes() + ":" + 
			entry.time.getSeconds()
		);

		for(j=0; j<entry.data.length; j++) {
			if (values[j] == undefined) {
				values[j] = [];
			}

			values[j].push(parseFloat(entry.data[j].value));
		}

	}

	this.chart = new Chartist.Line(where, {
		series: values
	}, {
		showArea: true,
		showPoint: false,
		fullWidth: true,
		axisY: {
			offset: 20,
		},
	});

};

EventPerformanceGraph.prototype.renderBarGraph = function(where, entry)
{

	var labels = [];
	var series = [];
	var i;
	for(i=0; i<entry.data.length; i++) {
		var m = entry.data[i];
		labels.push(m.name);
		series.push(parseFloat(m.value));
	}

	this.chart = new Chartist.Bar(where, {
		labels: labels,
		series: series
	}, {
		axisY: {
			offset: 20,
		},
		distributeSeries: true
	});

};
