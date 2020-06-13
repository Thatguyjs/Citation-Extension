// Send and receive messages from iframes


window.CitationMessenger = {

	// Message queue
	_queue: [],


	// Where the messages be sent to / received from
	_channel: null,
	_loaded: false,


	// Message listeners
	_listeners: [],


	// Receive a message event
	_onmessage: function(event) {
		let params = event.data;

		for(let l in this._listeners) {
			if(this._listeners[l] === null) continue;

			// Call then remove
			if(this._listeners[l].once) {
				this._listeners[l].callback.apply(globalThis, params);
				this._listeners[l] = null;
			}

			// Call, don't remove
			else {
				this._listeners[l].callback.apply(globalThis, params);
			}
		}
	},


	// Calls _onmessage with the correct context
	_messageCaller: function(event) {
		window.CitationMessenger._onmessage(event);
	},


	// Set variables & listeners
	init: function(channel) {

		// From an iframe
		if(channel === null) {
			this._channel = 'iframe';

			this._loaded = true;
		}

		// From the parent window
		else {
			this._channel = channel.contentWindow;

			channel.addEventListener('load', () => {
				this._loaded = true;

				// Go through the queue
				for(let i in this._queue) {
					this.send.apply(this, this._queue[i]);
				}
			}, { once: true });
		}

		// Listen for messages
		window.addEventListener('message', this._messageCaller);
	},


	// Send a message
	send: function(...args) {
		// Add to queue if the target is not loaded
		if(!this._loaded) {
			this._queue.push(args);
			return;
		}

		// Send to parent window
		if(this._channel === 'iframe') {
			window.parent.postMessage(args, '*');
		}

		// Send to iframe
		else {
			this._channel.postMessage(args, '*');
		}
	},


	// Receive a message
	receive: function(callback) {
		if(!callback) {
			return new Promise((resolve, reject) => {
				this._listeners.push({
					once: true,
					callback: (...data) => {
						resolve(data);
					}
				});
			});
		}
		else {
			this._listeners.push({
				once: true,
				callback
			});
		}
	},


	// Add a listener for messages
	listen: function(callback) {
		return this._listeners.push({
			once: false,
			callback: callback
		}) - 1;
	},


	// Remove a listener
	remove: function(index) {
		if(index < 0 || index >= this._listeners.length) return -1;

		this._listeners[index] = null;

		// Remove null listeners
		index = this._listeners.length - 1;

		while(this._listeners[index] === null) {
			this._listeners.pop();
			index--;
		}
	},


	// Clean up listeners
	destroy: function() {
		window.removeEventListener('message', this._messageCaller);
	}

};
