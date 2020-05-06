// Parse data into various citation elements such as the author or date


// The parser
window.CitationParser = {

	doFormat: function(data, options={}) {
		if(!data) return "";

		let lower = data.toLowerCase();

		// Remove keywords
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


	parseAuthor: function(data, automatic) {
		data = this.doFormat(data, {
			remove: [",", "by", "published"]
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
		else node.lastname = data[1] || "";

		return node;
	},


	parsePublishDate: function(data, automatic) {
		data = this.doFormat(data, {
			remove: [',', 'published', 'am', 'pm']
		});

		// Remove time of day
		data = data.replace(/\d\:\d\d/, '');

		let node = {
			day: "",
			month: "",
			year: ""
		};

		let match = data.match(/\d{1,2}\b/);
		if(match) node.day = match[0].trim();

		match = data.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
		if(!match) match = data.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);

		if(match) node.month = match[0].trim();

		match = data.match(/\d{4}/);
		if(match) node.year = match[0].trim();

		return node;
	},


	parseAccessDate: function(data, automatic) {
		data = this.doFormat(data);

		if(!automatic) {
			data = this.parsePublishDate(data);
		}
		else {
			let date = new Date();

			data = {
				day: date.getDate(),
				month: date.getMonth() + 1,
				year: date.getFullYear()
			};
		}

		return data;
	},


	parsePublisher: function(data, automatic) {
		data = this.doFormat(data);

		return data;
	},


	parseTitle: function(data, automatic) {
		data = this.doFormat(data);

		if(automatic) {
			data = document.title;

			if(data.includes('-') || data.includes('|')) {
				data = document.getElementsByTagName('h1')[0].innerHTML;
			}
		}

		return data;
	},


	parseUrl: function(data, automatic) {
		data = this.doFormat(data);

		if(automatic) data = window.location.href;

		if(data.includes("?"))
			data = data.slice(0, data.indexOf('?'));
		else if(data.includes('&'))
			data = data.slice(0, data.indexOf('&'));

		return data;
	}

};
