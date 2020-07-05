// Load user options


const Options = {

	// List of options
	_options: {},


	// Get options from storage
	init: function() {
		ExtStorage.get('options', (data) => {
			if(!data['options']) {
				data['options'] = {};
				ExtStorage.set(data);
			}

			let opts = data['options'];

			Options._options.tabHeaderPosition = opts.tabHeaderPosition || 'bottom';

			Options.applyAll();
		});
	},


	// Apply all options
	applyAll: function() {
		for(let o in this._options) {
			this.apply(o);
		}
	},


	// Apply a single option
	apply: function(option) {
		switch(option) {

			// Tab position
			case 'tabHeaderPosition':
				let tabHeaders = document.getElementById('tab-headers');
				tabHeaders.classList.add('tab-headers-' + this._options[option]);
			break;

		}
	}

};
