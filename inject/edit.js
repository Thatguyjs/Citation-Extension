// Edit & review the citation after it's completed


window.CitationEditor = {

	// @description: The citation review elements
	_elements: [],

	// @description: The citation review textareas
	_textareas: [],

	// @description: The buttons to add a new author / publisher
	_addAuthor: null,
	_addPublisher: null,


	// @description: The current citation element for editing
	_current: 0,


	// @description: Edit the next citation element
	_nextButton: null,

	// @description: Edit the previous citation element
	_prevButton: null,


	// @description: Holds the citation object generated from "parse.js"
	_citation: {},


	// @description: Loads everything necessary for editing
	init: function() {
		this._elements = Array.from(document.getElementsByClassName("citation-ext-edit"));

		for(let e in this._elements) {
			if(e == this._current) continue;
			this._elements[e].style.display = "none";
		}


		this._nextButton = document.getElementsByClassName("citation-ext-editnext")[0];
		this._nextButton.addEventListener('click', () => {
			this.nextEdit();
		});

		this._prevButton = document.getElementsByClassName("citation-ext-editback")[0];
		this._prevButton.addEventListener('click', () => {
			this.prevEdit();
		});


		this._addAuthor = document.getElementsByClassName("citation-ext-addauthor")[0];
		this._addAuthor.addEventListener('click', () => {
			let node = this.createListItem("Author", [
				["Prefix", ''],
				["First Name", ''],
				["Middle Name", ''],
				["Last Name", '']
			]);

			this._elements[this._current].children[1].appendChild(node);
		});

		this._addPublisher = document.getElementsByClassName("citation-ext-addpublisher")[0];
		this._addPublisher.addEventListener('click', () => {
			let node = this.createListItem("Publisher", [
				["Name", '']
			]);

			this._elements[this._current].children[1].appendChild(node);
		});


		window.CitationConstructor.addListener('finish', (citation) => {
			this._citation = citation;
			this._fillCitationData();
			this._loadCitationData();

			this._textareas = Array.from(document.getElementsByClassName("citation-ext-textarea"));
			this._setupTextareas();
		});
	},


	// @description: Create missing citation elements (empty values)
	_fillCitationData: function() {
		let itemList = {
			type: "",
			title: "",
			url: "",
			authors: [], publishers: [],
			publishdate: {
				day: "", month: "", year: ""
			},
			accessdate: {
				day: "", month: "", year: ""
			}
		};

		for(let item in itemList) {
			if(!this._citation[item]) {
				this._citation[item] = itemList[item];
			}
		}
	},


	// @description: Toggle a list's visibility
	_toggleList: function(event) {
		let parent = event.target.parentNode;
		let list = parent.parentNode;

		if(parent.children[1].classList.contains("citation-ext-listhidden")) {
			for(let e in list.children) {
				if(e === '0' || !list.children[e].classList) continue;
				if(list.children[e] === parent.children[1]) continue;

				list.children[e].children[1].classList.add("citation-ext-listhidden");
			}
		}

		parent.children[1].classList.toggle("citation-ext-listhidden");
	},


	// @description: Loads the citation data into the popup
	_loadCitationData: function() {
		for(let e in this._elements) {
			let children = this._elements[e].children;

			switch(this._elements[e].getAttribute('name')) {

				case "title":
					children[1].value = this._citation.title;
				break;

				case "publishdate":
					children[1].value = this._citation.publishdate.day;
					children[2].value = this._citation.publishdate.month;
					children[3].value = this._citation.publishdate.year;
				break;

				case "authors":
					for(let a in this._citation.authors) {
						let node = this.createListItem("Author", [
							["Prefix", this._citation.authors[a].prefix],
							["First name", this._citation.authors[a].firstname],
							["Middle name", this._citation.authors[a].middlename],
							["Last name", this._citation.authors[a].lastname]
						]);

						children[1].appendChild(node);
					}
				break;

				case "publishers":
					for(let p in this._citation.publishers) {
						let node = this.createListItem("Publisher", [
							["Name", this._citation.publishers[p]]
						]);

						children[1].appendChild(node);
					}
				break;

			}
		}
	},


	// @description: Setup custom textarea behavior
	_setupTextareas: function() {
		for(let t in this._textareas) {
			this._textareas[t].style.height = "18px";
			this._textareas[t].style.height = this._textareas[t].scrollHeight - 4 + 'px';

			this._textareas[t].addEventListener('input', () => {
				this._textareas[t].style.height = "18px";
				this._textareas[t].style.height = this._textareas[t].scrollHeight - 4 + 'px';
			});
		}
	},


	// @description: Create a list item
	createListItem: function(name, children) {
		let inputs = [];

		for(let c in children) {
			inputs.push({
				type: "input",
				class: "citation-ext-input",
				direct: {
					placeholder: children[c][0],
					value: children[c][1]
				}
			});
		}

		return createElement({
			type: "div",
			class: "citation-ext-listnode",
			children: [
				{
					type: "button",
					class: "citation-ext-itemtoggle",
					direct: { onclick: this._toggleList },
					html: name
				},
				{
					type: "div",
					class: "citation-ext-listdata citation-ext-listhidden",
					children: inputs
				}
			]
		});
	},


	// @description: Move to the next item
	nextEdit: function() {
		if(!this._nextButton.classList.contains("citation-ext-disabled")) {
			this._current++;

			// Render next element
			for(let e in this._elements) {
				if(e == this._current) this._elements[e].style.display = "block";
				else this._elements[e].style.display = "none";
			}

			// Update local citation
			this.updateCitation(this._current);

			// Update buttons
			if(this._current === this._elements.length - 2) {
				this._nextButton.innerHTML = "Finish";
			}
			else if(this._current >= this._elements.length - 1) {
				this._nextButton.classList.add("citation-ext-disabled");

				// Finished editing
				window.CitationStorage.store(this._citation);
			}
		}
	},


	// @description: Move to the previous item
	prevEdit: function() {
		if(this._current > 0) {
			this._current--;

			// Render next element
			for(let e in this._elements) {
				if(e == this._current) this._elements[e].style.display = "block";
				else this._elements[e].style.display = "none";
			}

			// Update buttons
			if(this._current === this._elements.length - 2) {
				this._nextButton.classList.remove("citation-ext-disabled");
			}
			else if(this._current === this._elements.length - 3) {
				this._nextButton.innerHTML = "Next";
			}
		}

		// Go back to the input stages
		else {
			window.CitationConstructor._finished = false;
			window.CitationConstructor.prevElement();

			document.getElementsByClassName("citation-ext-review")[0].style.display = "none";
			document.getElementsByClassName("citation-ext-update")[0].style.display = "block";
		}
	},


	// @description: Update the local citation
	updateCitation: function() {
		let element = this._elements[this._current - 1];
		let children = element.children;

		let months = [
			'jan', 'feb', 'mar', 'apr',
			'may', 'jun', 'jul', 'aug',
			'sep', 'oct', 'Nov', 'dec'
		];

		switch(element.getAttribute('name')) {

			case 'title':
				this._citation.title = children[1].value;
			break;

			case 'publishdate':
				let month = children[2].value.slice(0, 3);
				month = months.indexOf(month.toLowerCase()) + 1;

				this._citation.publishdate.day = children[1].value;
				this._citation.publishdate.month = month.toString();
				this._citation.publishdate.year = children[3].value;
			break;

			case 'authors':
				this._citation.authors = [];

				for(let a in children[1].children) {
					if(a === '0' || !children[1].children[a].className) continue;

					let items = children[1].children[a].children[1].children;

					this._citation.authors.push([
						items[0].value,
						items[1].value,
						items[2].value,
						items[3].value
					]);
				}
			break;

			case 'publishers':
				this._citation.publishers = [];

				for(let p in children[1].children) {
					if(p === '0' || !children[1].children[p].className) continue;

					let items = children[1].children[p].children[1].children;

					this._citation.publishers.push(items[0].value);
				}
			break;

		}
	}

};
