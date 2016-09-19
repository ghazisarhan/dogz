function EventsLineGraph()
{
	if (! this instanceof EventsLineGraph)
		return new EventsLineGraph();

	this.chart = null;
	this.eventsDelta = [0,0,0,0];
	this.maxEntries = 60;
	this.historicDataArrays = [];
	this.plot = true;

	var me = this;
	setInterval(
		function() {
			me.refresh();
		},
		1000
	);
	
};

EventsLineGraph.prototype.createHistoricZeroedArray = function()
{
	var i;
	var arr = [];
	for(i=0; i<this.maxEntries; i++) {
		arr.push(0);
	}
	return arr;
};


EventsLineGraph.prototype.createHistoricArrays = function()
{
	var i;
	var j;
	var data = [];
	for(i=0; i<=3; i++) {
		this.historicDataArrays[i] = this.createHistoricZeroedArray();
	}
};

EventsLineGraph.prototype.render = function(where)
{

	if (this.chart != null) {
		return;
	}

	this.createHistoricArrays();

	this.chart = new Chartist.Bar(where, {
		labels: [],
		series: [
			this.historicDataArrays[0],
			this.historicDataArrays[1],
			this.historicDataArrays[2],
			this.historicDataArrays[3]
		]
	}, {
		seriesBarDistance: 10,
		stackBars: true,
		axisX: {
			offset: 10
		},
		axisY: {
			offset: 20,
			labelInterpolationFnc: function(value) {
				if (value != parseInt(value, 10)) {
					return '';
				}

				return value;
			}
		}
	}).on('draw', function(data) {
		data.element.attr({
			style: 'stroke-width: 5px'
		});
	});

};

EventsLineGraph.prototype.refresh = function()
{

	var i;
	if (this.chart == null) {
		return;
	}

	var dt = [];
	for(i in this.eventsDelta) {

		var val = this.eventsDelta[i];
		if (this.plot == false) {
			val = this.historicDataArrays[i][this.maxEntries - 1];
		}

		this.historicDataArrays[i].push(val);
		this.historicDataArrays[i].shift();
	}

	this.chart.update();
	this.eventsDelta = [0,0,0,0];
	this.plot = false;
};

EventsLineGraph.prototype.newEvent = function(evt)
{
	this.plot = true;
	this.eventsDelta[evt.return_code]++;	
};
