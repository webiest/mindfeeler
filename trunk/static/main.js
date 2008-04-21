var globalX;
var globalY;
var globalHover;
var lastHover = 0;
var data_feelObjects;


function init(e){
    $('log').value = '';
    feels_getTop100();
}

function addFeel(e, eventType){

    var x = globalX | e.clientX | 0;
    var y = globalY | e.clientY | 0;
    var keycode = e.charCode | 0;
    var hover = globalHover | 0;
    var qs = 	'eventType=' + eventType +
    			'&x=' + x +
    			'&y=' + y +
    			'&keypress=' + keycode +
    			'&hover=' + hover;

	new Ajax.Request('/touch?' + qs, {
        method: 'get', 
        onSuccess: function(transport){
            
			var feelObj = eval(transport.responseText)[0];

			var statisticsObj = eval(transport.responseText)[1];
            
			log('LOGGED: x: ' + feelObj.x + ', y:' + feelObj.y + ', keypress:' +
            feelObj.keypress + ', hover:' + feelObj.hover);  
            drawDot(feelObj);
            visKeySingle(feelObj);
            $('totalFeels').textContent = 'Total Feels: ' + statisticsObj.totalFeels;
            $('lastText').textContent = 'Last Text:' + statisticsObj.lastText;
        },
        onFailure: function(transport){
            log('ERROR [' + transport.status + ']:' + transport.statusText);
        }
    });
}

function mouse_move(e){
    globalX = e.clientX;
    globalY = e.clientY;
    var timeNow = new Date().getTime();
    if (lastHover != 0) 
        globalHover = timeNow - lastHover;
    else 
        lastHover = timeNow;
    //addFeel(e,'mousemove'); //we could make this 1/2 as heavy by removing the return data
}

function enumObj(o){
    var s = "";
    for (var n in o) {
        s += o[n] + ",";
    }
    return s.substring(0, s.length - 1);
}

function feels_getTop100(){
	$('log').value = 'Getting top 100';
    var qs = 'query=feelsTop100';
    
    new Ajax.Request('/data?' + qs, {
        method: 'get',
        onSuccess: function(transport){
            try {
                data_feelObjects = eval(transport.responseText);
                log('LOADED feels objects [' + data_feelObjects.length + ']')
            } 
            catch (e) {
                log('ERROR while parsing feels data');
                return;
            }
            visualize_click();
            visualize_keypress();
        },
        onFailure: function(transport){
            log('ERROR in feels_getTop100 [' + transport.status + ']:' + transport.statusText);
        }
    });
}

function visualize_click(){
    log('TODO: visualize clicks for ' + data_feelObjects.length + ' feels')
    for (var i = 0; i < data_feelObjects.length; i++) {
        feelObj = data_feelObjects[i];
        if (feelObj.eventType == 'click') 
            drawDot(feelObj);
    }
}

function visualize_keypress(){
    log('TODO: visualize keypress for ' + data_feelObjects.length + ' feels')
    for (var i = 0; i < data_feelObjects.length; i++) {
        feelObj = data_feelObjects[i]
        if (feelObj.eventType == 'keypress' && feelObj.keypress != 0) {
            visKeySingle(feelObj)
        }
    }
}

function visualize_mousemove(){
}

function visKeySingle(feelObj){
    var nickOrIP  = feelObj.username;
    if (nickOrIP.length == 0) 
        nickOrIP = feelObj.ip;
		
	var fontSize = (feelObj.hover / (data_feelObjects.length * 75));
	if(fontSize < 100)
		fontSize = 100;
	else if(fontSize > 500)
		fontSize = 500;
	var newTag = "<span title='keypress by " + nickOrIP +"' style='position:absolute;left:" +
    feelObj.x +
    ";top:" +
    feelObj.y +
    ";color:#" +  str2hex(nickOrIP)  +  
	";font-size:" + fontSize +
    "%'>" +
    String.fromCharCode(feelObj.keypress) +
    "</span>";
	document.body.innerHTML += newTag;
}

function drawDot(feelObj){
	log('DRAWDOT: ' + enumObj(feelObj));
    var nickOrIP  = feelObj.username;
    if (nickOrIP.length == 0) 
        nickOrIP = feelObj.ip;
		
	var fontSize = (feelObj.hover / (data_feelObjects.length * 75));
	if(fontSize < 100)
		fontSize = 100;
	else if(fontSize > 500)
		fontSize = 500;
	
//	var msNow = (new Date().getTime());	
//	var msThen = (new Date(feelObj.date).getTime());
//	var opacity = msThen - msNow;
	var newTag =
	"<span title='click by " + nickOrIP +"' style='position:absolute;left:" + feelObj.x +
    ";top:" + feelObj.y + ";color:#" + str2hex(nickOrIP) +  
	";font-size:" + fontSize + "%" + 
//	"filter:alpha(opacity=" + opacitypct +  ");" +
//	"opacity: " + opacity +
	";'>.</span>";
	document.body.innerHTML += newTag; 
}
var clearLogId = 0;
function log(s){
    $('log').innerHTML = s;
	if(clearLogId > 0)
		window.clearTimeout(clearLogId);
	clearLogId = window.setTimeout(function(){ $('log').innerHTML = ''; }, 3000);
 }

function str2hex(s){
	var n = "";
	var N = 0;
	for(var ch in s)
		n+=ch.charCodeAt(0);
	N=parseInt(n);
	var eos = 6;
	if(s.length < 6)
		eos = s.length;
	return N.toString(16).substring(0, eos);	
}
