function Metric()
{
	if (! this instanceof Metric) {
		return new Metric();
	}

	this.name = null;
	this.value = null;
	this.unit = null;
	this.warning = null;
	this.critical = null;
	this.min = null;
	this.max = null;
};
