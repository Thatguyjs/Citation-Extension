const Settings = {

	pages: ['storage', 'formats', 'themes'],


	settings: {
		storage: {},
		formats: {},
		themes: {}
	},


	init: function() {
		let toggles = [...document.querySelectorAll('.setting-toggle')];

		for(let t in toggles) {
			toggles[t].addEventListener('click', () => {
				toggles[t].classList.toggle('active');


			});
		}


	},


	// Save settings
	save: function(mode='all') {
		if(mode === 'all') {
			ExtStorage.setPreset('settings', this.settings);
		}
		else {
			if(!this.settings[mode]) return;

			ExtStorage.getPreset('settings', (saved) => {
				saved[mode] = Settings.settings[mode];
				ExtStorage.setPreset('settings', saved);
			});
		}
	}

};
