function EventVisualRepresentation(evt)
{
	if (! this instanceof EventVisualRepresentation)
		return new EventsManager();

	this.clickCallback = null;
	this.evt = evt;
	this.rendered = false;
	this.li = null;
	this.attachedTo = null;
};

EventVisualRepresentation.prototype.setClickCallback = function(cb)
{
	this.clickCallback = cb;
};

EventVisualRepresentation.prototype.refresh = function()
{
	this.setLiClasses();
	var list = dc.get(this.attachedTo);
	list.listview('refresh');
};

EventVisualRepresentation.prototype.setLiClasses = function()
{
	if (this.li == null)
		return;

	this.li.removeClass();
	var cssClass = 'unknown-event';
	if (this.evt.return_code == Event.OK) {
		cssClass = 'ok-event';
	} else if (this.evt.return_code == Event.WARNING) {
		cssClass = 'warning-event';
	} else if (this.evt.return_code == Event.CRITICAL) {
		cssClass = 'critical-event';
	}

	this.li.addClass(cssClass);
	this.li.addClass("ui-mini");

};

EventVisualRepresentation.prototype.attach = function(where)
{
	if (this.li != null)
		return;

	var list = dc.get(where);
	this.li = $('<li/>', {
		html: this.getVisualDescription()
	});

	var me = this;
	this.li.click(function(e) {
		if (me.clickCallback == null) {
			return;
		}

		me.clickCallback(me.evt);
		return false;
	});
	this.setLiClasses();
	this.li.prependTo(list);
	list.listview('refresh');
	this.attachedTo = where;
};

EventVisualRepresentation.prototype.getVisualDescription = function()
{
	return this.evt.service_description + ' on host ' + this.evt.host_name;
};

EventVisualRepresentation.prototype.detach = function(from)
{
	if (this.li == null)
		return;

	this.li.detach();
	this.li = null;
	return;
	var me = this;
	this.li.hide(600, function() {
		me.li = null;
		//me.a = null;
	});
};
