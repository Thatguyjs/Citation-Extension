// Handles the main citation popup


const CitationPopup = {

	// Citation format string
	_format: null,


	// Back / Copy / Next buttons
	_backButton: document.getElementById('button-back'),
	_copyButton: document.getElementById('button-copy'),
	_nextButton: document.getElementById('button-next'),


	// Init popup buttons & other data
	init: function(format) {
		ExtStorage.init();
		Formatter.init();

		// Set variables
		this._format = format;
		CitationFormatter.init(format);

		// Get automatic elements & update the popup
		for(let e in CitationFormatter._format.automatic) {
			window.CitationMessenger.send('get', CitationFormatter._format.automatic[e]);

			this.updateCitation(
				CitationFormatter._format.automatic[e],
				CitationFormatter._citation
			);
		}

		// Set up textareas
		Textarea.addAll();

		// Next tab / update citation
		this._nextButton.addEventListener('click', () => {
			CitationPopup.updateCitation(TabManager._tabIds[TabManager._tabIndex]);
			CitationPopup.nextTab();
		});

		// Previous tab
		this._backButton.addEventListener('click', () => {
			CitationPopup.previousTab();
		});

		// Copy citation
		this._copyButton.addEventListener('click', () => {
			CitationFinisher.copy();
		});

		// Initialize list buttons
		document.getElementById('add-author').addEventListener('click', () => {
			CitationPopup.updateCitation('Authors');

			let authors = CitationFormatter._citation.authors;
			authors.push(["", "", "", ""]);

			CitationPopup.updateTabs('Authors', { authors });
		});

		document.getElementById('add-publisher').addEventListener('click', () => {
			CitationPopup.updateCitation('Publishers');

			let publishers = CitationFormatter._citation.publishers;
			publishers.push("");

			CitationPopup.updateTabs('Publishers', { publishers });
		});

		// Go to the first tab
		TabManager.setTab(0);

		// Start getting manual events
		window.CitationMessenger.send('click', 'start');
	},


	// Go to the next tab
	nextTab: function() {
		if(TabManager.isLastTab()) {
			CitationFinisher.save();
			return;
		}

		if(TabManager.isFirstTab()) {
			this._backButton.classList.remove('button-disabled');
		}

		TabManager.nextTab();

		if(TabManager.isLastTab()) {
			this._nextButton.innerText = "Save";
			this._copyButton.style.display = "inline-block";

			window.CitationMessenger.send('click', 'stop');
			CitationFinisher.finish(CitationFormatter._citation);
		}
	},


	// Go to the previous tab
	previousTab: function() {
		if(TabManager.isFirstTab()) return;

		if(TabManager.isLastTab()) {
			this._nextButton.innerText = "Next";
			this._copyButton.style.display = "none";

			window.CitationMessenger.send('click', 'start');
		}

		TabManager.previousTab();

		if(TabManager.isFirstTab()) {
			this._backButton.classList.add('button-disabled');
		}
	},


	// Choose text for a citation element
	choose: function(text) {
		CitationFormatter.setElement(TabManager._tabIds[TabManager._tabIndex], text);
	},


	// Update the citation from popup tabs
	updateCitation: function(name) {
		let tab = TabManager.getTab(name);
		let citation = CitationFormatter._citation;

		let months = [
			'January', 'February', 'March', 'April',
			'May', 'June', 'July', 'August',
			'September', 'October', 'November', 'December'
		];

		switch(name) {

			case 'Title':
				citation.title = tab.querySelector('textarea').value;
			break;

			case 'Authors':
				let authors = Array.from(tab.querySelectorAll('.fold-list-node'));

				citation.authors = [];

				for(let a in authors) {
					let props = authors[a].querySelectorAll('input');

					citation.authors.push([
						props[0].value,
						props[1].value,
						props[2].value,
						props[3].value
					]);
				}
			break;

			case 'Publishers':
				let publishers = Array.from(tab.querySelectorAll('.fold-list-node'));

				citation.publishers = [];

				for(let p in publishers) {
					citation.publishers.push(publishers[p].querySelector('input').value);
				}
			break;

			case 'Publish_Date':
				let pDate = Array.from(tab.querySelector('.date').children);

				citation.publishdate = {
					day: Number(pDate[0].value),
					month: months.indexOf(pDate[1].value) + 1,
					year: Number(pDate[2].value)
				};
			break;

			case 'Access_Date':
				let aDate = Array.from(tab.querySelector('.date').children);

				citation.accessdate = {
					day: Number(aDate[0].value),
					month: months.indexOf(aDate[1].value) + 1,
					year: Number(aDate[2].value)
				};
			break;

		}

		CitationFormatter._citation = citation;
	},


	// Update content of the popup tabs
	updateTabs: function(name, citation) {
		let tab = TabManager.getTab(name);

		let months = [
			'January', 'February', 'March', 'April',
			'May', 'June', 'July', 'August',
			'September', 'October', 'November', 'December'
		];

		switch(name) {

			case 'Title':
				tab.querySelector('textarea').value = citation.title;
				
				Textarea.update(tab.querySelector('textarea'));
			break;

			case 'Authors':
				ListManager.clear(tab.querySelector('.fold-list'));

				// Remove empty authors
				let aInd = citation.authors.length - 1;

				while(aInd >= 0) {
					if(citation.authors[aInd] === null) {
						citation.authors.splice(aInd, 1);
						continue;
					}

					aInd--;
				}

				// Create a list of authors
				let authors = [];

				for(let a in citation.authors) {
					let item = ListManager.createItem(citation.authors[a][1] || "[No Name]");

					item.add('input', citation.authors[a][0], { html: {
						placeholder: "Prefix"
					} });
					item.add('input', citation.authors[a][1], { html: {
						placeholder: "First Name"
					} });
					item.add('input', citation.authors[a][2], { html: {
						placeholder: "Middle Name"
					} });
					item.add('input', citation.authors[a][3], { html: {
						placeholder: "Last Name"
					} });

					authors.push(item);
				}

				ListManager.appendItems(tab.querySelector('.fold-list'), authors, (index) => {
					citation.authors[index] = null;
				});
			break;

			case 'Publishers':
				ListManager.clear(tab.querySelector('.fold-list'));

				// Remove empty publishers
				let pInd = citation.publishers.length - 1;

				while(pInd >= 0) {
					if(citation.publishers[pInd] === null) {
						citation.publishers.splice(pInd, 1);
						continue;
					}

					pInd--;
				}

				// Create a list of publishers
				let publishers = [];

				for(let p in citation.publishers) {
					let item = ListManager.createItem(citation.publishers[p] || "[No Name]");

					item.add('input', citation.publishers[p], { html: {
						placeholder: "Publisher"
					} });

					publishers.push(item);
				}

				ListManager.appendItems(tab.querySelector('.fold-list'), publishers, (index) => {
					citation.publishers[index] = null;
				});
			break;

			case 'Publish_Date':
				let pDate = Array.from(tab.querySelector('.date').children);

				pDate[0].value = citation.publishdate.day || "";
				pDate[1].value = months[citation.publishdate.month - 1] || "";
				pDate[2].value = citation.publishdate.year || "";
			break;

			case 'Access_Date':
				let aDate = Array.from(tab.querySelector('.date').children);

				aDate[0].value = citation.accessdate.day || "";
				aDate[1].value = months[citation.accessdate.month - 1] || "";
				aDate[2].value = citation.accessdate.year || "";
			break;

		}
	}

};
