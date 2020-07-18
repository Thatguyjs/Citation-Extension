// Format citation objects


const Formatter = {

	// Month names
	_months: [
		'January', 'February', 'March', 'April',
		'May', 'June', 'July', 'August',
		'September', 'October', 'November', 'December'
	],


	// Format file header
	_fileHeader: "FORMAT v.",
	_headerLength: 19,


	// Available format file versions
	_allowedVersions: [
		"00.00.01",
		"00.00.02"
	],


	// Element marker (group separator)
	_elementMarker: String.fromCharCode(29),


	// Different element numbers (function names)
	_elements: {
		0: "Title",
		1: "Url",
		2: "Authors",
		3: "Publishers",
		4: "PublishDate",
		5: "AccessDate"
	},


	// Different citation formats
	_formats: {},


	// The citation result
	_result: "",


	// Init & parse the list of formats
	init: function() {

		// Load the default extension formats
		this._loadFile("storage/format/default.fmt");

	},


	// Load a format file
	_loadFile: function(filepath) {
		ExtStorage.readFile(filepath, (data) => {
			let accepted = false;

			for(let v in this._allowedVersions) {
				let matchString = this._fileHeader + this._allowedVersions[v] + '\r\n';

				if(data.slice(0, this._headerLength) === matchString) {
					accepted = true;
					break;
				}
			}

			if(!accepted) {
				return; // TODO: Error Message
			}

			// Parse and set formats
			let formats = this._loadFormats(data.slice(this._headerLength));

			for(let f in formats) {
				this._formats[formats[f].name] = formats[f];
			}

		});
	},


	// Load a list of formats
	_loadFormats: function(data) {
		let formatList = [];
		let currentFormat = null;

		let length = data.length;
		let index = 0;

		let specialChars = [this._elementMarker, ';', '<', '>'];

		// Parse formats
		while(index < length && index >= 0) {

			// Escaped character
			if(data[index] === '\\') {
				currentFormat.data.push({
					type: 'string',
					data: data[index + 1]
				});

				index += 2;
			}

			// Start of a new format
			else if(data[index] === ':') {
				currentFormat = {
					name: data.slice(index + 1, data.indexOf(this._elementMarker, index)),
					indent: null,
					data: []
				};

				index = data.indexOf(this._elementMarker, index) + 1;

				currentFormat.indent = !!Number(data.slice(index, data.indexOf(':', index)));
				index = data.indexOf(':', index) + 1;
			}

			// Citation element
			else if(data[index] === this._elementMarker) {
				index++;

				let match = data.slice(index).match(/\d+/);
				if(!match) return; // TODO: Error message

				let node = { type: 'element', element: Number(match[0]) };

				index += match[0].length;

				if(data[index] === ':') {
					node.properties = [];
				}

				while(data[index] === ':') {
					index++;

					match = data.slice(index).match(/\d+/);
					if(!match) return // TODO: Error message

					node.properties.push(Number(match[0]));
					index += match[0].length;
				}

				currentFormat.data.push(node);
			}

			// Include characters after an element
			else if(data[index] === '<') {
				let nodes = [];

				let ind = currentFormat.data.length;

				while(currentFormat.data[--ind].type === 'string') {
					nodes.unshift(currentFormat.data.pop().data);
				}

				currentFormat.data.push({
					type: 'optional',
					mode: 'after',
					data: nodes.join('')
				});

				index++;
			}

			// Include characters before an element
			else if(data[index] === '>') {
				let text = "";

				while(data[++index] !== this._elementMarker) {
					text += data[index];
				}

				currentFormat.data.push({
					type: 'optional',
					mode: 'before',
					data: text
				});
			}

			// End of a format
			else if(data[index] === ';') {
				formatList.push(currentFormat);
				currentFormat = null;

				index = data.indexOf(':', index + 1);
			}

			// Additional characters
			else {
				let text = "";

				while(!specialChars.includes(data[index])) {
					text += data[index];
					index++;
				}

				currentFormat.data.push({
					type: 'string',
					data: text
				});
			}

		}

		return formatList;
	},


	// Format different citation elements

	_formatTitle: function(properties, citation) {
		return citation.title;
	},


	_formatUrl: function(properties, citation) {
		let result = "";

		if(!properties) {
			result = citation.url;
		}
		else if(properties[0] === 0 && citation.url.includes('://')) {
			result = citation.url.slice(citation.url.indexOf('://') + 3);
		}
		else if(properties[0] === 1) {
			result = this._formatUrl([0], citation);

			if(result.includes('/')) {
				result = result.slice(0, result.indexOf('/'));
			}
		}

		return result;
	},


	_formatAuthors: function(properties, citation) {
		if(!citation.authors.length) return "";

		let authors = [];
		let lastIndex = 0;

		if(properties && properties[0] === 0) {
			authors.push(citation.authors[0]);
			lastIndex = 1;
		}
		else if(properties && properties[0] === 5) {
			authors.push(citation.authors[properties[1]]);
			lastIndex = 2;
		}
		else {
			for(let a in citation.authors) {
				authors.push(citation.authors[a]);
			}
		}

		// Recursive properties
		if(properties && properties[lastIndex] >= 1 && properties[lastIndex] <= 4) {
			let prop = [
				'prefix', 'firstname', 'middlename', 'lastname'
			][properties[lastIndex] - 1];

			for(let a in authors) {
				for(let p in authors[a]) {
					if(p !== prop) {
						authors[a][p] = "";
					}
				}
			}
		}

		// Turn the authors array into a string
		let result = "";

		for(let a in authors) { // TODO: Add prefix and middlename support
			result += (
				(Number(a) > 0 ? " and " : "") +
				(authors[a][3] ? authors[a][3] + " " : "") +
				(authors[a][1] || "")
			);
		}

		return result.trim();
	},


	_formatPublishers: function(properties, citation) {
		if(!citation.publishers.length) return "";

		let result = "";

		if(!properties) {
			for(let p in citation.publishers) {
				result += (
					(Number(p) > 0 ? " and " : "") +
					citation.publishers[p]
				);
			}
		}
		else if(properties[0] === 0) {
			result += citation.publishers[0];
		}
		else if(properties[0] === 1) {
			result += citation.publishers[properties[1]];
		}

		return result;
	},


	_formatPublishDate: function(properties, citation) {
		if(!citation.publishdate.month) return "";

		let result = "";

		if(!properties) {
			result += (
				citation.publishdate.day + " " +
				this._months[citation.publishdate.month - 1] + " " +
				citation.publishdate.year
			);
		}
		else if(properties[0] === 0) {
			result += citation.publishdate.day.toString();
		}
		else if(properties[0] === 1) {
			result += this._months[citation.publishdate.month - 1];
		}
		else if(properties[0] === 2) {
			result += citation.publishdate.year.toString();
		}

		return result;
	},


	_formatAccessDate: function(properties, citation) {
		if(!citation.accessdate.month) return "";

		let result = "";

		if(!properties) {
			result += (
				citation.accessdate.day + " " +
				this._months[citation.accessdate.month - 1] + " " +
				citation.accessdate.year
			);
		}
		else if(properties[0] === 0) {
			result += citation.accessdate.day.toString();
		}
		else if(properties[0] === 1) {
			result += this._months[citation.accessdate.month - 1];
		}
		else if(properties[0] === 2) {
			result += citation.accessdate.year.toString();
		}

		return result;
	},


	// Format a citation object
	format: function(citation) {
		if(!citation) return "Format Error";

		// Get the format
		let activeFormat = this._formats[citation.format];
		if(!activeFormat) return "Format Error: Unknown citation format";

		// Element state & optional text
		let elementFound = false;
		let nextOptional = "";

		// Reset the result
		this._result = activeFormat.indent ? "\t" : "";

		// Generate the citation
		for(let e in activeFormat.data) {

			// Call the correct citation function
			if(activeFormat.data[e].type === 'element') {
				let formattedElement = this[
					"_format" + this._elements[activeFormat.data[e].element]
				](activeFormat.data[e].properties, citation);

				elementFound = !!formattedElement;

				if(nextOptional && elementFound) {
					this._result += nextOptional;
					nextOptional = "";
				}

				this._result += formattedElement;
			}

			// Add an optional string
			else if(activeFormat.data[e].type === 'optional') {
				if(activeFormat.data[e].mode === 'before') {
					nextOptional = activeFormat.data[e].data;
				}
				else if(elementFound) {
					this._result += activeFormat.data[e].data;
				}
			}

			// Add the string to the result
			else if(activeFormat.data[e].type === 'string') {
				this._result += activeFormat.data[e].data;
			}

			// Unknown node
			else return "Format Error: Unknown format node";
		}

		return this._result;
	}

};
