function EventAvailEvolutionGraph(evt)
{
	if (! this instanceof EventAvailEvolutionGraph) {
		return new EventAvailEvolutionGraph(evt);
	}

	this.evt = evt;
	this.chart = null;
	this.renderedTo = null;
	this.x = 0;
};

EventAvailEvolutionGraph.prototype.rerender = function()
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

EventAvailEvolutionGraph.prototype.destroy = function()
{
	if (this.chart == null) {
		return;
	}

	this.chart.detach();
	this.renderedTo = null;
	this.chart = null;
};

EventAvailEvolutionGraph.prototype.mountStateChangesArray = function()
{
	var i;
	var o = null;
	var seriesArray = [];
	var prev = null;
	var cur = null;
	var graphWidth = null;
	var totalTime = null;
	var duration = null;
	var durationpixels = null;

	if (this.evt.historicData.length == 0) {
		return seriesArray;
	}

	totalTime = this.calculeTotalTime();
	graphWidth = this.calculeGraphWidth();

	for(i=0; i<this.evt.historicData.length; i++) {

		cur = this.evt.historicData[i];
		if (prev == null) {
			lastStateChange = cur;
			prev = cur;
			continue;
		}

		if (cur.return_code == prev.return_code) {
			continue;
		}

		duration = cur.timestamp - prev.timestamp;
		durationpixels = Math.floor((duration * graphWidth) / totalTime);
		o = {
			timestamp: prev.timestamp,
			value: prev.return_code,
			duration: cur.timestamp - prev.timestamp,
			pixels: durationpixels
		};

		seriesArray.push(o);
		prev = cur;
		lastStateChange = cur;
	}

	duration = this.renderTime - lastStateChange.timestamp;
	durationpixels = Math.floor((duration * graphWidth) / totalTime);
	o = {
		timestamp: lastStateChange.timestamp,
		value: cur.return_code,
		duration: duration,
		pixels: durationpixels
	};
	seriesArray.push(o);

	return seriesArray;
};

EventAvailEvolutionGraph.prototype.render = function(where)
{
	if (this.chart != null) {
		return;
	}

	var me = this;	
	this.x = 0;
	this.renderedTo = where;
	this.chart = new Chartist.Line(where,{
		series: [ 
			{
				name: 'state-changes',
				data: this.mountStateChangesArray()
			}
		]
	},{
		showLine: false,
		axisX: {
			offset: 10
		},
		axisY: {
			offset: 10,
			labelInterpolationFnc: function(value) {
				return '';
			}
		}
	});

	this.chart.on('draw', function(data) {
		if (data.type != 'point') {
			return;
		}

		var r = me.drawBox(data);
		data.element.replace(r);
	});

};

EventAvailEvolutionGraph.prototype.calculeGraphWidth = function() {
	return parseInt(screen.width * 0.9)
};

EventAvailEvolutionGraph.prototype.calculeTotalTime = function() {

	if (this.evt.historicData.length == 0) {
		return 0;
	}

	this.renderTime = Math.floor(Date.now()/1000);
	var lastpos = this.evt.historicData.length - 1;
	if (this.renderTime <= this.evt.historicData[lastpos].timestamp) {
		// clocks out of sync!
		this.renderTime = this.evt.historicData[lastpos].timestamp + 5;
	}

	return this.renderTime - this.evt.historicData[0].timestamp;
};

EventAvailEvolutionGraph.prototype.drawBox = function(data) {
	var point = data.series.data[data.index]

	var color = '#ff9900';
	switch(point.value) {

	case Event.WARNING:
		color = '#ffff00';
		break;

	case Event.OK:
		color = '#00ff00';
		break;

	case Event.CRITICAL:
		color = '#ff0000';
		break;

	}

	var prevX = this.x;
	this.x += point.pixels;
	return new Chartist.Svg('path', {
		d: [
			'M', prevX, 0,
			'L', prevX, 130,
			'L', this.x, 130,
			'L', this.x, 0,
			'Z'
		].join(' '),
		style: 'fill: '+color+'; fill-opacity: 0.9;'
	}, 'ct-area');

};
