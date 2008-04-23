var globalX;
var globalY;
var globalHover;
var lastHover = 0;


function init(e){
	visualize_clicks();
	visualize_keypresses();
	document.body.style.cursor = 'crosshair';
	$('nickname').innerHTML = globalNickname;
	$('nickname').style.color = str2hex(globalNickname);
	$('waitText').innerHTML = 'Ready to <span class="wow">interact!</span>';
	setTimeout(function(){$('waitText').style.display='none';$('greeting').style.display='block';}, 2000);
	
	
}

var dateRangeArray;
function init_flashLoaded() //called by flash when the flash object is done loading
{
	var maxDate = globalNewestFeel.getTime();
	var minDate = globalOldestFeel.getTime();

	dateRangeArray = new Array();
	dateRangeArray.push({date:globalOldestFeel.getTime()});

	var tempDate = globalOldestFeel;
	while(tempDate < globalNewestFeel)
	{
		tempDate = tempDate.addDays(1);
		dateRangeArray.push({date:tempDate.getTime()});
	}
	minID = 0;
	maxID = dateRangeArray.length-1;

	$('MindfeelerFlash').setupSlider(minDate, minID, maxDate, maxID);
}

var lastFeltDate;
var tempPKCounter = 0;


function loadNewDateFromRange(lowerBound, upperBound)
{
	var lowerBoundFriendly = new Date(dateRangeArray[lowerBound].date).toString('yyyy-MM-dd');
	var upperBoundFriendly = new Date(dateRangeArray[upperBound].date).toString('yyyy-MM-dd');
	log('Loading range: ' + lowerBoundFriendly + ' - ' + upperBoundFriendly + '...');

    var qs = 'from='+escape(lowerBoundFriendly) + '&to=' + escape(upperBoundFriendly);
    
    new Ajax.Request('/data?' + qs, {
        method: 'get',
        onSuccess: function(transport){
            try {
                data_feelObjects = eval(transport.responseText);
				//gloalFeelCount = data_feelObjects.length;
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
function addFeel(e, eventType){
    var x = globalX -10| e.clientX -10| 0;
    var y = globalY -10| e.clientY -10| 0;
	
	if(x > 0)
		x+=8;
//	if(y > 0)
		y-=2;
    var keypress = e.charCode | 0;
    var hover = globalHover | 0;
	
	tempPKCounter++;
    var tempKey = tempPKCounter;
	
	
	//TODO: combine or reuse qs and localFeelObj. We can make one from the other.
	var qs = 	'eventType=' + eventType +
    			'&x=' + x +
    			'&y=' + y +
    			'&keypress=' + keypress +
    			'&hover=' + hover +
				'&tempKey=' + tempKey;
				
	var localFeelObj = {'x':x,'y':y,'hover':hover,'keypress':keypress,'username':globalNickname,'date':new Date().toLocaleString(),'tempKey':tempKey};
    
	
	if (eventType == 'click') 
		visualize_click_single(localFeelObj);
	else if (eventType = 'keypress') {
		if(String.fromCharCode(keypress).length == 0) //don't add the shift key and other non printables
				return;
			else
				visualize_keypress_single(localFeelObj);
		}
	
	
	
	if (lastFeltDate != null) {
		//If they have felt already less than a second ago, delay this new feel request for 1 second more
		var msSinceLastFeel = (new Date().getTime()) - lastFeltDate.getTime();
		//log('msSinceLastFeel:' + msSinceLastFeel);
		if (msSinceLastFeel < 2000) {
			var waitafew = (5000 * Math.random()) + (1500 * Math.random());
			data_feelObjects.push(localFeelObj);
			setTimeout(function(){addFeel_ajax(qs);}, waitafew);
		}
		else {		//otherwise, go ahead and call it now.
			data_feelObjects.push(localFeelObj);
			lastFeltDate = new Date();//TODO: refactor to reduce duplication of code
			gloalFeelCount++;
			updateDisplay();
			addFeel_ajax.call(this, [qs]);
		}
	}
	else {
		data_feelObjects.push(localFeelObj);
		lastFeltDate = new Date();
		gloalFeelCount++;
		updateDisplay();
		addFeel_ajax.call(this,[qs]);
	}
}





function addFeel_ajax(qs){
	
	new Ajax.Request('/touch?' + qs, {
		method: 'get',
		onSuccess: function(transport){
			var responseObj = transport.responseText.split(','); 
			gloalFeelCount = parseInt(responseObj[0]);
			
			var feelTempKey = responseObj[1];
			var feelPermID = responseObj[2];
			
			updateTempKeyToPermID(feelTempKey,feelPermID);
			updateDisplay();
			/* $('lastText').textContent = 'Last Text:' + statisticsObj.lastText;*/
		},
		onFailure: function(transport){
			log('ERROR [' + transport.status + ']:' + transport.statusText);
		}
	});
}

function updateTempKeyToPermID(feelTempKey,feelPermID)
{
	var feelTag = document.getElementsByName('feelTEMP_'+feelTempKey)[0];
	feelTag.setAttribute('name', 'feel'+feelPermID);
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
				//gloalFeelCount = data_feelObjects.length;
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
   // log('Visualizing clicks for ' + data_feelObjects.length + ' feels...')
    for (var i = 0; i < data_feelObjects.length; i++) {
        feelObj = data_feelObjects[i];
        if (feelObj.eventType == 'click') 
             visualize_click_single(feelObj);
    }
}

function visualize_keypresses(){
    //log('Visualizing keypresses for ' + data_feelObjects.length + ' feels...')
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
		addStroke(x, y);
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
			setTimeout(touchAction, 100); //give icon time to move.
		}
	}
	else {
		setTimeout(touchAction, 100); //give icon time to move.
		lastTouchedDate = new Date();
	}
}		
		

function addStroke(x,y){
	new Ajax.Request('/stroke?x='+x+'&y='+y, {
        method: 'get',
        onSuccess: function(transport){
        },
        onFailure: function(transport){
            log('ERROR in addStroke:[' + transport.status + ']:' + transport.statusText);
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
	
	var tempORpermKey = feelObj.id;
	
	if(tempORpermKey == null || tempORpermKey.length ==0)
		tempORpermKey = 'TEMP_' + feelObj.tempKey;

	var newTag = "<span name='feel" + tempORpermKey + "' title='keypress by " + nickOrIP +"' style='position:absolute;left:" +
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
	
	var tempORpermKey = feelObj.id;
	
	if(tempORpermKey == null || tempORpermKey.length ==0)
		tempORpermKey = 'TEMP_' + feelObj.tempKey;

	var newTag = "<span name='feel" + tempORpermKey + "' title='click by " + nickOrIP +"' style='position:absolute;left:" + feelObj.x +
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
	if(clearLogId != null)
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
