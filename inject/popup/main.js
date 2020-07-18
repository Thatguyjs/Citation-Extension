// Handles the main citation popup


const CitationPopup = {

	// Citation format string
	_format: null,


	// Active citation
	_citation: {
		type: "Article",
		format: "",

		title: "",
		url: "",

		authors: [],
		publishers: [],

		publishdate: { day: null, month: null, year: null },
		accessdate: { day: null, month: null, year: null }
	},


	// Whether the active tab's content has been changed
	_tabContentChanged: false,


	// Tab reset button
	_resetButton: document.getElementById('tab-reset'),


	// Back / Copy / Next buttons
	_backButton: document.getElementById('button-back'),
	_copyButton: document.getElementById('button-copy'),
	_nextButton: document.getElementById('button-next'),


	// Init popup buttons & other data
	init: async function(format, domain) {
		await ExtStorage.init();
		Formatter.init();
		PathStorage.init(domain);

		// Set variables
		this._format = format;
		this._citation.format = format;
		CitationFormatter.init(format);

		// Get all possible elements & update the popup
		for(let e in CitationFormatter.elements) {
			window.CitationMessenger.send('get', CitationFormatter.elements[e]);

			this.updateCitation(
				CitationFormatter.elements[e],
				this._citation
			);
		}

		// Set up textareas
		Textarea.addAll(this.updateContent);

		// Reset the active tab's content
		this._resetButton.addEventListener('click', () => {
			CitationPopup.resetTab();
		});

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

			let authors = CitationPopup._citation.authors;
			authors.push(["", "", "", ""]);

			CitationPopup.updateTabs('Authors', { authors });
		});

		document.getElementById('add-publisher').addEventListener('click', () => {
			CitationPopup.updateCitation('Publishers');

			let publishers = CitationPopup._citation.publishers;
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
		this._tabContentChanged = false;

		if(TabManager.isLastTab()) {
			this._resetButton.style.display = "none";
			this._nextButton.innerText = "Save";
			this._copyButton.style.display = "inline-block";

			window.CitationMessenger.send('click', 'stop');
			CitationFinisher.finish(this._citation);
		}
	},


	// Go to the previous tab
	previousTab: function() {
		if(TabManager.isFirstTab()) return;

		if(TabManager.isLastTab()) {
			this._resetButton.style.display = "block";
			this._nextButton.innerText = "Next";
			this._copyButton.style.display = "none";

			window.CitationMessenger.send('click', 'start');
		}

		TabManager.previousTab();
		this._tabContentChanged = false;

		if(TabManager.isFirstTab()) {
			this._backButton.classList.add('button-disabled');
		}
	},


	// Reset the active tab
	resetTab: function() {
		let tabName = TabManager._tabIds[TabManager._tabIndex];
		let tab = TabManager.getTab(tabName);

		// Clear tab data
		switch(tabName) {

			case 'Title':
				tab.querySelector('textarea').value = "";

				Textarea.update(tab.querySelector('textarea'));
				break;

			case 'Authors':
			case 'Publishers':
				ListManager.clear(tab.querySelector('.fold-list'));
				break;

			case 'Publish_Date':
			case 'Access_Date':
				let date = tab.querySelector('.date').children;

				date[0].value = "";
				date[1].value = "";
				date[2].value = "";
				break;

		}

		// Get original tab data
		window.CitationMessenger.send('get', tabName);
		this.updateCitation(tabName, this._citation);

		// Tell the popup that content has changed
		this.updateContent(true);
	},


	// Choose text for a citation element
	choose: function(tab, string, options) {
		if(tab === null) tab = TabManager._tabIds[TabManager._tabIndex];
		let result = CitationFormatter.formatElement(tab, string, options);

		switch(tab) {

			case 'Title':
				this._citation.title = result;
				break;

			case 'Url':
				this._citation.url = result;
				break;

			case 'Authors':
				this._citation.authors.push(result);
				break;

			case 'Publishers':
				this._citation.publishers.push(result);
				break;

			case 'Access_Date':
				this._citation.accessdate = result;
				break;

			case 'Publish_Date':
				this._citation.publishdate = result;
				break;

		}

		this.updateTabs(tab, this._citation);
	},


	// Signal that tab content has been updated
	updateContent: function(forceRemove=false) {
		if(this._tabContentChanged) return;

		let tab = TabManager._tabIds[TabManager._tabIndex];

		if(forceRemove === true || PathStorage.get(tab)) {
			PathStorage.remove(tab);
		}

		this._tabContentChanged = true;
	},


	// Update the citation from popup tabs
	updateCitation: function(name) {
		let tab = TabManager.getTab(name);

		let months = [
			'January', 'February', 'March', 'April',
			'May', 'June', 'July', 'August',
			'September', 'October', 'November', 'December'
		];

		switch(name) {

			case 'Title':
				this._citation.title = tab.querySelector('textarea').value;
			break;

			case 'Authors':
				let authors = Array.from(tab.querySelectorAll('.fold-list-node'));

				this._citation.authors = [];

				for(let a in authors) {
					let props = authors[a].querySelectorAll('input');

					this._citation.authors.push([
						props[0].value,
						props[1].value,
						props[2].value,
						props[3].value
					]);
				}
			break;

			case 'Publishers':
				let publishers = Array.from(tab.querySelectorAll('.fold-list-node'));

				this._citation.publishers = [];

				for(let p in publishers) {
					this._citation.publishers.push(publishers[p].querySelector('input').value);
				}
			break;

			case 'Publish_Date':
				let pDate = Array.from(tab.querySelector('.date').children);

				this._citation.publishdate = {
					day: Number(pDate[0].value),
					month: (months.indexOf(pDate[1].value) + 1) || Number(pDate[1].value),
					year: Number(pDate[2].value)
				};
			break;

			case 'Access_Date':
				let aDate = Array.from(tab.querySelector('.date').children);

				this._citation.accessdate = {
					day: Number(aDate[0].value),
					month: (months.indexOf(aDate[1].value) + 1) || Number(aDate[1].value),
					year: Number(aDate[2].value)
				};
			break;

		}
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
					let item = ListManager.createItem(
						citation.authors[a].join(' ').trim() || "[No Name]",
						CitationPopup.updateContent
					);

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
					CitationPopup.updateContent();
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
					let item = ListManager.createItem(
						citation.publishers[p] || "[No Name]",
						CitationPopup.updateContent
					);

					item.add('input', citation.publishers[p], { html: {
						placeholder: "Publisher"
					} });

					publishers.push(item);
				}

				ListManager.appendItems(tab.querySelector('.fold-list'), publishers, (index) => {
					citation.publishers[index] = null;
					CitationPopup.updateContent();
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
