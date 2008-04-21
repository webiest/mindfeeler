var globalX;
var globalY;
var globalHover;

function init(e){
	$('log').value='';
	//addFeel(e,'load');
	//window.setInterval(null,visualize.renderClick,5000);
	feels_getTop100()
}
function addFeel(e, eventType) {
	
var x = globalX|e.clientX|0;
var y = globalY|e.clientY|0;
var keycode = e.charCode|0;
var hover = globalHover|0;

var qs = 'eventType='+eventType+'&x='+x+'&y='+y+'&keypress='+keycode+'&hover='+hover;

	
new Ajax.Request('/touch?' + qs, {
	method: 'get',
	onSuccess: function(transport) {
	var feelObj = eval(transport.responseText)[0];
	var statisticsObj = eval(transport.responseText)[1];
//	log('LOGGED: ' + enumObj(feelObj));
	log('LOGGED: x: ' + feelObj.x + ', y:' + feelObj.y + ', keypress:' + feelObj.keypress + ', hover:' + feelObj.hover);
	drawDot(feelObj.x, feelObj.y, feelObj.hover);
	$('totalFeels').textContent = 'Total Feels: ' + statisticsObj.totalFeels;
	$('lastText').textContent = 'Last Text:' + statisticsObj.lastText; 
	},
	onFailure: function(transport) {
	  log('ERROR [' + transport.status + ']:' + transport.statusText);
	}
});
}



function log(s){
	$('log').value+=s+'\n';
	var oldScrollTop = $('log').scrollTop;
	$('log').selectionStart = $('log').value.length;
	$('log').scrollTop = oldScrollTop;
}


var lastHover = 0;
function mouse_move(e){
	globalX = e.clientX;
	globalY = e.clientY;
	var timeNow = new Date().getTime();
	if(lastHover != 0)
		globalHover = timeNow - lastHover;
	else
		lastHover = timeNow;
	//addFeel(e,'mousemove');
}


function enumObj(o){
	var s = "";
	for(var n in o){
		s+=o[n] + ","; 
	}
	return s.substring(0,s.length-1);
}
