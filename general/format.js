// Format citation objects


const Formatter = {

	// Error messages
	errors: [
		"",
		"Invalid File Length",
		"Invalid File Constant",
		"Incompatible File Version"
	],


	// List of formats
	formats: {},


	// Format file header constant
	_headerConstant: "FMT+",
	_headerConstantArray: new Uint8Array([70, 77, 84, 43]),
	_headerConstantLength: 4,
	_headerLength: 8,


	// Allowed file versions & current version
	_minAllowedVersion: 0,
	_maxAllowedVersion: 0,
	_fileVersion: 0,


	// Element type names
	_typeNames: [
		'title',
		'url',
		'authors',
		'publishers',
		'publishdate',
		'accessdate'
	],


	// Element type indices
	_typeIndices: {
		'title': 0,
		'url': 1,
		'authors': 2,
		'publishers': 3,
		'publishdate': 4,
		'accessdate': 5
	},


	// Load the default format files
	init: function() {
		/*
		// Temp: Create a format file
		const formats = [
			{ name: "MLA8", settings: { indent: true }, data: [
				{ type: 'element', element: 'authors', properties: 0, preceding: '', succeeding: '. ' },
				{ type: 'text', value: '"' },
				{ type: 'element', element: 'title', properties: 0, preceding: '', succeeding: '' },
				{ type: 'text', value: '" ' },
				{ type: 'element', element: 'publishers', properties: 0, preceding: '', succeeding: ', ' },
				{ type: 'element', element: 'publishdate', properties: 0, preceding: '', succeeding: ', ' },
				{ type: 'element', element: 'url', properties: 1, preceding: '', succeeding: '.' }
			] },
			{ name: "IEEE", settings: { indent: false }, data: [
				{ type: 'element', element: 'authors', properties: 0, preceding: '', succeeding: ', ' },
				{ type: 'text', value: '"' },
				{ type: 'element', element: 'title', properties: 0, preceding: '', succeeding: ',' },
				{ type: 'text', value: '" ' },
				{ type: 'element', element: 'url', properties: 2, preceding: '', succeeding: ', ' },
				{ type: 'element', element: 'publishdate', properties: 0, preceding: '', succeeding: '. ' },
				{ type: 'text', value: '[Online]. ' },
				{ type: 'element', element: 'url', properties: 0, preceding: 'Available: ', succeeding: '. ' },
				{ type: 'element', element: 'accessdate', properties: 0, preceding: '[Accessed ', succeeding: ']' }
			] },
			{ name: "BibTeX", settings: { indent: false }, data: [
				{ type: 'text', value: '@misc{citation_name' },
				{ type: 'element', element: 'title', properties: 0, preceding: ', title={', succeeding: '}' },
				{ type: 'element', element: 'url', properties: 0, preceding: ', url={', succeeding: '}' },
				{ type: 'element', element: 'publishers', properties: 1, preceding: ', publisher={', succeeding: '}' },
				{ type: 'element', element: 'authors', properties: 1, preceding: ', author={', succeeding: '}' },
				{ type: 'element', element: 'publishdate', properties: 4, preceding: ', year={', succeeding: '}' },
				{ type: 'element', element: 'publishdate', properties: 2, preceding: ', month={', succeeding: '}' },
				{ type: 'element', element: 'publishdate', properties: 1, preceding: ', day={', succeeding: '}' },
				{ type: 'text', value: ' }' }
			] }
		];

		const buf = this._compileFormats(formats);
		const url = URL.createObjectURL(new Blob([buf.buffer], { type: 'application/octet-stream' }))

		chrome.downloads.download({
			url,
			filename: "default.fmt",
			saveAs: true
		});
		*/

		ExtStorage.readFile("storage/format/default.fmt", "buffer", (buffer) => {
			const formats = this._loadFile(buffer);

			for(let f in formats) {
				this.formats[formats[f].name] = formats[f];
			}
		});
	},


	// Convert a string to a Uint8Array
	_stringToArray: function(string) {
		const arr = new Uint8Array(string.length);

		for(let c in string) {
			arr[c] = string.charCodeAt(c);
		}

		return arr;
	},


	// Check & parse data
	_loadFile: function(buffer) {
		const data = new Uint8Array(buffer);

		// Check for content first
		if(data.length <= this._headerLength) {
			console.log(data);
			return 1;
		}

		// Check file constant
		for(let i = 0; i < this._headerConstantLength; i++) {
			if(data[i] !== this._headerConstantArray[i]) {
				return 2;
			}
		}

		// Check version number
		const version = (data[4] << 8) | data[5];
		if(version < this._minAllowedVersion || version > this._maxAllowedVersion) {
			return { error: 3 };
		}

		// Parse data
		return this._parseFormats(data);
	},


	// Parse format data
	_parseFormats: function(data) {
		const decoder = new TextDecoder("utf-8");

		let error = 0;
		let formats = [];

		const length = data.length;
		const dataStart = this._headerLength;

		// Parse formats
		const formatNum = (data[6] << 8) | data[7];
		let index = dataStart;
		let format = {};

		for(let i = 0; i < formatNum; i++) {
			format = {};
			let offset = index;

			// Header
			const totalLength = (data[offset] << 8) | data[offset + 1];
			offset += 2;

			const nameLen = data[offset];
			format.name = decoder.decode(data.slice(offset + 1, offset + 1 + nameLen));
			offset += nameLen + 1;

			format.settings = {};
			format.settings.indent = (data[offset] & 0x80) !== 0;
			offset++;

			const blockNum = data[offset];
			offset++;

			// Body
			format.data = [];

			for(let i = 0; i < blockNum; i++) {
				const blockType = data[offset] >>> 7;

				// Element
				if(blockType === 1) {
					const elementInd = data[offset] & 0x7f;
					const properties = data[offset + 1];
					offset += 2;

					const precedingLen = data[offset];
					const preceding = data.slice(offset + 1, offset + 1 + precedingLen);
					offset += 1 + precedingLen;

					const succeedingLen = data[offset];
					const succeeding = data.slice(offset + 1, offset + 1 + succeedingLen);
					offset += 1 + succeedingLen;

					format.data.push({
						type: 'element',
						element: this._typeNames[elementInd],
						properties,
						preceding: decoder.decode(preceding),
						succeeding: decoder.decode(succeeding)
					});
				}

				// Text
				else {
					const textLength = data[offset] & 0x7f;
					format.data.push({
						type: 'text',
						value: decoder.decode(data.slice(offset + 1, offset + 1 + textLength))
					});

					offset += 1 + textLength;
				}
			}

			formats.push(format);
			index += totalLength / 8;
		}

		return formats;
	},


	// Construct a format file buffer
	_compileFormats: function(formats) {
		const formatNum = formats.length;

		const header = new Uint8Array(8);
		header.set(this._headerConstantArray, 0); // ID constant
		header.set([this._fileVersion >>> 8, this._fileVersion & 0xff], 4); // Version number
		header.set([formatNum >>> 8, formatNum & 0xff], 6); // Format number

		// Compile formats
		const formatList = [];
		let fileLength = header.length;

		for(let i = 0; i < formatNum; i++) {
			const format = formats[i];
			let array = [];
			let formatLen = 32; // Minimum format length (bits)

			// Format header
			array.push(0, 0);
			array.push(format.name.length, this._stringToArray(format.name));
			array.push(format.settings.indent << 7);
			array.push(format.data.length);

			formatLen += 8 + array[3].length * 8; // Format name

			// Format body
			for(let i in format.data) {
				const block = format.data[i];
				const typeFlag = block.type === 'element';
				formatLen += 8;

				// Element
				if(typeFlag) {
					const elementInd = this._typeIndices[block.element];
					array.push((typeFlag << 7) | (elementInd & 0x7f), block.properties & 0xff);

					const precedingLen = block.preceding.length;
					array.push(precedingLen & 0xff, this._stringToArray(block.preceding));

					const succeedingLen = block.succeeding.length;
					array.push(succeedingLen & 0xff, this._stringToArray(block.succeeding));

					formatLen += 24 + precedingLen * 8 + succeedingLen * 8;
				}

				// Text
				else {
					const textLength = block.value.length;
					array.push((typeFlag << 7) | (textLength & 0x7f));
					array.push(this._stringToArray(block.value));

					formatLen += textLength * 8;
				}
			}

			array[0] = formatLen >>> 8;
			array[1] = formatLen & 0xff;

			let buf = new Uint8Array(formatLen / 8);
			let ind = 0;

			for(let i in array) {
				if(typeof array[i] === 'number') {
					buf.set([array[i]], ind);
					ind++;
				}
				else if(array[i] instanceof Uint8Array) {
					buf.set(array[i], ind);
					ind += array[i].length;
				}
				else break;
			}

			fileLength += buf.length;
			formatList.push(buf);
		}

		// Construct the file buffer
		const buffer = new Uint8Array(fileLength);
		let index = header.length;
		buffer.set(header, 0); // Header

		// Formats
		for(let f in formatList) {
			buffer.set(formatList[f], index);
			index += formatList[f].length;
		}

		return buffer;
	},


	// Format a title
	_format_title: function(title, props) {
		return title;
	},


	// Format a URL
	_format_url: function(url, props) {
		let result = url;

		if((props & 0b1) || (props & 0b10)) {
			const match = result.match(/.+:\/\//);
			if(match && match.index === 0) result = result.slice(match[0].length);
		}
		if(props & 0b10) {
			const ind = result.indexOf('/');
			if(ind > -1) result = result.slice(0, ind);
		}

		return result;
	},


	// Format authors
	_format_authors: function(authors, props) {
		if(!authors.length) return "";

		let copy = [];
		let result = "";

		for(let a in authors) {
			copy.push([
				authors[a][0],
				authors[a][1],
				authors[a][2],
				authors[a][3]
			]);
		}

		if(props & 0b1) {
			copy = [copy[0]];
		}
		if(props & 0b11110) {
			for(let c in copy) copy[c] = ["", "", "", ""];
		}
		if(props & 0b10) {
			for(let c in copy) {
				copy[c][0] = authors[c].prefix;
			}
		}
		if(props & 0b100) {
			for(let c in copy) {
				copy[c][1] = authors[c].firstname;
			}
		}
		if(props & 0b1000) {
			for(let c in copy) {
				copy[c][2] = authors[c].middlename;
			}
		}
		if(props & 0b10000) {
			for(let c in copy) {
				copy[c][3] = authors[c].lastname;
			}
		}

		for(let c in copy) {
			copy[c] = copy[c].filter((str) => { return str.length; });
		}

		if(copy.length === 1) {
			result = copy[0].join(' ');
		}
		else {
			const last = copy[copy.length - 1];
			copy = copy.slice(0, -1);

			for(let c in copy) result += copy[c].join(' ') + ', ';
			result += 'and ' + last.join(' ');
		}

		return result;
	},


	// Format publishers
	_format_publishers: function(publishers, props) {
		if(!publishers.length) return "";

		if(props & 0b1 || publishers.length === 1) return publishers[0];

		const last = publishers[publishers.length - 1];
		publishers = publishers.slice(0, -1);

		return publishers.join(', ') + ' and ' + last;
	},


	// Format a publish date
	_format_publishdate: function(date, props) {
		let order = ['day', 'month', 'year'];
		if(props & 0b111) order = ['', '', ''];

		if(props & 0b1) order[0] = 'day';
		if(props & 0b10) order[1] = 'month';
		if(props & 0b100) order[2] = 'year';

		return DateFormatter.asText(date, { order });
	},


	// Format an access date
	_format_accessdate: function(date, props) {
		return this._format_publishdate(date, props);
	},


	// Apply a format to citations
	format: function(citations) {
		if(!Array.isArray(citations)) citations = [citations];

		let result = [];

		for(let c in citations) {
			const format = this.formats[citations[c].format];
			if(!format) {
				result[c] = null;
				continue;
			}

			let formatted = "";

			if(format.settings.indent) formatted += '\t';

			for(let i in format.data) {
				if(format.data[i].type === 'text') {
					formatted += format.data[i].value;
				}
				else {
					const elem = format.data[i].element;
					const res = this['_format_' + elem](citations[c][elem], format.data[i].properties);

					if(res) {
						formatted += format.data[i].preceding + res + format.data[i].succeeding;
					}
				}
			}

			result.push(formatted);
		}

		return result;
	}

};
