// Globals
// Major version of Flash required
var requiredMajorVersion = 9;
// Minor version of Flash required
var requiredMinorVersion = 0;
// Minor version of Flash required
var requiredRevision = 28;

function init_flash(){
	var hasProductInstall = DetectFlashVer(6, 0, 65);
	var hasRequestedVersion = DetectFlashVer(requiredMajorVersion, requiredMinorVersion, requiredRevision);
	if (hasProductInstall && !hasRequestedVersion) {
		var MMPlayerType = (isIE == true) ? "ActiveX" : "PlugIn";
		var MMredirectURL = window.location;
		document.title = document.title.slice(0, 47) + " - Flash Player Installation";
		var MMdoctitle = document.title;
		AC_FL_RunContent("src", "playerProductInstall", "FlashVars", "MMredirectURL=" + MMredirectURL + '&MMplayerType=' + MMPlayerType + '&MMdoctitle=' + MMdoctitle + "", "width", "100%", "height", "100%", "align", "middle", "id", "Mindfeeler", "quality", "high", "bgcolor", "#ffffff", "name", "Mindfeeler", "allowScriptAccess", "sameDomain", "type", "application/x-shockwave-flash", "pluginspage", "http://www.adobe.com/go/getflashplayer");
	}
	else 
		if (hasRequestedVersion) {
			// if we've detected an acceptable version
			// embed the Flash Content SWF when all tests are passed
			AC_FL_RunContent("src", "Mindfeeler", "width", "100%", "height", "100%", "align", "middle", "id", "Mindfeeler", "quality", "high", "bgcolor", "#ffffff", "name", "Mindfeeler", "allowScriptAccess", "sameDomain", "type", "application/x-shockwave-flash", "pluginspage", "http://www.adobe.com/go/getflashplayer");
		}
		else { // flash is too old or we can't detect the plugin
			var alternateContent = 'Alternate HTML content should be placed here. ' +
			'This content requires the Adobe Flash Player. ' +
			'<a href=http://www.adobe.com/go/getflash/>Get Flash</a>';
			document.write(alternateContent); // insert non-flash content
		}
}


function sendToActionScript(value) {
  $('MindfeelerFlash').sendToActionScript(value);
}
function sendToJavaScript(value) {
  alert( "ActionScript says: " + value + "\n");
}