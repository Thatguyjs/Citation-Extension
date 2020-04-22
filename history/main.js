const Main = {

	// Initialize the main object
	init: function() {

		// Stored as JSON for now
		ExtStorage.get("citation-storage", (data) => {
			CitationList.load({
				citations: data['citation-storage']
			});
		});


		// Override right-clicks
		window.addEventListener('contextmenu', (event) => {
			this.rclick(event);
			event.preventDefault();
		});
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
