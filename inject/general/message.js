// Handle communication between a parent window and iframe


window.CitationMessenger = {

	// Channels
	PARENT: 0,
	IFRAME: 1,


	// Message channel
	_channel: { id: -1, to: null },


	// Message listeners
	_listeners: [],


	// Receive a message event
	_onmessage: function(event) {
		for(let l in this._listeners) {
			if(!this._listeners[l]) continue;

			this._listeners[l].callback(event.data);
			if(this._listeners[l].once) this._listeners[l] = null;
		}

		// Delete removed listeners
		let index = this._listeners.length;

		while(this._listeners[--index] === null) {
			this._listeners.pop();
		}
	},


	// Change namespace and redirect the message
	_messageRedirect: function(event) {
		window.CitationMessenger._onmessage(event);
	},


	// Initialize the messenger
	init: function(channel, data) {
		if(channel === this.PARENT) {
			this._channel.id = this.PARENT;
			this._channel.to = data.contentWindow;
		}
		else if(channel === this.IFRAME) {
			this._channel.id = this.IFRAME;
			this._channel.to = null;
		}

		window.addEventListener('message', this._messageRedirect);
	},


	// Destroy the messenger data
	destroy: function() {
		window.removeEventListener('message', this._messageRedirect);
	},


	// Send a message
	send: function(...args) {
		if(this._channel.id === this.PARENT) {
			this._channel.to.postMessage(args, '*');
		}
		else {
			window.parent.postMessage(args, '*');
		}
	},


	// Recieve a single message through a promise
	receive: function() {
		return new Promise((resolve, reject) => {
			this._listeners.push({
				once: true,
				callback: resolve
			});
		});
	},


	// Add a message listener
	addListener: function(callback, once=false) {
		return this._listeners.push({
			callback,
			once
		}) - 1;
	},


	// Remove a message listener
	removeListener: function(index) {
		if(index < 0 || index >= this._listeners.length) return -1;

		this._listeners[index] = null;

		// Delete removed listeners
		index = this._listeners.length;

		while(this._listeners[--index] === null) {
			this._listeners.pop();
		}
	}

};
