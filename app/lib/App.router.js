module.exports = function(_, Backbone, App) {
	return {
		navigate: function(controller_name, cb) {
			controller_name += 'Controller';
			var controller = App[controller_name];
			if (!controller) {
				alert('Controller "' + controller_name + '" not found');
			}
			if (!controller.show) {
				alert('Controller action "' + controller_name + '::show" not defined');
			}
			controller.show(cb);
		}
	};
};