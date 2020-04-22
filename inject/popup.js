// Create an in-page popup for getting citation data


// Define the popup class
window.InjectedPopup = {

	// @description: The popup's root <div> element
	container: null,


	// @description: The citation's progress text
	progressText: null,


	// @description: Positional & event data for the popup
	position: {
		x: 0,
		y: 0,
		dragging: false
	},


	// @description: The position of the mouse
	mouse: {
		x: 0,
		y: 0
	},


	// @description: Initialize the popup, add the container and stylesheet to the document body
	init: function() {
		let container = createElement({
			type: "div",
			class: "citation-ext-popup",
			children: [
				{
					type: "div",
					class: "citation-ext-titlebar",
					children: [
						{
							type: "h1",
							html: "Citation Maker"
						},

						{
							type: "button",
							class: "citation-ext-close",
							html: "X"
						}
					]
				},

				{
					type: "div",
					class: "citation-ext-body",
					children: [
						{
							type: "div",
							class: "citation-ext-panel citation-ext-update",
							children: [
								{
									type: "h1",
									class: "citation-ext-item",
									html: "loading..."
								},
								{
									type: "p",
									html: "Click on text to set the citation element above"
								},

								{
									type: "button",
									class: "citation-ext-back",
									html: "Back"
								},
								{
									type: "button",
									class: "citation-ext-next",
									html: "Next"
								}
							]
						},

						{
							type: "div",
							class: "citation-ext-panel citation-ext-review",
							style: { display: "none" },
							children: [
								{
									type: "h1",
									html: "Edit Citation"
								},

								{
									type: "div",
									name: "title",
									class: "citation-ext-edit citation-ext-title",
									children: [
										{
											type: "h2",
											html: "Title"
										},
										{
											type: "textarea",
											class: "citation-ext-textarea",
											direct: { placeholder: "Article Title" }
										}
									]
								},
								{
									type: "div",
									name: "publishdate",
									class: "citation-ext-edit citation-ext-publishdate",
									children: [
										{
											type: "h2",
											html: "Publish Date"
										},
										{
											type: "input",
											class: "citation-ext-input",
											direct: { placeholder: "Day", type: "number" }
										},
										{
											type: "input",
											class: "citation-ext-input",
											direct: { placeholder: "Month", type: "text" }
										},
										{
											type: "input",
											class: "citation-ext-input",
											direct: { placeholder: "Year", type: "number" }
										}
									]
								},
								{
									type: "div",
									name: "authors",
									class: "citation-ext-edit",
									children: [
										{
											type: "h2",
											html: "Authors"
										},
										{
											type: "div",
											class: "citation-ext-list",
											children: [
												{
													type: "button",
													class: "citation-ext-listadd citation-ext-addauthor",
													html: "+ Add Author"
												}
											]
										}
									]
								},
								{
									type: "div",
									name: "publishers",
									class: "citation-ext-edit",
									children: [
										{
											type: "h2",
											html: "Publishers"
										},
										{
											type: "div",
											class: "citation-ext-list",
											children: [
												{
													type: "button",
													class: "citation-ext-listadd citation-ext-addpublisher",
													html: "+ Add Publisher"
												}
											]
										}
									]
								},
								{
									type: "div",
									class: "citation-ext-edit citation-ext-finish",
									children: [
										{
											type: "p",
											html: "Click on the Citation Extension again to finish the current citation"
										}
									]
								},

								{
									type: "button",
									class: "citation-ext-editback",
									html: "Back"
								},
								{
									type: "button",
									class: "citation-ext-editnext",
									html: "Next"
								}
							]
						}
					]
				}
			]
		});

		// Position of the popup
		container.style.right = "80px";
		container.style.top = "40px";

		document.body.appendChild(container);

		this.container = container;
		this.progressText = document.getElementsByClassName("citation-ext-item")[0];

		// Connect "close" button
		document.getElementsByClassName("citation-ext-close")[0].addEventListener('click', () => {
			this.destroy();
		});

		// Connect "next" and "back" buttons
		document.getElementsByClassName("citation-ext-next")[0].addEventListener('click', () => {
			this._next();
		});

		document.getElementsByClassName("citation-ext-back")[0].addEventListener('click', () => {
			this._back();
		});


		// Connect the resize event
		window.CitationListeners.add(window, 'resize', () => {
			this.reposition();
		});

		this.reposition();
		this._init_drag();


		// Init citation constructor
		let citationFormat = sessionStorage.getItem('citationExtFormat');

		if(citationFormat) window.CitationConstructor.createCitation(citationFormat);
		else {
			window.CitationLogger.error("Citation format not found.");
			return this.destroy();
		}

		if(!window.CitationConstructor._currentFormat) {
			return this.destroy();
		}


		// Update / Finish citation
		window.CitationConstructor.addListener('update', () => this.updateCitation());
		window.CitationConstructor.addListener('click', () => this.updateCitation());
		window.CitationConstructor.addListener('finish', () => this.finishCitation());

		this.updateCitation();

		// Init citation editor
		window.CitationEditor.init();


		window.CitationLogger.log("Added citation popup");
	},


	// @description: Remove the popup window and all related data
	destroy: function() {
		document.body.removeChild(document.getElementsByClassName('citation-ext-popup')[0]);

		// Remove stylesheets
		let sheets = Array.from(document.getElementsByClassName('citation-ext-style'));

		for(let i in sheets) {
			document.body.removeChild(sheets[i]);
		}

		// Remove scripts
		let scripts = Array.from(document.getElementsByClassName('citation-ext-script'));

		for(let i in scripts) {
			document.body.removeChild(scripts[i]);
		}

		// Allow links, remove all listeners
		window.CitationConstructor.allowLinks();
		window.CitationListeners.removeAll();

		// Remove defintions
		delete window.CitationConstructor;
		delete window.CitationParser;
		delete window.CitationEditor;
		delete window.InjectedPopup;

		window.CitationLogger.log("Removed citation popup");
	},


	// @description: Position the local x / y to the html container x / y, contrain the popup
	reposition: function() {
		let box = this.container.getBoundingClientRect();

		// Constrain vertically
		if(box.top < 0)
			this.container.style.top = "0px";
		else if(box.top > window.innerHeight - 36)
			this.container.style.top = window.innerHeight - 36 + "px";

		// Constrain horizontally
		if(box.left < 0)
			this.container.style.left = "0px";
		else if(box.right > window.innerWidth)
			this.container.style.left = window.innerWidth - box.width + "px";

		box = this.container.getBoundingClientRect();
		this.position.x = box.left;
		this.position.y = box.top;
	},


	updateCitation: function() {
		if(window.CitationConstructor._finished) return;

		// Capitalize first letter
		let text = window.CitationConstructor.getCurrentElement();
		text = text[0].toUpperCase() + text.slice(1);

		// Extra formatting
		if(text === 'Publishdate') {
			text = "Publish Date";
		}
		else if(text === 'Accessdate') {
			text = "Access Date";
		}
		else if(text === 'Authors') {
			let authors = window.CitationConstructor._citation.authors;
			authors = authors ? authors.length : 0;
			text += ` (${authors})`;
		}
		else if(text === 'Publishers') {
			let publishers = window.CitationConstructor._citation.publishers;
			publishers = publishers ? publishers.length : 0;
			text += ` (${publishers})`;
		}

		// Set display text
		this.progressText.innerHTML = text;
	},


	// @description: Finish gathering data, review next
	finishCitation: function() {
		this.progressText.innerHTML = "Finished";

		document.getElementsByClassName("citation-ext-update")[0].style.display = "none";
		document.getElementsByClassName("citation-ext-review")[0].style.display = "block";
	},


	// @description: Setup dragging functionality
	_init_drag: function() {
		let bar = document.getElementsByClassName("citation-ext-titlebar")[0];

		// Add drag listener
		bar.addEventListener('mousedown', (event) => {
			this.position.dragging = true;

			this.mouse.x = event.clientX;
			this.mouse.y = event.clientY;
		});

		// Remove drag listener
		window.CitationListeners.add(document, 'mouseup', () => {
			if(this.position.dragging)
				this.position.dragging = false;
		});

		// Drag popup
		window.CitationListeners.add(document, 'mousemove', (event) => {
			if(this.position.dragging) {
				this._drag(event.clientX, event.clientY);
				return false;
			}
		});
	},


	// @description: Move the popup by an offset (pixels)
	_drag: function(x, y) {
		this.container.style.left = this.position.x + x - this.mouse.x + "px";
		this.container.style.top = this.position.y + y - this.mouse.y + "px";

		this.position.x += x - this.mouse.x;
		this.position.y += y - this.mouse.y;

		this.reposition();

		this.mouse.x = x;
		this.mouse.y = y;
	},


	// @description: Goes to the next input field
	_next: function() {
		window.CitationConstructor.nextElement();
	},


	// @description: Goes to the previous input field
	_back: function() {
		window.CitationConstructor.prevElement();
	}

};


// Init popup
InjectedPopup.init();
