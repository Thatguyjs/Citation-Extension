const Toolbar = {

	// Toolbar buttons
	_buttons: {
		'select-all': null,
		'copy': null,
		'export': null
	},


	// Tab selection state (single, all)
	_tabState: 'single',
	_tabStateButton: document.getElementById('tab-selection-state'),


	// Load toolbar buttons
	_loadButtons: function() {
		for(let b in this._buttons) {
			this._buttons[b] = document.getElementById('toolbar-button-' + b);
		}
	},


	// Handle a button press
	_buttonClick: function(name, button) {
		let svg = button.querySelector('svg');

		switch(name) {

			case 'select-all':
				if(!button.classList.contains('selected')) {
					ChangeSVGIcon(svg, 'checkbox-checked');
					TabManager.active.selectAll();
				}
				else {
					ChangeSVGIcon(svg, 'checkbox-blank');
					TabManager.active.deselectAll();
				}

				button.classList.toggle('selected');
				break;

			case 'copy':
				CitationManager.copyCitations(TabManager.getSelected(this._tabState));
				break;

			case 'export':
				CitationManager.exportCitations(TabManager.getSelected(this._tabState));
				break;

		}
	},


	// Initialize buttons & listeners
	init: function() {
		this._loadButtons();

		for(let b in this._buttons) {
			this._buttons[b].addEventListener('click', () => {
				this._buttonClick(this._buttons[b].getAttribute('name'), this._buttons[b]);
			});
		}

		// Tab selection state
		this._tabStateButton.addEventListener('click', () => {
			let svg = this._tabStateButton.querySelector('svg');

			if(this._tabState === 'single') {
				this._tabStateButton.setAttribute('title', 'All tabs');
				this._tabState = 'all';
			}
			else {
				this._tabStateButton.setAttribute('title', 'Single tab');
				this._tabState = 'single';
			}

			ChangeSVGIcon(svg, 'tabs-' + this._tabState);
		});
	},


	// Update toolbar buttons to match a specific tab
	updateState: function(tabId) {
		let tab = TabManager.getTab(tabId);

		// Update the "Select all" button state
		if(tab.citations.length) {
			let btn = this._buttons['select-all'];
			let svg = btn.querySelector('svg');

			if(tab.citations.length === tab.selected.length) {
				ChangeSVGIcon(svg, 'checkbox-checked');
				btn.classList.add('selected');
			}
			else {
				ChangeSVGIcon(svg, 'checkbox-blank');
				btn.classList.remove('selected');
			}
		}
	}

};
