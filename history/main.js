const Main = {

	// Initialize the main object
	init: function() {
		// Create the initial tab
		CitationManager.createTab("My Citations", true);

		// Load the citation list
		this.loadCitations();

		// Override right-clicks
		window.addEventListener('contextmenu', (event) => {
			this.rclick(event);
			event.preventDefault();
		});

		// Set the event callback
		CitationManager.setCallback(this.eventCallback);
	},


	// Load local citations
	loadCitations: function() {
		ExtStorage.get("citation-storage", (data) => {
			if(!Array.isArray(data['citation-storage'])) {
				data['citation-storage'] = [];
			}

			// Load into the default tab
			CitationManager.setTab(0);
			CitationManager.clearTab();
			CitationManager.load(data['citation-storage'], []);
		});
	},


	// General event callback
	eventCallback: function(type, id, event) {
		let citation = CitationManager._activeTab._element.querySelector('.citation-num-' + id);

		switch(type) {

			case 'drag':
			return Main.dragCitation(citation);

			case 'show-containers':
			return Main.showContainers(citation);

		}
	},


	// Callback to start dragging a citation
	dragCitation: function(citation) {
		// Create a draggable element
		let clone = document.createElement('div');
		clone.className = 'drag-helper';

		let name = document.createElement('h2');
		name.innerText = citation.querySelector('.citation-name').innerText;

		let handle = document.createElement('img');
		handle.src = "svg/drag_handle.svg";

		clone.appendChild(name);
		clone.appendChild(handle);

		document.body.appendChild(clone);

		// Active tab & scrolling status
		let tab = citation.parentNode;
		let scrollDir = 0;
		let updateScroll = true;

		// Start dragging the element
		let drag = Drag.start(clone, {
			offset: {
				x: -clone.clientWidth + 15,
				y: -clone.clientHeight / 2
			},

			bounds: {
				x: [0, window.innerWidth],
				y: [0, window.innerHeight]
			},

			move: (x, y) => {
				if(y < 150) {
					scrollDir = -1;
				}
				else if(y > window.innerHeight - 90) {
					scrollDir = 1;
				}
				else if(scrollDir !== 0) {
					scrollDir = 0;
				}
			}
		});

		// Scroll through the tab
		function doScroll() {
			if(scrollDir < 0) {
				tab.scrollBy(0, -10);
			}
			else if(scrollDir > 0) {
				tab.scrollBy(0, 10);
			}

			if(updateScroll) window.requestAnimationFrame(doScroll);
		}

		doScroll();

		// Stop scrolling
		document.addEventListener('mouseup', () => {
			Drag.end(drag);
			updateScroll = false;

			// Get citation elements & update bounds
			let container = CitationManager._activeTab._element;

			let citations = Array.from(container.getElementsByClassName('citation'));
			let bounds = clone.getBoundingClientRect();

			// Remove the drag element
			document.body.removeChild(clone);

			// Choose the new position
			for(let c in citations) {
				let position = citations[c].getBoundingClientRect();

				if((bounds.y + bounds.height / 2) < (position.y - position.height / 2)) {
					let index = Number(c);

					container.insertBefore(citation, citations[index - 1]);
					return;
				}
			}

			// Insert at the end
			CitationManager._activeTab._element.appendChild(citation);
		}, { once: true })
	},


	// Callback to show all containers
	showContainers: function(citation) {
		console.log("TODO: Show all containers");
	},


	// Callback for right-clicking on the page
	rclick: function(event) {
		for(let e in event.path) {
			if(!event.path[e].className) continue;

			// Right-click on a citation
			if(event.path[e].classList.contains('citation-table')) {
				ContextMenu.create([
					"Copy",
					"Open Link",
					"#break",
					"Rename",
					"Edit",
					"#break",
					"Delete"
				], (index, text) => {
					this.citationMenuClick(text, event.path[e].parentNode);
				}, true);

				break;
			}

			// Right-click on a tab
			else if(event.path[e].classList.contains('tab-header')) {
				ContextMenu.create([
					"Close Tab",
					"Close Other Tabs",
					"Close All Tabs",
					"#break",
					"Merge With...",
					"#break",
					"Duplicate Tab"
				], (index, text) => {
					this.tabMenuClick(text, event.path[e]);
				}, true);
			}

		}
	},


	// Callback for clicking a citation context menu button
	citationMenuClick: function(text, container) {
		let index = container.className.slice(container.className.lastIndexOf('num-') + 4);

		switch(text) {

			case 'Copy':
				navigator.clipboard.writeText(
					container.querySelector('.citation-body').innerHTML
				).catch(alert);
			break;

			case 'Open Link':
				let citation = CitationManager._activeTab._citations[index];
				window.open(citation.url);
			break;

			case 'Rename':
				let name = prompt("Enter a Name:");

				if(name === null) break;
				if(name === '') name = "New Citation";

				container.querySelector('.citation-name').innerText = name;
				CitationManager._activeTab._citations[index].name = name;

				// Save name
				ExtStorage.get("citation-storage", (data) => {
					data['citation-storage'][Number(index)].name = name;

					ExtStorage.set(data);
				});
			break;

			case 'Edit':
				alert("Editing is not implemented yet");
			break;

			case 'Delete':
				if(confirm("Delete the citation?")) {

					// TODO: Fix deletion bug
					ExtStorage.get("citation-storage", (data) => {
						data['citation-storage'].splice(Number(index), 1);

						ExtStorage.set(data);
					});

					CitationManager._activeTab._element.removeChild(container);
				}
			break;

		}
	},


	// Callback for clicking a tab context menu button
	tabMenuClick: function(text, tab) {
		let index = tab.id.slice(tab.id.lastIndexOf('-') + 1);
		let name = tab.querySelector('span').innerHTML;

		let clickedTab = CitationManager._tabs[Number(index)];

		switch(text) {

			// Closing stuff
			case 'Close Tab':
				tab.querySelector('button').click();
			break;

			case 'Close Other Tabs':
				for(let t in CitationManager._tabs) {
					if(t === index) continue;

					CitationManager.removeTab(Number(t));
				}
			break;

			case 'Close All Tabs':
				for(let t in CitationManager._tabs) {
					CitationManager.removeTab(Number(t));
				}
			break;


			// Modification stuff
			case 'Merge With...':
				alert("Merging is not implemented yet!");
			break;


			// Other tab stuff
			case 'Duplicate Tab':
				CitationManager.createTab(name + ' (duplicate)', true);
				CitationManager.load(clickedTab._citations, clickedTab._containers);
			break;

		}
	}

};
