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
    document.body.innerHTML += "<span style='position:absolute;left:" +
    feelObj.x +
    ";top:" +
    feelObj.y +
    ";font-size:" +
    (feelObj.hover / 200) +
    "%'>" +
    String.fromCharCode(feelObj.keypress) +
    "</span>";
}

function drawDot(feelObj){
    //lemme
    log('DRAWDOT: ' + feelObj.x + ',' + feelObj.y + ',' + hover)
    var nick = feelObj.username;
    if (nick.length == 0) 
        nick = feelObj.ip;//ok u go
    document.body.innerHTML += "<span style='position:absolute;left:" +
    feelObj.x +
    ";top:" +
    feelObj.y +
    ";'>" +
    nick +
    "</span>";
}

function log(s){
    $('log').value += s + '\n';
    $('log').scrollTop = $('log').scrollHeight;
}
