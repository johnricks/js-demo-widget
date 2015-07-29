<!DOCTYPE html>
<html>
	<head>
		<title>liveWidget</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<script src="https://ajax.googleapis.com/ajax/libs/mootools/1.5.1/mootools-yui-compressed.js"></script>
		<script src="liveWidget.js"></script>
		<script>
			(function () {
				
			'use strict';
			
			/*global LiveWidgetTest */
			
			window.addEvent('domready', function() {
				pageInit();
			});
			
			/**
			 * Postprocess/validate the response content
			 *
			 * @param {string} responseText
			 * @param {string} responseXML
			 * @returns {undefined}
			 */
			function reponseParser(responseText, responseXML) {
				console.log('reponseParser - entry');
				var i, parts, seconds;

				parts = responseText.split(':');

				if (parts.length !== 3) {
					throw {message:'Invalid response data'};
				}		

				seconds = parseInt(parts[2], 10);

				for (i = 0; i < parts.length; i += 1) {
					if (isNaN(parts[i])) {
						throw {message:'Invalid response value'};
					}
				}
				
				return responseText;
			}
			
			/**
			 * 
			 * @returns {undefined}
			 */
			function pageInit () {
				
				var myWidget1 = new LiveWidgetTest.LiveWidgetBase({
					'debug': 0,
					'name': 'one',
					'urls': ['time.php'],
					'container': 'box1',
					'updateInterval': Math.round(Math.random() * 8), // make each widget update on a diff interval
					'callbacks': {
						'parseResponse': reponseParser,
						'beforeSend': function () {
//							console.log('beforeSend one - entry');
//							console.log('beforeSend one - exit');
						}
					}
				});
				myWidget1.activate();
				
				var myWidget2 = new LiveWidgetTest.LiveWidgetBase({
					'debug': 0, //LiveWidgetTest.LiveWidgetBase.XHR,
					'name': 'two',
					'urls': ['time.php'],
					'container': 'box2',
					'updateInterval': Math.round(Math.random() * 8),
					'callbacks': {
						'parseResponse': reponseParser
					}				
				});
				myWidget2.activate();	
				
				var myWidget3 = new LiveWidgetTest.LiveWidgetBase({
					'debug': LiveWidgetTest.LiveWidgetBase.DOM,
					'name': 'three',
					'urls': ['time.php'],
					'container': 'box3',
					'updateInterval': Math.round(Math.random() * 8),
					'callbacks': {
						'parseResponse': reponseParser,
						'beforeShow': function () {
//							console.log('beforeSend three - entry');
//							console.log('beforeSend three - exit');
						},
						'afterActivate': function () {
//							console.log('afterActivate three - entry');
//							console.log('afterActivate three - exit');
						}
						
					}	
				});
				myWidget3.activate();
				
				var myWidget4 = new LiveWidgetTest.LiveWidgetBase({
					'debug': 0,
					'name': 'four',
					'urls': ['time.php'],
					'container': 'box4',
					'updateInterval': Math.round(Math.random() * 8),
					'callbacks': {
						'parseResponse': reponseParser				
					}	
				});
				
				myWidget4.activate();
			}		
			}());
		</script>
		<style>
			body {
				position: relative;
			}
			
			.live-widget {
				position: absolute;
				border: 1px solid black;
				color: black;
				background-color: white;
				text-align: center;
				height: 1.2em;
				width: 180px;
				overflow:hidden;
				cursor: pointer;
			}

			.live-widget.active {
				border: 1px solid green;
			}			
			
			.live-widget.online {
				border: 2px solid green;
			}

			.live-widget.offline {
				border: 2px solid red;
			}			

			.live-widget.inactive {
				border: 1px solid silver;
				color: silver;
			}				
                        
			.box {
				width: 320px;
				height: 240px;
				display: block;
				position: relative;
				top: 0;
				left: 0;
				float: left;
				border: 1px solid black;
				margin: 1em 0 0 1em;
			}
			
		</style>
	</head>
	<body>
	<div id="content">           
            <div id="box1" class="box"></div>
            <div id="box2" class="box"></div>
            <div id="box3" class="box"></div>
            <div id="box4" class="box"></div>
	</div>
	</body>
</html>
