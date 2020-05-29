// Manages the toolbar buttons


const Toolbar = {

	// Toolbar buttons
	_buttons: {
		'select': document.getElementById('select-all'),
		'copy': document.getElementById('copy-selected'),
		'delete': document.getElementById('delete-selected')
	},


	// All button listeners
	init: function() {
		for(let b in this._buttons) {
			this._buttons[b].addEventListener('click', (event) => {
				Toolbar.click(b, event);
			});
		}
	},


	// Toolbar button actions
	click: function(button, event) {
		switch(button) {

			// Select all citations in the active tab
			case 'select':
				if(CitationManager._allSelected) CitationManager.deselectAll();
				else CitationManager.selectAll();
			break;

			// Copy all selected citations
			case 'copy':
				let copyString = "";

				for(let t in CitationManager._tabs) {
					let tab = CitationManager._tabs[t]._element;

					for(let c in CitationManager._tabs[t]._selected) {
						let index = CitationManager._tabs[t]._selected[c];

						let citation = tab.querySelector('#citation-num-' + index);

						copyString += citation.querySelector('pre').innerText + '\n\n';
					}
				}

				// Don't copy if nothing's selected
				if(!copyString.length) break;

				navigator.clipboard.writeText(
					copyString.trimEnd()
				).catch(alert);
			break;

			// Delete all selected citations
			case 'delete':
				alert("Mass deleting is not implemented yet!");
			break;

		}
	}

};
