const Main = {

	// Initialize the main object
	init: function() {

		// Stored as JSON for now
		ExtStorage.get("citation-storage", (data) => {
			CitationList.load({
				citations: data['citation-storage']
			}, this.eventCallback);
		});

		// Override right-clicks
		window.addEventListener('contextmenu', (event) => {
			this.rclick(event);
			event.preventDefault();
		});
	},


	// General event callback
	eventCallback: function(type, id) {
		switch(type) {

			case 'drag':
			return Main.dragCitation(id);

			case 'show-containers':
			return Main.showContainers(id);

		}
	},


	// Drag citations
	dragCitation: function(id) {
		let citation = document.getElementById("citation-num-" + id);
		let allCitations = Array.from(document.getElementsByClassName("citation"));

		console.log(allCitations[0].getBoundingClientRect());

		//citation.style.position = "absolute";

		console.log("Drag");

		let releaseEvent = () => {

			window.removeEventListener('mouseup', releaseEvent);
		}

		window.addEventListener('mouseup', releaseEvent);
	},


	// Callback to show all containers
	showContainers: function(citation) {
		console.log("EEE");
	},


	// Callback for right-clicking on the page
	rclick: function(event) {
		for(let e in event.path) {
			if(!event.path[e].className) continue;

			// Click on a citation
			if(event.path[e].classList.contains('citation-table')) {
				ContextMenu.create([
					"Copy",
					"#break",
					"Edit",
					"Delete"
				], (index, text) => {
					this.menuClick(text, event.path[e].parentNode);
				}, true);

				break;
			}

		}
	},


	// Callback for clicking a context menu button
	menuClick: function(text, container) {
		switch(text) {

			case 'Copy':
				navigator.clipboard.writeText(
					container.querySelector('.citation-body').innerHTML
				).catch(alert);
			break;

			case 'Edit':
				alert("Editing is not implemented yet");
			break;

			case 'Delete':
				if(confirm("Delete the citation?")) {
					let index = container.id.slice(container.id.lastIndexOf('-') + 1);
					index = Number(index);

					ExtStorage.get("citation-storage", (data) => {
						data['citation-storage'].splice(index, 1);

						// TEMP COMMENT
						ExtStorage.set(data);
					});

					document.getElementById("citation-list").removeChild(container);
				}
			break;

		}
	}

};
