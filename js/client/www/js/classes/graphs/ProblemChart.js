var ProblemChart = function(placeHolder) {

	this.maxEntries = 30;
	this.entriesCount = 0;

	this.chart = new Highcharts.Chart({
		chart: {
			renderTo: placeHolder,
			type: 'area',
			margin: [5, 0, 3, 20]
		},
		yAxis: {
			title: {
				text: ''
			},
			labels: {
				style: {
					fontSize: '5px'
				}
			}
		},
		title: {
			text: ''
		},
		legend: {
			enabled: false
		},
		plotOptions: {
			series: {
				fillOpacity: 0.1,
				marker: {
					enabled: false
				}
			}
		},
		series: [
			{
				name: 'Problems',
				color: 'red',
				visible: false,
				data: []
			}
		]
		
	}),

	this.addPoints = function(point) {
		var i;
		me = this;

		me.entriesCount++;
		var s = me.chart.series[0];
		var shift = false;
		if (me.entriesCount > me.maxEntries)
			shift = true;

		s.addPoint(point);
	}

}
