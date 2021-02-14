// Import & export all citation history


const HistoryFormatter = {

	// Error messages
	errors: [
		"",
		"Invalid File Length",
		"Invalid File Constant",
		"Incompatible File Version"
	],


	// History file header constant
	_headerConstant: "CHF+",
	_headerConstantArray: new Uint8Array([67, 72, 70, 43]),
	_headerConstantLength: 4,
	_headerLength: 14,


	// Allowed file versions & current version
	_minAllowedVersion: 0,
	_maxAllowedVersion: 0,
	_fileVersion: 0,


	// Convert a string to a Uint8Array
	_stringToArray: function(string) {
		const arr = new Uint8Array(string.length);

		for(let c in string) {
			arr[c] = string.charCodeAt(c);
		}

		return arr;
	},


	// Convert an array to an element list
	_arrayToElemList: function(array) {
		if(!array.length) return new Uint8Array();

		const length = array.length;
		const list = new Uint8Array(array.join('.').length + 1);
		let index = 0;

		for(let i = 0; i < length; i++) {
			list[index] = array[i].length;
			list.set(this._stringToArray(array[i]), index + 1);

			index += list[index] + 1;
		}

		return list;
	},


	// Convert a list of authors to an element list
	_authorsToElemList: function(authors) {
		if(!authors.length) return new Uint8Array();

		let names = [];

		for(let a in authors) {
			names.push(
				authors[a][0],
				authors[a][1],
				authors[a][2],
				authors[a][3],
			);
		}

		return this._arrayToElemList(names);
	},


	// Check & parse data
	_loadFile: function(buffer) {
		const data = new Uint8Array(buffer);

		// Check for content first
		if(data.length < this._headerLength) {
			return { error: 1 };
		}
		else if(data.length === this._headerLength) {
			return { citations: [], containers: [] };
		}

		// Check file constant
		for(let i = 0; i < this._headerConstantLength; i++) {
			if(data[i] !== this._headerConstantArray[i]) {
				return { error: 2 };
			}
		}

		// Check version number
		const version = (data[4] << 8) | data[5];
		if(version < this._minAllowedVersion || version > this._maxAllowedVersion) {
			return { error: 3 };
		}

		// Parse data
		return this._parseHistory(data);
	},


	// Parse history data
	_parseHistory: function(data) {
		const decoder = new TextDecoder("utf-8");

		let error = 0;
		let citations = [];
		let containers = [];

		const length = data.length;
		const dataStart = this._headerLength;

		// Parse containers
		const containerNum = (data[12] << 8) | data[13];
		// Todo

		// Parse citations
		const citationNum = (data[10] << 8) | data[11];
		let index = dataStart;
		let citation = {};

		for(let i = 0; i < citationNum; i++) {
			citation = {};
			let offset = index;

			// Header
			const totalLength = (data[offset] << 8) | data[offset + 1];
			offset += 2;

			const formatLen = data[offset];
			citation.format = decoder.decode(data.slice(offset + 1, offset + 1 + formatLen));
			offset += formatLen + 1;

			const nameLen = data[offset];
			citation.name = decoder.decode(data.slice(offset + 1, offset + 1 + nameLen));
			offset += nameLen + 1;

			citation.created = DateFormatter.parseDate(data.slice(offset, offset + 4));
			offset += 4;

			citation.modified = DateFormatter.parseDate(data.slice(offset, offset + 4));
			offset += 4;

			const containerNum = data[offset];
			citation.containers = [];
			offset++;

			for(let i = 0; i < containerNum; i++) {
				const len = data[offset];
				citation.containers.push(decoder.decode(data.slice(offset + 1, offset + 1 + len)));

				offset += len + 1;
			}

			// Body
			const titleLen = data[offset];
			citation.title = decoder.decode(data.slice(offset + 1, offset + 1 + titleLen));
			offset += titleLen + 1;

			const urlLen = ((data[offset] << 8) | (data[offset + 1] & 0xff)) / 8;
			citation.url = decoder.decode(data.slice(offset + 2, offset + 2 + urlLen));
			offset += urlLen + 2;

			const authorNum = data[offset];
			citation.authors = [];
			offset++;

			for(let i = 0; i < authorNum; i++) {
				let author = ['', '', '', ''];

				let len = data[offset];
				author[0] = decoder.decode(data.slice(offset + 1, offset + 1 + len));
				offset += len + 1;

				len = data[offset];
				author[1] = decoder.decode(data.slice(offset + 1, offset + 1 + len));
				offset += len + 1;

				len = data[offset];
				author[2] = decoder.decode(data.slice(offset + 1, offset + 1 + len));
				offset += len + 1;

				len = data[offset];
				author[3] = decoder.decode(data.slice(offset + 1, offset + 1 + len));
				offset += len + 1;

				citation.authors.push(author);
			}

			const publisherNum = data[offset];
			citation.publishers = [];
			offset++;

			for(let i = 0; i < publisherNum; i++) {
				const len = data[offset];
				citation.publishers.push(decoder.decode(data.slice(offset + 1, offset + 1 + len)));

				offset += len + 1;
			}

			citation.publishdate = DateFormatter.parseDate(data.slice(offset, offset + 4));
			offset += 4;

			citation.accessdate = DateFormatter.parseDate(data.slice(offset, offset + 4));
			offset += 4;

			citations.push(citation);
			index += totalLength / 8;
		}

		return {
			error,
			citations,
			containers
		};
	},


	// Convert history data (object) to a buffer
	_compileHistory: function(object) {
		const citationNum = object.citations.length;
		const containerNum = object.containers.length;

		const header = new Uint8Array(14);
		header.set(this._headerConstantArray, 0); // ID constant
		header.set([this._fileVersion >>> 8, this._fileVersion & 0xff], 4); // Version number
		header.set(DateFormatter.constructDate(new Date()), 6); // Creation date
		header.set([citationNum >>> 8, citationNum & 0xff], 10);
		header.set([containerNum >>> 8, containerNum & 0xff], 12);

		// Compile citations
		const citations = [];
		let fileLength = header.length;

		for(let i = 0; i < citationNum; i++) {
			const citation = object.citations[i];
			let array = [];
			let citationLen = 208; // Minimum citation length (bits)

			// Citation header
			array.push(0, 0);
			array.push(citation.format.length, this._stringToArray(citation.format));
			array.push(citation.name.length, this._stringToArray(citation.name));
			array.push(DateFormatter.constructDate(new Date()));
			array.push(DateFormatter.constructDate(new Date()));
			array.push(citation.containers.length, this._arrayToElemList(citation.containers));

			citationLen += array[3].length * 8; // Format
			citationLen += array[5].length * 8; // Name
			citationLen += array[9].length * 8; // Containers

			// Citation body
			array.push(citation.title.length, this._stringToArray(citation.title));
			array.push((citation.url.length * 8) >>> 8, (citation.url.length * 8) & 0xff);
			array.push(this._stringToArray(citation.url));
			array.push(citation.authors.length, this._authorsToElemList(citation.authors));
			array.push(citation.publishers.length, this._arrayToElemList(citation.publishers));
			array.push(DateFormatter.constructDate(citation.publishdate));
			array.push(DateFormatter.constructDate(citation.accessdate));

			citationLen += array[11].length * 8;
			citationLen += array[14].length * 8;
			citationLen += array[16].length * 8;
			citationLen += array[18].length * 8;

			array[0] = citationLen >>> 8;
			array[1] = citationLen & 0xff;

			let buf = new Uint8Array(citationLen / 8);
			buf.set([
				array[0], array[1], // Total length
				array[2], ...array[3], // Format
				array[4], ...array[5], // Name
				...array[6], // Date created
				...array[7], // Date modified
				array[8], ...array[9], // Containers
				array[10], ...array[11], // Title
				array[12], array[13], ...array[14], // URL
				array[15], ...array[16], // Authors
				array[17], ...array[18], // Publishers
				...array[19], // Publish date
				...array[20] // Access date
			], 0);

			fileLength += buf.length;
			citations.push(buf);
		}

		// Construct the file buffer
		const buffer = new Uint8Array(fileLength);
		let index = header.length;
		buffer.set(header, 0); // File header

		// Citations
		for(let c in citations) {
			buffer.set(citations[c], index);
			index += citations[c].length;
		}

		return buffer;
	},


	// Load history from an external file, return result
	import: function(filepath, isFile) {
		return new Promise((resolve, reject) => {

			// Import from a file
			if(isFile) {
				ExtStorage.readFile(filepath, 'buffer', (data) => {
					let result = this._loadFile(data);

					if(result.error) reject(result);
					else resolve(result);
				});
			}

			// Import from chrome storage
			else {
				ExtStorage.get(filepath, (data) => {
					let result = this._loadFile(data[filepath]);

					if(result.error) reject(result);
					else resolve(result);
				});
			}

		});
	},


	// Export a history object as a downloadable URL
	export: function(details) {
		const buffer = this._compileHistory(details);
		const url = URL.createObjectURL(new Blob([buffer.buffer], { type: 'application/octet-stream' }));

		return url;
	}

};
