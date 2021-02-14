const DateFormatter = {

	// Months
	months: [
		"january", "february", "march",
		"april", "may", "june",
		"july", "august", "september",
		"october", "november", "december"
	],


	// Parse a 32-bit formatted date
	parseDate: function(buffer) {
		if(!(buffer instanceof Uint8Array)) {
			throw new Error("Date buffer must be a Uint8Array");
		}

		const firstHalf = (buffer[0] << 8) | buffer[1];
		const secondHalf = (buffer[2] << 8) | buffer[3];

		return {
			month: (firstHalf & 0xf000) >>> 12,
			year: (firstHalf & 0xfff) + 1970,
			day: (secondHalf & 0xf800) >>> 11,
			hour: (secondHalf & 0x7c0) >>> 6,
			minute: secondHalf & 0x3f
		};
	},


	// Construct a 32-bit date buffer
	constructDate: function(options) {
		if(options instanceof Date) {
			options = {
				month: options.getMonth() + 1,
				year: options.getFullYear(),
				day: options.getDate(),
				hour: options.getHours(),
				minute: options.getMinutes()
			};
		}

		// Month name to index
		if(typeof options.month === 'string' && this.months.includes(options.month.toLowerCase())) {
			options.month = this.months.indexOf(options.month.toLowerCase()) + 1;
		}

		// Constrain values to their bit length
		options.month &= 0xf;
		options.year &= 0xfff;
		options.day &= 0x1f;
		options.hour &= 0x1f;
		options.minute &= 0x3f;

		// Construct the date
		const date = new Uint8Array(4);

		const firstHalf = (options.month << 12) | (options.year - 1970);
		const secondHalf = (options.day << 11) | (options.hour << 6) | options.minute;

		date.set([firstHalf >>> 8, firstHalf & 0xff], 0);
		date.set([secondHalf >>> 8, secondHalf & 0xff], 2);

		return date;
	},


	// Return a text representation of a date
	asText: function(date, options) {
		if(date instanceof Date) {
			date = {
				month: date.getMonth() + 1,
				year: date.getFullYear(),
				day: date.getDate(),
				hour: date.getHours(),
				minute: date.getMinutes()
			};
		}

		let result = "";

		if(options.order) {
			for(let i in options.order) {
				switch(options.order[i]) {

					case 'month': {
						if(date.month === 0) break;
						let monthName = this.months[date.month - 1][0].toUpperCase();
						monthName += this.months[date.month - 1].slice(1);

						if(options.shortMonths) result += ' ' + monthName.slice(0, 3);
						else result += ' ' + monthName;
					}	break;

					case 'year':
						result += ' ' + date.year.toString();
						break;

					case 'day':
						if(date.day === 0) break;
						result += ' ' + date.day.toString();
						break;

					case 'hour':
						if(options.hourMode === '12') {
							let flag = ' ' + (date.hour < 12 ? 'am' : 'pm');
							result += ' ' + (date.hour % 12).toString() + flag;
						}
						else result += ' ' + date.hour.toString();
						break;

					case 'minute':
						result += ' ' + date.minute.toString();
						break;

				}
			}
		}
		else {
			// Todo
		}

		return result.trim();
	}

};
