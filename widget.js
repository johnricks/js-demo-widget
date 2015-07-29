/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var Demo = {};

/**
 * Widget to regularly query a server and display the result;
 * 
 * @type Class
 */
Demo.WidgetBase = new Class({
	
	/**
  	 * State: initialized -> active -> online -> offline -> inactive 
	 * 
	 * initialized
	 *   class instantiated
	 *   dom fragment constructed (but not attached)
	 *   
	 * active
	 *	 server comm initiated
	 *   displayed
	 *   
	 * online
	 *   server success, polling
	 *   
	 * offline
	 *  server issue, polling
	 * 
	 * inactive
	 *   no comm, not polling
	 *   still attached to dom
	 */	
	state: null,
	
	/**
	 * array of XHR Request objects
	 */
	connections: {},
	
	/**
	 * Custom callbacks
	 */
	callbacks: {},
	
	name: null,
	
	/**
	 * Parent container
	 */
	container: null,
	
	/**
	 * Root widget container
	 */
	element: null,
	
	updateInterval: null,
	
	defaultUpdateInterval: 8,
	
	pos: {x: 0, y: 0},

	className: 'widget',
	
	connFails: 0,
	
	/**
	 *  Max connection errors befor the widget goes into an inactive state.
	 */
	maxConnFails: 3,
	
	/**
	 * Base msg txt.  May be supplmented at display time
	 */
	text: '',
	
	debug: null,
	
	/**
	 * Class constructor
	 * 
	 * @param {object} options Class options.
	 * @returns {undefined}
	 */
    initialize: function(options) {
		if (options.debug & Demo.WidgetBase.STATE) { console.log(options.name + '::initialize - entry'); }
		
		var i, len, urls, connURL;

		//
		// parse options
		//
		
		this.debug = (options.debug === undefined) ? Demo.WidgetBase.STATE | Demo.WidgetBase.XHR | Demo.WidgetBase.DOM : options.debug;
		
		this.name = options.name || '';

		this.container = $(options.container) || null;

		if (this.container === null) {
			throw {message: 'Invalid container option'};
		}
		
		this.updateInterval = options.updateInterval || this.defaultUpdateInterval;
		
		//
		// callbacks
		//
		if (options.callbacks) {
			this.callbacks = Object.merge(this.callbacks, options.callbacks);
		}
		
		//
		// setup XHR Request objects
		//
		urls = options.urls || [];
		
		for (i = 0, len = urls.length; i < len; i += 1) {
			connURL = urls[i];
			this.connections[connURL] = new Request({
				'url': connURL,
				'data': {'name': this.name},
				'timeout': 6000, // 6 seconds, 
				'onProgress': function(event, xhr){
					var loaded = event.loaded, total = event.total;
					if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':progress - ' + parseInt(loaded / total * 100, 10)); }
				},
				'onComplete': function (response) {
					// note: runs in the context of the Request object
					if (this.debug & (Demo.WidgetBase.XHR)) { console.log(this.name + ':complete - ' + connURL); }
				},
				'onException': (function (headerName, value) {
					if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':exception - ' + connURL); }
					this.errorHandler(connURL);
				}).bind(this),
				'onFailure': (function (xhr) {
					if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':failure - ' + connURL); }
					this.errorHandler(connURL);
				}).bind(this),
				'onTimeout': (function (xhr) {
					if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':timeout - ' + connURL); }
					this.errorHandler(connURL);
				}).bind(this),
				'onSuccess': (function (responseText, responseXML) {
					if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':exception - ' + connURL); }
					var retval = this.successHandler(responseText, responseXML, connURL);
					if (retval === false) {
						this.errorHandler(connURL);
						return;
					}
				}).bind(this),
				'onCancel': function () {
					// note: runs in the context of the Request object
					if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':cancel - ' + connURL); }
				}
			});
		}
		
		
		if (!this.build()) {
			throw {message: 'Build failed.'};
		}

		this.setState('initialized');
		this.show();
		
		if (this.debug & Demo.WidgetBase.STATE) { console.log(this.name + ':initialize - exit'); }
    },
	
	/**
	 * Build the widget dom structure.  
	 * 
	 * DO NOT attach to the DOM.
	 * 
	 * @returns {boolean}
	 */
	build: function () {
		if (this.debug & Demo.WidgetBase.STATE) { console.log(this.name + ':build - entry'); }
		
		var containerSize = this.container.getSize();
		
		this.element = new Element('div', { 'class': this.className });	
		
		this.setText('00:00:00');

		// set the widgets position
		this.position({
			'x': Math.round((containerSize.x / 2.0) - (180 / 2.0)),
			'y': Math.round((containerSize.y / 2.0) - (24 / 2.0))
		});		
		
		this.element.addEvent('click', (function (evt) {
			if (this.state === 'active' || this.state === 'online' || this.state === 'offline') {
				this.deactivate();
			} else if (this.state === 'inactive') {
				this.activate();
			}
		}).bind(this));
		
		if (this.debug & Demo.WidgetBase.STATE) { console.log(this.name + ':build - exit'); }	
		
		return true;
	},

	/**
	 * Activate the widget
	 * 
	 * Attaches to the DOM and starts XHR request.
	 * 
	 * @returns {undefined}
	 */
	activate: function () {
		if (this.debug & Demo.WidgetBase.STATE) { console.log(this.name + ':activate - entry'); }	
		
		var idx;
		
		if (this.callbacks.beforeActivate && typeof this.callbacks.beforeActivate === 'function') {
			retval = this.callbacks.beforeActivate.apply(this, []);
		}		
		
		if (this.state === 'initialized') {
			this.element.inject(this.container);		
		}
		
		// reset conn fails on activation
		this.connFails = 0;
		
		this.setState('active');
		this.setText('00:00:00');
		this.show();
		
		for (idx in this.connections) {
			this.sendRequest(idx);
		}
		
		if (this.callbacks.afterActivate && typeof this.callbacks.afterActivate === 'function') {
			this.callbacks.afterActivate.apply(this, []);
		}
		
		if (this.debug & Demo.WidgetBase.STATE) { console.log(this.name + ':activate - exit'); }	
	},
	
	/**
	 * Deactivate the widget
	 * 
	 * XHR request are suspended
	 * 
	 * @returns {boolean}
	 */
	deactivate: function () {
		if (this.debug & Demo.WidgetBase.STATE) { console.log(this.name + ':deactivate - entry'); }
		var idx;
		for (idx in this.connections) {
			this.connections[idx].cancel();
		}
		this.setState('inactive');
		this.show();		
		if (this.debug & Demo.WidgetBase.STATE) { console.log(this.name + ':deactivate - exit'); }
		return true;
	},
	
	/**
	 * Set the widget state
	 * 
	 * initialized -> active -> online -> offline -> inactive
	 * 
	 * @param {string} str State.
	 * @returns {undefined}
	 */
	setState: function (str) {
		this.state = str;
		this.element.erase('class');
		this.element.set('class', this.className + ' ' + this.state);
	},
	
	/**
	 * Send an XHR request.
	 * 
	 * Request made while an existing request is active are ignored (ignore|cancel|chain).
	 * 
	 * @param {string} idx Connection index.
	 * @returns {undefined}
	 */
	sendRequest: function (idx) {
		if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':sendRequest - entry'); }
		
		var retval;
		
		// don't send if inactive ... settimeout may try to do this.  Alternatively could
		// keep track of the timers and stop them.
		if (this.state === 'inactive') {
			return false;
		}
		
		if (this.callbacks.beforeSend && typeof this.callbacks.beforeSend === 'function') {
			retval = this.callbacks.beforeSend.apply(this, []);
		}
		
		if (retval === false) {
			return false;
		}
		
		this.connections[idx].send();
		
		if (this.callbacks.afterSend && typeof this.callbacks.afterSend === 'function') {
			this.callbacks.afterSend.apply(this, []);
		}
		
		if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':sendRequest - exit'); }
		
		return true;
	},
	
	/**
	 * Handler success responses returned from the server
	 * 
	 * Still may error if the response is invalid or contains an error code.
	 * 
	 * @param {string} responseText
	 * @param {string} responseXML
	 * @param {string} connURL
	 * @returns {boolean}
	 */
	successHandler: function (responseText, responseXML, connURL) {
		if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':successHandler - entry'); }	
		
		var response;
		
		if (this.callbacks.parseResponse && typeof this.callbacks.parseResponse === 'function') {
			try {
				response = this.callbacks.parseResponse.apply(this, [responseText, responseXML]);
			} catch (err) {
				if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':successHandler - parse failed ' + err.message); }
				return false;
			}
		} else {
			response = responseText;
		}
		
		this.connFails = 0;		
		
		this.setState('online');
		this.setText(response);
		this.show();
		
		setTimeout((function () { this.sendRequest(connURL); }).bind(this),  this.updateInterval * 1000);
		
		if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':successHandler - exit'); }		
		
		return true;
	},
	
	/**
	 * Generic error handler
	 * 
	 * Handles timeouts, server-side errors, ... 
	 * 
	 * @param {type} idx
	 * @returns {undefined}
	 */
	errorHandler: function (idx) {
		if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':errorHandler - entry'); }
		
		this.connFails++;
		this.setState('offline');
		this.show();
		
		if (this.connFails < this.maxConnFails) {
			setTimeout((function () { this.sendRequest(idx); }).bind(this),  this.updateInterval * 1000);
		} else {
			this.deactivate();
		}
		
		if (this.debug & Demo.WidgetBase.XHR) { console.log(this.name + ':errorHandler - exit'); }
	},

	/**
	 * Display the widget
	 * 
	 * Positions the widget based on current pos value, set the msg text based
	 * on name, state ...
	 * 
	 * @returns {boolean} Returns true on success, false otherwise.
	 */
	show: function () {
		if (this.debug & Demo.WidgetBase.DOM) { console.log(this.name + ':show - entry'); }		
		var strFail, retval;
		
		if (this.callbacks.beforeShow && typeof this.callbacks.beforeShow === 'function') {
			retval = this.callbacks.beforeShow.apply(this, []);
		}
		
		if (retval === false) {
			return false;
		}		
		
		this.element.setStyles({
			'top': this.pos.y + 'px',
			'left': this.pos.x + 'px'
		});
		
		if (this.connFails) {
			strFail = ' ' + this.connFails + '/' + this.maxConnFails;
		} else {
			strFail = '';
		}
		
		this.element.set('text', this.name + ':' + this.state + ' - ' + this.text + strFail);
		
		if (this.callbacks.afterShow && typeof this.callbacks.afterShow === 'function') {
			this.callbacks.afterShow.apply(this, []);
		}
		
		if (this.debug & Demo.WidgetBase.DOM) { console.log(this.name + ':show - exit'); }
		
		return true;
	},
	
	/**
	 * Hide the widget
	 * 
	 * @returns {undefined}
	 */
	hide: function () {
		if (this.debug & Demo.WidgetBase.DOM) { console.log(this.name + ':hide - exit'); }
		this.element.fade('out');
		if (this.debug & Demo.WidgetBase.DOM) { console.log(this.name + ':hide - exit'); }
	},

	/**
	 * 
	 * @param {string} str
	 * @returns boolean
	 */
	setText:  function (str) {
		if (this.debug & Demo.WidgetBase.DOM) { console.log(this.name + ':setText - entry'); }
		this.text = str;
		if (this.debug & Demo.WidgetBase.DOM) { console.log(this.name + ':setText - exit'); }
		return true;
	},

	/**
	 * Return the message text
	 * 
	 * @returns {string}
	 */
	getText:  function () {
		if (this.debug & Demo.WidgetBase.DOM) { console.log(this.name + ':getText - entry'); }
		return this.text;
		if (this.debug & Demo.WidgetBase.DOM) { console.log(this.name + ':getText - exit'); }
	},	
	
	/**
	 * Set/get the widget screen position
	 * 
	 * @param {object} oPos
	 * @returns {object} Return the current position on success.
	 */
	position:  function (oPos) {
		if (this.debug & Demo.WidgetBase.DOM) { console.log(this.name + ':position - entry'); }
		
		if (oPos === undefined) {
			return this.pos;
		}

		if (typeof oPos.x !== undefined) {
			this.pos.x = Math.round(oPos.x);
		}
		
		if (typeof oPos.y !== undefined) {
			this.pos.y = Math.round(oPos.y);	
		}
		
		if (this.debug & Demo.WidgetBase.DOM) { console.log(this.name + ':position - exit'); }
		
		return this.pos;
	}

});

Demo.WidgetBase.STATE = 1;

Demo.WidgetBase.XHR = 2;

Demo.WidgetBase.DOM = 4;