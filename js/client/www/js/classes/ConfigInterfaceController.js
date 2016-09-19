function ConfigInterfaceController()
{
	if (! this instanceof ConfigInterfaceController)
		return new ConfigInterfaceController()

	this.triggersCreated = false;

};

ConfigInterfaceController.prototype.show = function()
{
	if (this.triggersCreated == false) {
		this.createInterfaceTriggers();
	}

	$.mobile.changePage("#login");
};

ConfigInterfaceController.prototype.setMiddlewareConfiguration = function()
{

	var addressfield = dc.get('#addressfield');
	if (addressfield.val() == "") {
		alert('Middleware address field is mandatory');
		return;
	}

	localStorage.setItem('server-address', addressfield.val());
	location.reload();
};

ConfigInterfaceController.prototype.createInterfaceTriggers = function()
{
	var me = this;
	this.triggersCreated = true;
	$('#register-address').click(function() {
		me.setMiddlewareConfiguration();
		return false;
	});
};
