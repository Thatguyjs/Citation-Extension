const Toolbar = {

	// Toolbar buttons
	buttons: {},


	// Get toolbar buttons
	init: function() {
		const btns = [...document.getElementsByClassName('toolbar-button')];

		for(let b in btns) {
			const name = btns[b].getAttribute('name');
			this.buttons[name] = btns[b];

			btns[b].addEventListener('click', this._buttonClick.bind(this, name));
		}

		this.updateButtons();
	},


	// Click a toolbar button
	_buttonClick: function(name, event) {
		const button = this.buttons[name];

		switch(name) {

			case 'select-all':
				if(!CitationManager.allSelected()) CitationManager.selectAll();
				else CitationManager.deselectAll();
				break;

			case 'copy':
				if(!CitationManager.selected.length) break;

				// Todo
				break;

			case 'export':
				if(!CitationManager.selected.length) break;

				// Todo
				break;

		}
	},


	// Update the state of every button
	updateButtons: function() {
		for(let b in this.buttons) {
			this.updateButton(b);
		}
	},


	// Update the state of a button
	updateButton: function(name) {
		const button = this.buttons[name];
		const icon = button?.querySelector('use');
		if(!button) return;

		switch(name) {

			case 'select-all': {
				let hasCitations = Object.keys(CitationManager.citations).length > 0;

				if(hasCitations && CitationManager.allSelected()) {
					icon.setAttribute('href', "#icon-checkbox-checked");
				}
				else icon.setAttribute('href', "#icon-checkbox-blank");
				} break;

			case 'copy':
				if(CitationManager.anySelected()) button.style.cursor = '';
				else button.style.cursor = 'not-allowed';
				break;

			case 'export':
				if(CitationManager.anySelected()) button.style.cursor = '';
				else button.style.cursor = 'not-allowed';
				break;

		}
	}

};
