// Keep track of and unload event listeners when necessary
window.CitationListeners = {

	// @description: All added listeners (event, object, callback)
	_listeners: [],


	// @description: Adds a listener
	add: function(object, event, callback) {
		object.addEventListener(event, callback);

		return this._listeners.push({
			event: event,
			object: object,
			callback: callback
		}) - 1;
	},


	// @description: Remove a specific event listener
	remove: function(index) {
		this._listeners[index] = null;

		// Remove as many empty listeners as possible
		while(this._listeners.slice(-1) === null) {
			this._listeners = this._listeners.slice(0, -1);
		}
	},


	// @description: Remove all listeners
	removeAll: function() {
		for(let l in this._listeners) {
			this._listeners[l].object.removeEventListener(
				this._listeners[l].event,
				this._listeners[l].callback
			);
		}

		this._listeners = [];
	}

};
