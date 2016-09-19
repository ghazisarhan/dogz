function MetricsParser(evt)
{
	if (! this instanceof MetricsParser) {
		return new MetricsParser(evt);
	}
	this.evt = evt;
};


/**
 * expected dirty value is: <metricname>=<value><unit>
 */
MetricsParser.prototype.parseDirtyValueString = function(metric, dirtyValue)
{
	var valueRegex = new RegExp("^([^=]+)=([0-9\.]+)(.*)$");
	var valueSlices = valueRegex.exec(dirtyValue);

	if (valueSlices[1] != undefined) {
		metric.name = valueSlices[1];
	}
	if (valueSlices[2] != undefined) {
		metric.value = valueSlices[2];
	}
	if (valueSlices[3] != undefined) {
		metric.unit = valueSlices[3];
	}
};

MetricsParser.prototype.parse = function()
{

	var i;
	var entries = [];
	for(i in this.evt.historicData) {

		var entry = this.evt.historicData[i];
		var parsedEntry = {
			time: new Date(entry.timestamp),
			data: this.parseEntry(entry.perf_data)
		};
		entries.push(parsedEntry);
	}

	return entries;
};

MetricsParser.prototype.parseEntry = function(pdata)
{
	var metricsStr = this.splitPerfData(pdata);

	var metrics = [];
	for(var i=0; i<metricsStr.length; i++) {

		var slices = metricsStr[i].split(';');
		var m = new Metric();

		for(var pos=0; pos<slices.length; pos++) {

			switch(pos) {

			case MetricsParser.VALUE:
				this.parseDirtyValueString(m, slices[pos]);
				break;
			case MetricsParser.WARNING:
				m.warning = slices[pos];
				break;
			case MetricsParser.CRITICAL:
				m.critical = slices[pos];
				break;
			case MetricsParser.MIN:
				m.min = slices[pos];
				break;
			case MetricsParser.MAX:
				m.max = slices[pos];
				break;
			default:
				break;
			}

		}

		metrics.push(m);
	}

	return metrics;
};

MetricsParser.prototype.splitPerfData = function(mtrstr)
{

	var ret = [];
	var rgx = /([^=]+=[^$ ]+)/g;
	var matches = rgx.exec(
		mtrstr
	);

	if (matches == null)
		return [];


	metric = matches[1];
	mtstr = mtrstr.substr(metric.length);

	metric = metric.trim();
	ret.push(metric);
	
	ret = ret.concat(
		this.splitPerfData(mtstr)
	);
	return ret;
};

MetricsParser.VALUE = 0;
MetricsParser.WARNING = 1;
MetricsParser.CRITICAL = 2;
MetricsParser.MIN = 3;
MetricsParser.MAX = 4;
