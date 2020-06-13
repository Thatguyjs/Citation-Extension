// Drag citations into different locations


const Drag = {

	// Listening for mouse changes
	_listening: false,


	// Active drag elements
	_active: [],


	// Recieve a mousemove event
	_move: function(event) {
		Drag.update(event.clientX, event.clientY);
	},


	// Start dragging an element
	start: function(element, options={}) {
		if(!element) return;

		if(!this._listening) {
			document.addEventListener('mousemove', this._move);
		}

		return this._active.push({
			element,
			options,
			bounds: element.getBoundingClientRect()
		}) - 1;
	},


	// Update element positions
	update: function(x, y) {
		for(let i in this._active) {
			let options = this._active[i].options;
			let lock = options.lock || {};

			// Add offset
			if(options.offset) {
				x += options.offset.x;
				y += options.offset.y;
			}

			// Restrict position
			if(options.bounds) {
				if(x < options.bounds.x[0]) x = options.bounds.x[0];
				if(x + this._active[i].bounds.width > options.bounds.x[1]) {
					x = options.bounds.x[1] - this._active[i].bounds.width;
				}

				if(y < options.bounds.y[0]) y = options.bounds.x[0];
				if(y + this._active[i].bounds.height > options.bounds.y[1]) {
					y = options.bounds.y[1] - this._active[i].bounds.height;
				}
			}

			if(!lock.x) this._active[i].element.style.left = x + 'px';
			if(!lock.y) this._active[i].element.style.top = y + 'px';
		}
	},


	// Stop dragging an element
	end: function(index) {
		if(index < 0 || index >= this._active.length) return;

		this._active[index] = null;

		// Clear the end of the array
		index = this._active.length - 1;

		while(this._active[index] === null) {
			this._active.pop();
			index--;
		}

		// Check if there are not more elements
		if(index < 0) {
			document.removeEventListener('mousemove', this._move);
		}
	}

};
