
function UpperCounters()
{
	if (! this instanceof UpperCounters)
		return new UpperCounters();

};

UpperCounters.prototype.up = function(evt)
{
	if (evt.return_code == Event.OK) {
		var col = dc.get('#okcount');
		col.text(
		   parseInt(col.text()) + 1
		);
	} else if (evt.return_code == Event.WARNING) {
		var col = dc.get('#warningcount');
		col.text(
		   parseInt(col.text()) + 1
		);
	} else if (evt.return_code == Event.CRITICAL) {
		var col = dc.get('#criticalcount');
		col.text(
		   parseInt(col.text()) + 1
		);
	} else {
		var col = dc.get('#unknowncount');
		col.text(
		   parseInt(col.text()) + 1
		);
	}

};
