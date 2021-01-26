const Main = {

	// "New" dropdown menu
	_createMenu: new Dropdown(document.getElementById('create-dropdown')),


	init: function() {
		/* const citations = [
			{
				name: "My citation name",

				containers: ["My container name", "Second container"],

				type: null,
				format: "IEEE",

				title: "Some News Article Title",
				url: "https://article-url.com",

				authors: [
					{
						prefix: "Prefix",
						firstname: "First",
						middlename: "Middle",
						lastname: "Last"
					},
					{
						prefix: "Prefix",
						firstname: "First",
						middlename: "Middle",
						lastname: "Last"
					}
				],

				publishers: [
					"Publisher 1",
					"Publisher 2"
				],

				publishdate: {
					day: 11,
					month: "February",
					year: 2016
				},

				accessdate: {
					day: 18,
					month: "March",
					year: 2020
				}
			},
			{
				name: "NAME",

				containers: ["Main", "Other"],

				type: null,
				format: "MLA8",

				title: "Another title?!?",
				url: "https://abelintegration.com",

				authors: [
					{
						prefix: "Prefix 1",
						firstname: "First 1",
						middlename: "Middle 1",
						lastname: "Last 1"
					},
					{
						prefix: "Prefix 2",
						firstname: "First 2",
						middlename: "Middle 2",
						lastname: "Last 2"
					}
				],

				publishers: [
					"P3",
					"Pub. 4"
				],

				publishdate: {
					day: 26,
					month: "August",
					year: 2004
				},

				accessdate: {
					day: 21,
					month: "November",
					year: 2020
				}
			}
		]; */

		// let exp = HistoryFormatter.export({
		// 	citations,
		// 	containers: []
		// });

		// chrome.downloads.download({
		// 	url: exp,
		// 	filename: 'history.chf',
		// 	saveAs: true
		// });


		// let imp = HistoryFormatter._loadFile(HistoryFormatter._compileHistory({
		// 	citations,
		// 	containers: []
		// }));

		// console.log(imp);


		// Temp
		PopupManager.add('default', 'Info', { type: 'info', duration: 3 });
		PopupManager.add('default', 'Success', { type: 'success', duration: 3.5 });
		PopupManager.add('default', 'Warning', { type: 'warning', duration: 4 });
		PopupManager.add('default', 'Error', { type: 'error', duration: 4.5 });


		// Dropdown events
		this._createMenu.on('select', this._createMenuEvent.bind(this));


		// Load local citations
		if(!window.opener) {
			ExtStorage.getPreset('citations', (error, citations) => {
				CitationManager.loadCitations(citations);
			});
		}

		// Load citations from the parent window
		else {
			window.addEventListener('citations', (event) => {
				CitationManager.loadCitations(event.detail);
			});
		}
	},


	// Creation menu dropdown events
	_createMenuEvent: function(event, button, name) {
		switch(name) {

			// Create a new container
			case 'container':
				console.log("Todo: create container");
				break;

			// Create an empty citation
			case 'citation':
				console.log("Todo: create blank citation");
				break;

			// Import to the current tab
			case 'import-current':
				CitationManager.importCitations('current');
				break;

			// Import to a new tab
			case 'import-new':
				CitationManager.importCitations('new');
				break;

		}
	}

};
