// Support theme selection / application


const Theme = {

	// Theme properties
	theme: {
		name: "",
		path: "",
		properties: [
			"background", "text-primary", "text-secondary"
		]
	},


	// Theme file header
	_fileHeader: "THEME v.",
	_headerLength: 18,


	// Available file versions
	_allowedVersions: [
		"00.00.00"
	],


	// Loaded theme data
	_loaded: {},


	// Load a theme file
	loadFile: function(name='default') {
		fetch(`/storage/theme/${name}.ctm`).then(async (response) => {
			let data = await response.text();

			let accepted = false;
			let header = data.slice(0, this._headerLength);

			for(let v in this._allowedVersions) {
				let matchString = this._fileHeader + this._allowedVersions[v] + '\r\n';

				if(header === matchString) {
					accepted = true;
					break;
				}
			}

			if(!accepted) {
				console.warn(`Invalid theme file: "${name}.ctm"`);
				return;
			}

			// TODO: Parse theme data
		}).catch((error) => {
			console.warn(`Could not load theme file: ${name}.ctm`);
			if(name !== 'default') Theme.load('default');
		});
	},


	// Load theme data
	load: function(data) {

	}

};


Theme.loadFile();
