function visualize_keypress(){
	log('TODO: visualize keypress for ' + data_feelObjects.length + ' feels')
	var canvas = document.getElementById("canvasClicks");
	var ctx = canvas.getContext("2d");
	for(var i=0; i< data_feelObjects.length; i++){
		feelObj = data_feelObjects[i]
		if (feelObj.eventType=='keypress' && feelObj.keypress != 0) {
			//log(feelObj.x + ',' + feelObj.y + ',' + feelObj.keypress.toString())
			visKeySingle(feelObj)
			//ctx.drawText("Arial", 14, feelObj.x, feelObj.y, feelObj.keypress.toString())//TODO: convert number to string
		}
	}
}


function visKeySingle(feelObj)
{
	document.body.innerHTML+="<span style='position:absolute;left:" + feelObj.x + ";top:"+feelObj.y +";font-size:" + (feelObj.hover/200) +"%'>" + String.fromCharCode(feelObj.keypress) + "</span>";
}
function visualize_click(){
	log('TODO: visualize clicks for ' + data_feelObjects.length + ' feels')
	for(var i=0; i< data_feelObjects.length; i++){
		feelObj = data_feelObjects[i];
		if(feelObj.eventType=='click')
			drawDot(feelObj.x, feelObj.y,feelObj.hover);
	}
	
}
function visualize_mousemove(){
	
}


function drawDot(fx, fy, hover){
	log('DRAWDOT: ' + fx + ',' + fy + ',' + hover)
	document.body.innerHTML+="<span style='position:absolute;left:" + feelObj.x + ";top:"+feelObj.y +";font-size:" + (feelObj.hover/100) +"%'>.</span>";
	/*var canvas = document.getElementById("canvasClicks");
	var ctx = canvas.getContext("2d");
	for (i = 0; i < 4; i++) {
		for (j = 0; j < 3; j++) {
			ctx.beginPath();
			var x = fx+ (j * 50); // x coordinate
			var y = fy + (i * 50); // y coordinate
			var radius = 1; // Arc radius
			var startAngle = 0; // Starting point on circle
			var endAngle = Math.PI + (Math.PI * j) / 2; // End point on circle
			var anticlockwise = i % 2 == 0 ? false : true; // clockwise or anticlockwise
			ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
			
			if (i > 1) {
				ctx.fill();
			}
			else {
				//ctx.stroke();
			}
		}
	}*/
}