// Manages the toolbar buttons


const Toolbar = {

	// Toolbar buttons
	_buttons: {
		'select': document.getElementById('select-all'),
		'copy': document.getElementById('copy-selected'),
		'delete': document.getElementById('delete-selected'),
		'export': document.getElementById('export-selected')
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
		let selected = CitationManager.getSelected();

		switch(button) {

			// Select / deselect citations in the active tab
			case 'select':
				if(CitationManager._allSelected) CitationManager.deselectAll();
				else CitationManager.selectAll();
			break;

			// Copy selected citations
			case 'copy':
				// Don't copy if no citations are selected
				if(!selected.citations.length) break;

				let copyString = "";

				// Append to string
				for(let e in selected.elements) {
					let name = selected.elements[e].querySelector('pre');

					copyString += name.innerText + '\n\n';
				}

				// Copy to clipboard
				navigator.clipboard.writeText(
					copyString.trimEnd()
				).catch(alert);
			break;

			// Delete selected citations
			case 'delete':
				alert("Mass deleting is not implemented yet!");
			break;

			// Export selected citations
			case 'export':
				if(!selected.citations.length) return;

				let historyString = HistoryFormatter.export({
					citations: selected.citations,
					containers: [] // TODO
				});

				historyString = "data:text/chf," + historyString;

				chrome.downloads.download({
					url: historyString,
					filename: "history.chf"
				});
			break;

		}
	}

};
