// The chrome storage handler


const ExtStorage = {

	// Storage presets
	_presets: {
		'citations': ['citation-storage', []],
		'containers': ['container-storage', []],
		'domains': ['autofill-domain-list', []],
		'settings': ['settings', {}]
	},


	// The current storage interface
	_interface: null,


	// Initialize the interface
	init: function() {
		return new Promise((resolve, reject) => {

			// Get the preferred interface
			this.getInterface((interface) => {
				this._interface = interface;
				resolve();
			});

		});
	},


	// Sets the storage interface
	setInterface: function(interface) {
		if(interface === 'sync') {
			this._interface = chrome.storage.sync;

			chrome.storage.sync.set({ active: true });
		}
		else if(interface === 'local') {
			this._handler = chrome.storage.local;

			chrome.storage.sync.set({ active: false });
		}
		else {
			throw new Error("Unexpected interface name: " + interface);
		}
	},


	// Gets the storage interface
	getInterface: function(callback) {
		chrome.storage.sync.get("active", (items) => {
			if(items.active === true) {
				callback(chrome.storage.sync);
			}
			else if(items.active === false) {
				callback(chrome.storage.local);
			}
			else {
				chrome.storage.sync.set({ active: false });
				callback(chrome.storage.local);
			}
		});
	},


	// Set an item in storage
	set: function(object) {
		this._interface.set(object);
	},


	// Get items from storage
	get: function(items, callback) {
		this._interface.get(items, callback);
	},


	// Remove items from storage
	remove: function(items, callback) {
		this._interface.remove(items, callback);
	},


	// Get a preset's content
	getPreset: function(name, callback) {
		if(!callback) return;

		if(Array.isArray(name)) {
			let result = {};

			for(let n in name) {
				this.getPreset(name[n], (error, data) => {
					if(error) callback(true, null);

					result[name[n]] = data;

					if(Object.keys(result).length === name.length) {
						callback(false, result);
					}
				});
			}

			return;
		}

		let preset = this._presets[name];

		if(!preset) {
			callback(true, null);
			return;
		}

		this._interface.get(preset[0], (data) => {
			if(!data[preset[0]]) data[preset[0]] = preset[1];

			callback(false, data[preset[0]]);
		});
	},


	// Set a preset's content
	setPreset: function(name, data, callback=null) {
		if(Array.isArray(name)) {
			let error = false;

			for(let n in name) {
				if(this.setPreset(name[n], data[n])) error = true;
			}

			if(callback) callback(error);
			return;
		}

		let preset = this._presets[name];

		if(!preset) {
			if(callback) callback(true);
			return true;
		}

		let item = {};
		item[preset[0]] = data;
		this._interface.set(item, callback);
	},


	// Append to a preset's content
	appendPreset: function(name, data, callback=null) {
		this.getPreset(name, (result) => {
			if(Array.isArray(result)) result.push(data);
			else Object.assign(result, data);

			ExtStorage.setPreset(name, result);
		});
	},


	// Reset a preset's content
	resetPreset: function(name, callback=null) {
		let preset = this._presets[name];
		if(!preset) return true;

		let item = {};
		item[preset[0]] = preset[1];
		this._interface.set(item, callback);

		return false;
	},


	// Read a file
	readFile: function(filename, callback) {
		// TODO: Use fetch instead? (chrome 42, edge 14, and firefox 39 / 52)

		let request = new XMLHttpRequest();
		request.open("GET", chrome.runtime.getURL(filename));

		request.onload = () => {
			callback(request.responseText);
		}

		request.send();
	},

};
