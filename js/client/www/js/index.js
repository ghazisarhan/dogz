var dc = new DOMCacher();

document.addEventListener(
	'deviceready',
	function() {
		var app = new NetworkCockpit()
		app.run();
	},
	false
);
