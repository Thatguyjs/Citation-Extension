// Load citations into the HTML


const CitationLoader = {

	// Citation list container
	_citationList: document.getElementById('citation-list'),


	// Citations loaded counter
	_citationCounter: document.getElementById('citations-loaded').querySelector('span'),
	_citationCounterNum: 0,


	// Citation template
	_template: null,


	// Load the citation template
	init: async function() {
		this._template = document.createElement('div');
		this._template.className = 'citation hidden';

		return new Promise((resolve) => {
			ExtStorage.readFile('saved/citation/citation.html', 'text', (data) => {
				this._template.innerHTML = data;
				document.body.appendChild(this._template);

				resolve();
			});
		});
	},


	// Load citations
	loadCitations: function(citations, section) {
		let elements = [];

		for(let c in citations) {
			elements.push(this.loadCitation(citations[c], section));
		}

		return elements;
	},


	// Load a single citation
	loadCitation: function(citation, section) {
		const element = this._template.cloneNode(true);
		element.classList.remove('hidden');

		const formatted = Formatter.format(citation);

		element.querySelector('.citation-name').innerText = citation.name;
		element.querySelector('.citation-preview').innerText = formatted;
		element.querySelector('.citation-body').innerText = formatted;
		element.querySelector('.citation-format').innerText = citation.format;
		element.querySelector('.citation-date').innerText = DateFormatter.asText(
			citation.created,
			{
				order: ['day', 'month', 'year'],
				shortMonths: true
			}
		);

		this._citationCounterNum++;
		this._citationCounter.innerText = this._citationCounterNum.toString();

		section.appendChild(element);
		return element;
	}

};
