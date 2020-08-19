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


	// Parse theme data
	_parseTheme: function(data) {
		return {
			error: 0,
			data: JSON.parse(data)
		};
	},


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

			let parsed = this._parseTheme(data.slice(this._headerLength));
			if(parsed.error) return console.error(parsed.error);

			this.load(parsed.data);

		}).catch((error) => {
			console.warn(`Could not load theme file: ${name}.ctm`);
			console.error(error);
			if(name !== 'default') Theme.load('default');
		});
	},


	// Load a theme
	load: function(object, part="-") {
		for(let o in object) {
			let name = part + '-' + o;

			if(!Array.isArray(object[o])) {
				this.load(object[o], name);
			}
			else {
				let colorString = "none";

				if(object[o][0] === 'rgb') {
					colorString = `rgb(${object[o][1]}, ${object[o][2]}, ${object[o][3]})`;
				}

				document.documentElement.style.setProperty(name, colorString);
			}
		}
	}

};


Theme.loadFile();
