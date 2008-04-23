var globalX;
var globalY;
var globalHover;
var lastHover = 0;


function init(e){
	visualize_clicks();
	visualize_keypresses();
	document.body.style.cursor = "crosshair";
	$('waitText').innerHTML = ('Ready to <span class="wow">interact!</span>');
	setTimeout(function(){$('waitText').style.display='none';$('greeting').style.display='block';}, 5000);
}

var lastFeltDate;
function addFeel(e, eventType){

    var x = globalX | e.clientX | 0;
    var y = globalY | e.clientY | 0;
    var keypress = e.charCode | 0;
    var hover = globalHover | 0;
    var qs = 	'eventType=' + eventType +
    			'&x=' + x +
    			'&y=' + y +
    			'&keypress=' + keypress +
    			'&hover=' + hover;

	var localFeelObj = {'x':x,'y':y,'hover':hover,'keypress':keypress,'username':globalNickname,'date':new Date().toLocaleString()};
    visualize_click_single(localFeelObj);
    visualize_keypress_single(localFeelObj);
	
	
	var feelAction = function(){
		new Ajax.Request('/touch?' + qs, {
			method: 'get',
			onSuccess: function(transport){
			
				var responseObj = eval(transport.responseText);
				var feelObj = responseObj[0];
				var statisticsObj = responseObj[1];
				
				//log('LOGGED:' + Object.toJSON(feelObj));
				
				$('totalFeels').textContent = 'Total Feels: ' + statisticsObj.totalFeels;
				document.title = appName + ' - ' + statisticsObj.totalFeels + 'Feels';
			/* $('lastText').textContent = 'Last Text:' + statisticsObj.lastText;*/
			},
			onFailure: function(transport){
				log('ERROR [' + transport.status + ']:' + transport.statusText);
			}
		});
	}
	
	if (lastFeltDate != null) {
		//If they have felt already less than a second ago, delay this new feel request for 1 second more
		var msSinceLastFeel = (new Date().getTime()) - lastFeltDate.getTime();
		//log('msSinceLastFeel:' + msSinceLastFeel);
		if (msSinceLastFeel < 2000) {
			var waitafew = (5000*Math.random())+(1500*Math.random());
			//log('waitafew:' + waitafew);
			setTimeout(feelAction, waitafew);
		}
		else //otherwise, go ahead and call it now.
		{
			lastFeltDate = new Date();
			gloalFeelCount++;
			updateDisplay();
			feelAction.call(this);
		}
	}
	else {
		lastFeltDate = new Date();
		gloalFeelCount++;
		updateDisplay();
		feelAction.call(this);
	}
}

function mouse_move(e){
    globalX = e.clientX;
    globalY = e.clientY;
    var timeNow = new Date().getTime();
    if (lastHover != 0) 
        globalHover = timeNow - lastHover;
    else 
        lastHover = timeNow;
    visualize_mousemove_single(globalX,globalY)
    //addFeel(e,'mousemove'); //we could make this 1/2 as heavy by removing the return data
}

function feels_getTop100(){
	$('log').value = 'Getting top 100';
    var qs = 'query=feelsTop100';
    
    new Ajax.Request('/data?' + qs, {
        method: 'get',
        onSuccess: function(transport){
            try {
                data_feelObjects = eval(transport.responseText);
				gloalFeelCount = data_feelObjects.length;
				updateDisplay();
                log('LOADED feels objects [' + data_feelObjects.length + ']')
            } 
            catch (e) {
                log('ERROR while parsing feels data');
                return;
            }
           visualize_clicks();
           visualize_keypresses();
        },
        onFailure: function(transport){
            log('ERROR in feels_getTop100 [' + transport.status + ']:' + transport.statusText);
        }
    });
}

function visualize_clicks(){
    log('Visualizing clicks for ' + data_feelObjects.length + ' feels...')
    for (var i = 0; i < data_feelObjects.length; i++) {
        feelObj = data_feelObjects[i];
        if (feelObj.eventType == 'click') 
             visualize_click_single(feelObj);
    }
}

