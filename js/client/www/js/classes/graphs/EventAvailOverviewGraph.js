function EventAvailOverviewGraph(evt)
{
	if (! this instanceof EventAvailOverviewGraph) {
		return new EventAvailOverviewGraph(evt);
	}

	this.chart = null;
	this.renderedTo = null;
	this.evt = evt;
	this.totalTime = 0;
	this.counters = [];
	this.zeroCounters();
};

EventAvailOverviewGraph.prototype.zeroCounters = function() {
	this.totalTime = 0;
	this.counters = [
		{
			pct: 0,
			time: 0
		},
		{
			pct: 0,
			time: 0
		},
		{
			pct: 0,
			time: 0
		},
		{
			pct: 0,
			time: 0
		}
	];
};

EventAvailOverviewGraph.prototype.rerender = function()
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

EventAvailOverviewGraph.prototype.destroy = function()
{
	if (this.chart == null) {
		return;
	}

	this.chart.detach();
	this.renderedTo = null;
	this.chart = null;
};

EventAvailOverviewGraph.prototype.render = function(where)
{
	if (this.chart != null) {
		return;
	}

	this.zeroCounters();
	this.calculateValuesPerState();

	var data = {
		series: [
			this.counters[Event.OK].pct,
			this.counters[Event.WARNING].pct,
			this.counters[Event.CRITICAL].pct,
			this.counters[Event.UNKNOWN].pct
		]
	};

	this.renderedTo = where;
	this.chart = new Chartist.Pie(where, data, {
		donut: true,
		startAngle: 270,
		total: 200,
		showLabel: false,
	});
};

EventAvailOverviewGraph.prototype.calculateValuesPerState = function()
{
	this.sumTimePerState();
	if (this.totalTime == 0) {
		return;
	}

	this.statesToPct();
};

EventAvailOverviewGraph.prototype.statesToPct = function()
{
	var i;
	if (this.totalTime == 0) {
		return;
	}

	for(i=0; i<=3; i++) {
		this.counters[i].pct = (this.counters[i].time * 100) / this.totalTime;
	}
};

EventAvailOverviewGraph.prototype.sumTimePerState = function()
{
	if (this.evt.historicData.length == 0) {
		return;
	}

	var i;
	var previous = null;
	var current;
	for(i=0; i<this.evt.historicData.length; i++) {

		current = this.evt.historicData[i];
		if (previous == null) {
			previous = current;
			continue;
		}

		var diff = current.timestamp - previous.timestamp;
		this.counters[previous.return_code].time += diff;
		this.totalTime += diff;

		previous = current;
	}

	var now = Math.floor(Date.now() / 1000);
	if (now < current.timestamp) {
		// clock from cell and server are
		// not in sync, let's just show a 
		// small change
		now = current.timestamp + 5;
	}

	var diff = now - current.timestamp;
	this.counters[current.return_code].time += diff;
	this.totalTime += diff;
};
