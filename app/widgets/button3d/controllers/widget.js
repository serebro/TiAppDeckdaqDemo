var args = arguments[0] || {};

$.addClass($.button, args.style);

$.label.setText(args.text);

$.button.addEventListener('click', function(e){
    $.trigger('click', e);
});  

$.button.addEventListener('touchstart',function () {
    $.addClass($.label, 'active');
});

$.button.addEventListener('touchend',function () {
    $.removeClass($.label, 'active');
});
