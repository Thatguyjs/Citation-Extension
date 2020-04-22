// The chrome storage handler


const ExtStorage = {

	// The current storage interface
	_handler: null,


	// Initialize and prepare the ExtStorage object
	init: function() {
		return new Promise((resolve, reject) => {

			// Get the preferred handler
			this.getHandler((handler) => {
				this._handler = handler;
				resolve();
			});

		});
	},


	// Sets the storage handler
	setHandler: function(handler) {
		if(handler === 'sync') {
			this._handler = chrome.storage.sync;

			chrome.storage.local.set({ active: false });
			chrome.storage.sync.set({ active: true })
		}
		else if(handler === 'local') {
			this._handler = chrome.storage.local;

			chrome.storage.local.set({ active: true });
			chrome.storage.sync.set({ active: false });
		}
		else {
			throw new Error("Unexpected handler name: " + handler);
		}
	},


	// Gets the storage handler
	getHandler: function(callback) {
		let found = null;
		let attempt = 0; // Defaults the handler to local

		chrome.storage.local.get("active", (items) => {
			if(!found && items.active) {
				found = true;
				callback(chrome.storage.local);
			}
			else {
				attempt++;

				if(attempt === 2) {
					chrome.storage.local.set({ active: true });
					callback(chrome.storage.local);
				}
			}
		});

		chrome.storage.sync.get("active", (items) => {
			if(!found && items.active) {
				found = true;
				callback(chrome.storage.sync);
			}
			else {
				attempt++;

				if(attempt === 2) {
					chrome.storage.local.set({ active: true });
					callback(chrome.storage.local);
				}
			}
		});
	},


	// Set an item in storage
	set: function(object) {
		this._handler.set(object);
	},


	// Get items from storage
	get: function(items, callback) {
		this._handler.get(items, callback);
	},


	// Read a file
	readFile: function(filename, callback) {
		let request = new XMLHttpRequest();
		request.open("GET", chrome.runtime.getURL(filename));

		request.onload = () => {
			callback(request.responseText);
		};

		request.send();
	},

};
