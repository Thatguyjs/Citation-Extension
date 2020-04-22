// Store citations in localStorage


window.CitationStorage = {

	// @description: Citation storage id
	id: "citation-ext-result",


	// @description: Store a citation
	store: function(citation) {
		citation.format = sessionStorage.getItem("citationExtFormat");

		let string = JSON.stringify(citation);
		localStorage.setItem(this.id, string);
	},


	// @description: Get a citation
	get: function(remove) {
		let citation = localStorage.getItem(this.id);

		if(remove)
			localStorage.remove(this.id);

		return citation;
	}

};
