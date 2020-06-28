// Dynamically resize textareas


const Textarea = {

	// A list of textareas
	_textareas: [],


	// Update a textarea's height
	_update: function(event) {
		event.target.style.height = '0';
		event.target.style.height = event.target.scrollHeight + 'px';
	},


	// Add all textareas in the current document
	addAll: function() {
		let elements = Array.from(document.getElementsByTagName('textarea'));

		for(let e in elements) {
			this.add(elements[e]);
		}
	},


	// Add a new textarea
	add: function(element) {
		element.addEventListener('input', this._update, false);

		return this._textareas.push(element) - 1;
	},


	// Update a textarea
	update: function(element) {
		this._update({ target: element });
	},


	// Remove a textarea
	remove: function(index) {
		if(index < 0 || index >= this._textareas.length) return;

		this._textareas[index].removeEventListener('input', this._update);

		this._textareas[index] = null;

		// Remove from the end
		index = this._textareas.length - 1;

		while(this._textareas[index] === null) {
			this._textareas.pop();
			index--;
		}
	}

};
