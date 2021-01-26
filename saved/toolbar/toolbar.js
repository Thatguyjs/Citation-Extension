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
				if(CitationManager.selected.length < CitationManager.citations.length) {
					CitationManager.selectAll();
				}
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
				const selectedNum = CitationManager.selected.length;
				const citationNum = CitationManager.citations.length;

				if(citationNum > 0 && selectedNum === citationNum) {
					icon.setAttribute('href', "#icon-checkbox-checked");
				}
				else icon.setAttribute('href', "#icon-checkbox-blank");
				} break;

			case 'copy':
				if(CitationManager.selected.length) button.style.cursor = '';
				else button.style.cursor = 'not-allowed';
				break;

			case 'export':
				if(CitationManager.selected.length) button.style.cursor = '';
				else button.style.cursor = 'not-allowed';
				break;

		}
	}

};
