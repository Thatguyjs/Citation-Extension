// Store and load DOM element locations


const PathStorage = {

	// Website domain
	_domain: "",


	// Domain index
	_index: -1,


	// All element paths
	_paths: {},


	// Load saved data into the popup
	_loadPaths: function() {
		ExtStorage.get('autofill-domain-' + this._index, (paths) => {
			paths = paths['autofill-domain-' + PathStorage._index];
			if(!paths) return;

			for(let p in paths) {
				window.CitationMessenger.send('path', p, paths[p]);
			}
		});
	},


	// Load elements from storage
	init: function(domain) {
		this._domain = domain;

		ExtStorage.getPreset('domains', (list) => {
			if(!list.length) return;

			let index = list.indexOf(domain);
			if(index === -1) return;

			PathStorage._index = index;
			PathStorage._loadPaths();
		});
	},


	// Set an element path
	set: function(tab, path) {
		this._paths[tab] = path;
	},


	// Get an element path
	get: function(tab) {
		return this._paths[tab] || null;
	},


	// Remove an element path
	remove: function(tab) {
		if(this._paths[tab]) {
			delete this._paths[tab];
		}
		else {
			ExtStorage.get('autofill-domain-' + this._index, (data) => {
				data = data['autofill-domain-' + PathStorage._index];
				if(!data) return;

				delete data[tab];

				// Delete the website from storage
				if(!Object.keys(data).length) {
					ExtStorage.remove('autofill-domain-' + PathStorage._index);
					return;
				}

				// Save the updated paths
				let paths = {};
				paths['autofill-domain-' + PathStorage._index] = data;

				ExtStorage.set(paths);
			});
		}
	},


	// Save all paths
	save: function() {
		window.CitationLogger.log("Saving paths:", this._paths);

		ExtStorage.getPreset('domains', (error, list) => {
			let index = list.indexOf(PathStorage._domain);

			if(index === -1) {
				list.push(PathStorage._domain);
				index = list.length - 1;

				ExtStorage.setPreset('domains', list);
			}

			let paths = {};
			paths['autofill-domain-' + index] = PathStorage._paths;

			ExtStorage.set(paths);
		});
	}

};
