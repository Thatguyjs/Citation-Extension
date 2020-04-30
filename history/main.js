const Main = {

	// Mouse position
	mouse: {
		x: 0,
		y: 0
	},


	// Initialize the main object
	init: function() {
		// Update mouse position
		window.addEventListener('mousemove', (event) => {
			Main.mouse.x = event.clientX;
			Main.mouse.y = event.clientY;
		});

		// Load the citation list
		this.loadCitations();

		// Refresh the citation list
		document.getElementById("refresh-list").addEventListener('click', () => {
			this.loadCitations();
		});

		// Override right-clicks
		window.addEventListener('contextmenu', (event) => {
			this.rclick(event);
			event.preventDefault();
		});
	},


	// Load all citations
	loadCitations: function() {
		ExtStorage.get("citation-storage", (data) => {
			CitationList.clear();

			// Stored as JSON (for now)
			CitationList.load({
				citations: data['citation-storage']
			}, this.eventCallback);
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

		citation.style.position = "absolute";
		citation.style.zIndex = 2;

		let mouseOffset = {
			x: Main.mouse.x - citation.getBoundingClientRect().x,
			y: Main.mouse.y - citation.getBoundingClientRect().y
		};

		let moveEvent = () => {
			citation.style.left = (Main.mouse.x - mouseOffset.x) + 'px';
			citation.style.top = (Main.mouse.y - mouseOffset.y) + 'px';
		}

		let releaseEvent = () => {
			let citationPos = citation.getBoundingClientRect();
			let insertAfter = -1;

			for(let c in allCitations) {
				let otherPos = allCitations[c].getBoundingClientRect();

				if(citationPos.y > otherPos.y) {
					insertAfter = Number(c);
				}
			}

			citation.parentNode.removeChild(citation);

			let insertBefore = document.getElementById("citation-num-" + (insertAfter + 1));

			if(insertBefore != null) {
				insertBefore.parentNode.insertBefore(citation, insertBefore);
			}
			else {
				document.getElementById("citation-list").appendChild(citation);
			}

			citation.style.position = "";
			citation.style.left = "";
			citation.style.top = "";

			citation.style.zIndex = "";

			window.removeEventListener('mousemove', moveEvent);
			window.removeEventListener('mouseup', releaseEvent);
		}

		window.addEventListener('mousemove', moveEvent);
		window.addEventListener('mouseup', releaseEvent);
	},


	// Callback to show all containers
	showContainers: function(citation) {
		console.log("TODO: Show all containers");
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
