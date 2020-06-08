// Format different parts of the citation


const CitationFormatter = {

	// A list of formats
	_formats: {
		"MLA8": {
			manual: ['Authors', 'Publishers', 'Publish_Date'],
			automatic: ['Title', 'Url', 'Access_Date']
		},
		"IEEE": {
			manual: ['Authors', 'Publishers', 'Publish_Date'],
			automatic: ['Title', 'Url', 'Access_Date']
		},
		"BibTeX": {
			manual: ['Authors', 'Publishers', 'Publish_Date'],
			automatic: ['Title', 'Url', 'Access_Date']
		}
	},


	// The current format object
	_format: null,


	// The current citation object
	_citation: {},


	// Init the formatter
	init: function(format) {
		if(!this._formats[format]) {
			window.CitationMessenger.send('error', 'Unknown Citation Format');
			return;
		}

		// Set the active format / element
		this._format = this._formats[format];

		// Set up the citation
		this._citation = {
			type: "Website",
			format: format,

			title: "",
			url: "",

			authors: [],
			publishers: [],

			publishdate: {},
			accessdate: {}
		};
	},


	// Get & format a citation element
	setElement: function(name, data) {
		this._citation = this['_format_' + name](this._citation, data);

		// Update content of the popup tabs
		CitationPopup.updateTabs(name, this._citation);
	},


	// General formatting
	_doFormat: function(data, options={}) {
		if(!data) return "";

		let lower = data.toLowerCase();

		// Remove characters
		if(options.remove) {
			if(!Array.isArray(options.remove)) options.remove = [options.remove];

			for(let e in options.remove) {
				while(lower.includes(options.remove[e])) {
					let index = lower.indexOf(options.remove[e]);
					lower = lower.replace(options.remove[e], '');
					data = data.slice(0, index) + data.slice(index + options.remove[e].length);
				}
			}
		}

		// Replace strings
		if(options.replace) {
			if(!Array.isArray(options.replace[0])) options.replace = [options.replace];

			for(let r in options.replace) {
				while(lower.includes(options.replace[r][0])) {
					let index = lower.indexOf(options.replace[r][0]);
					lower = lower.replace(options.replace[r][0], options.replace[r][1]);
					data = data.slice(0, index) + options.replace[r][1] + data.slice(index + options.replace[r][0].length);
				}
			}
		}

		return data.trim();
	},


	// Format the title
	_format_Title: function(citation, data) {
		data.trim();

		if(data.slice(0, 5) === 'CITE2') {
			data = data.slice(5);
		}
		else if(data.slice(0, 5) === 'CITE1') {
			if(data.includes('-') || data.includes('|')) {
				window.CitationMessenger.send('get', 'Title', '2');
				return citation;
			}

			data = data.slice(5);
		}

		citation.title = data;

		return citation;
	},


	// Format the URL
	_format_Url: function(citation, data) {
		if(data.includes('?')) data = data.slice(0, data.indexOf('?'));
		else if(data.includes('&')) data = data.slice(0, data.indexOf('&'));

		citation.url = data;

		return citation;
	},


	// Format an author
	_format_Authors: function(citation, data) {
		data = this._doFormat(data, {
			remove: [',', 'by', 'published']
		});

		data = data.split(' ');

		let node = {
			prefix: "",
			firstname: "",
			middlename: "",
			lastname: ""
		};

		node.firstname = data[0] || "";

		if(data.length === 3) {
			node.middlename = data[1] || "";
			node.lastname = data[2] || "";
		}
		else {
			node.lastname = data[1] || "";
		}

		citation.authors.push([
			node.prefix,
			node.firstname,
			node.middlename,
			node.lastname
		]);

		return citation;
	},


	// Format a publisher
	_format_Publishers: function(citation, data) {
		citation.publishers.push(data);

		return citation;
	},


	// Format the publish date
	_format_Publish_Date: function(citation, data) {
		data = this._doFormat(data, {
			remove: [',', 'published', 'am', 'pm']
		});

		// Remove time
		data = data.replace(/\d\:\d\d/, '');

		// List of months
		let months = [
			'jan', 'feb', 'mar', 'apr',
			'may', 'jun', 'jul', 'aug',
			'sep', 'oct', 'nov', 'dec'
		];

		let node = {
			day: null,
			month: null,
			year: null
		};

		// Day
		let match = data.match(/\d{1,2}\b/);
		if(match) node.day = match[0].trim();

		// Month
		match = data.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
		if(!match) match = data.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
		if(match) {
			match = match[0].slice(0, 3).toLowerCase();
			node.month = String(months.indexOf(match) + 1);
		}

		// Year
		match = data.match(/\d{4}/);
		if(match) node.year = match[0].trim();

		citation.publishdate = node;
		return citation;
	},


	// Format the access date
	_format_Access_Date: function(citation, data) {
		if(this._format.automatic.includes('Access_Date') && typeof data !== 'string') {
			citation.accessdate = {
				day: data.getDate(),
				month: data.getMonth() + 1,
				year: data.getFullYear()
			};
		}
		else {
			citation.accessdate = this._format_Publish_Date(citation, data).publishdate;
		}

		return citation;
	}

};