function visualize_keypresses(){
    log('Visualizing keypresses for ' + data_feelObjects.length + ' feels...')
    for (var i = 0; i < data_feelObjects.length; i++) {
        feelObj = data_feelObjects[i]
        if (feelObj.eventType == 'keypress' && feelObj.keypress != 0) {
            visualize_keypress_single(feelObj)
        }
    }
}

		
var lastTouchedDate;
function visualize_mousemove_single(x, y){
	
	$(globalNickname+'_icon').style.left = x;
	$(globalNickname+'_icon').style.top = y;

	var touchAction = function(){
		addFeelUsingStroke(x, y);
	};
	
	if (lastTouchedDate != null) {
		//If they have touched already less than a second ago, delay this new feel request for 1 second more
		var msSinceLastTouch = (new Date().getTime()) - lastTouchedDate.getTime();
	//	log('msSinceLastTouch:' + msSinceLastTouch);
		if (msSinceLastTouch < 2000)
			return; 
			//setTimeout(touchAction, 1000);
		else { //otherwise, go ahead and call it now.
			lastTouchedDate = new Date();
			touchAction.call(this);
		}
	}
	else {
		touchAction.call(this);
		lastTouchedDate = new Date();
	}
}		
		

function addFeelUsingStroke(x,y){
	gloalFeelCount++;
	updateDisplay();
	new Ajax.Request('/stroke?x='+x+'&y='+y, {
        method: 'get',
        onSuccess: function(transport){
			gloalFeelCount++;
			updateDisplay();
        },
        onFailure: function(transport){
            log('ERROR in addFeelUsingStroke:[' + transport.status + ']:' + transport.statusText);
        }
    });
}
function visualize_keypress_single(feelObj){
    var nickOrIP  = feelObj.username.length > 0 ? feelObj.username : feelObj.ip;
		
	var fontSize = (feelObj.hover / (data_feelObjects.length * 205));
	if(fontSize < 100)
		fontSize = 100;
	else if(fontSize > 500)
		fontSize = 500;
		
	var opacityPCT = getOpacity(feelObj);
	var opacityDEC = opacityPCT / 100;
	
	var newTag = "<span title='keypress by " + nickOrIP +"' style='position:absolute;left:" +
    feelObj.x +
    ";top:" +
    feelObj.y +
    ";color:#" +  str2hex(nickOrIP)  +  
	";font-size:" + fontSize +
	"filter:alpha(opacity=" + opacityPCT +  ");" +
	"opacity:" + opacityDEC +
    "%'>" +
    String.fromCharCode(feelObj.keypress) +
    "</span>";
	document.body.innerHTML += newTag;
}

function visualize_click_single(feelObj){
	//log('visualize_click_single: ' + Object.toJSON(feelObj));
    var nickOrIP  = feelObj.username;
    if (nickOrIP.length == 0) 
        nickOrIP = feelObj.ip;
		
	var fontSize = (feelObj.hover / (data_feelObjects.length * 75));
	if(fontSize < 100)
		fontSize = 100;
	else if(fontSize > 500)
		fontSize = 500;
	
	
	var opacityPCT = getOpacity(feelObj);
	var opacityDEC = opacityPCT / 100;
	var newTag =
	"<span title='click by " + nickOrIP +"' style='position:absolute;left:" + feelObj.x +
    ";top:" + feelObj.y + ";color:#" + str2hex(nickOrIP) +  
	";font-size:" + fontSize + "%" + 
	"filter:alpha(opacity=" + opacityPCT +  ");" +
	"opacity:" + opacityDEC +
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

////////
function updateDisplay(){
	document.title = 'Mindfeeler - ' + gloalFeelCount + ' Feels';
//	$('totalFeels').innerHTML = gloalFeelCount;
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

function getOpacity(feelObj)
{
	return 100;
/*
 * TODO: REWORK
 */
//	
//	var msNow = new Date().getTime();	
//	var msThen = Date.parse(feelObj.date).getTime();
//
//	var opacityPCT = parseInt((msThen - msNow)/500000);
//	if(opacityPCT > 100)
//		opacityPCT = 100;
//	else if(opacityPCT < 1)
//		opacityPCT = 1;
//	return opacityPCT;*/
}
