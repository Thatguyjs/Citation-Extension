// Format parts of citations from string data


const CitationFormatter = {

	// All citation elements
	elements: [
		"Title", "Url",
		"Authors", "Publishers",
		"Access_Date", "Publish_Date"
	],


	// Possible formats
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


	// Active citation format
	_format: null,


	// Load a format
	init: function(format) {
		if(!this._formats[format]) {
			window.CitationMessenger.send('error', 'Unknown Citation Format');
			return;
		}

		this._format = this._formats[format];
	},


	// Format part of a citation
	formatElement: function(name, string, options=null) {
		return this['_format_' + name](string, options);
	},


	// General string formatting
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
	_format_Title: function(string, data) {
		string = string.trim();

		if(string.includes(' - ')) {
			string = string.slice(0, string.lastIndexOf(' - '));
		}
		else if(string.includes(' | ')) {
			string = string.slice(0, string.lastIndexOf(' | '));
		}

		return string.trim();
	},


	// Format the URL
	_format_Url: function(string, data) {
		if(string.includes('?')) {
			string = string.slice(0, string.lastIndexOf('?'));
		}
		else if(string.includes('&')) {
			string = string.slice(0, string.lastIndexOf('&'));
		}

		return string;
	},


	// Format an author
	_format_Authors: function(string, data) {
		string = this._doFormat(string, {
			remove: [',', 'by', 'published']
		});

		string = string.split(' ');

		let author = ["", string[0] || "", "", ""];

		if(string.length === 4) {
			author = string;
		}
		else if(string.length === 3) {
			author[2] = string[1] || "";
			author[3] = string[2] || "";
		}
		else {
			author[3] = string[1] || "";
		}

		return author;
	},


	// Format a publisher
	_format_Publishers: function(string, data) {
		return string.trim();
	},


	// Format the publish date
	_format_Publish_Date: function(string, data) {
		string = this._doFormat(string, {
			remove: [',', 'published', 'am', 'pm']
		});

		// Remove time
		string = string.replace(/\d\:\d\d/, '');

		// List of months
		let months = [
			'jan', 'feb', 'mar', 'apr',
			'may', 'jun', 'jul', 'aug',
			'sep', 'oct', 'nov', 'dec'
		];

		let date = {
			day: null,
			month: null,
			year: null
		};

		// Day
		let match = string.match(/\d{1,2}\b/);
		if(match) date.day = match[0].trim();

		// Month
		match = string.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
		if(!match) match = string.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
		if(match) {
			match = match[0].slice(0, 3).toLowerCase();
			date.month = String(months.indexOf(match) + 1);
		}

		// Year
		match = string.match(/\d{4}/);
		if(match) date.year = match[0].trim();

		return date;
	},


	// Format the access date
	_format_Access_Date: function(string, data) {
		if(data === 'automatic') {
			let date = new Date();

			return {
				day: date.getDate(),
				month: date.getMonth() + 1,
				year: date.getFullYear()
			};
		}

		return this._format_Publish_Date(string, data);
	}

};
