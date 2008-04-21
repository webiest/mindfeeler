var data_feelObjects;

function feels_getTop100() {
	var qs = 'query=feelsTop100';
	 
	new Ajax.Request('/data?' + qs, {
		method: 'get',
		onSuccess: function(transport) {
			try {
				data_feelObjects = eval(transport.responseText);
				log('LOADED feels objects [' + data_feelObjects.length + ']')
			}
			catch(e) {
				log('ERROR while parsing feels data');
				return;
			}
			visualize_click();
			visualize_keypress();
		},
		onFailure: function(transport) {
		  log('ERROR in feels_getTop100 [' + transport.status + ']:' + transport.statusText);
		}
	});
}



