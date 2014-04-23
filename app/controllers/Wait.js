Alloy.Globals.index.add(this.getView());

exports.show = function(){
	$.indicator.show();
	$.wait.visible = true;
};

exports.hide = function(){
	$.wait.visible = false;
	$.indicator.hide();
};
