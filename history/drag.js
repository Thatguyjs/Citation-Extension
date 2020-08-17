const DragManager = {

	// Current element being dragged
	_dragging: null,


	// Element offset & bounds
	_offset: {},
	_bounds: {},


	// Element parent info
	_parent: null,
	_parentChildren: [],
	_parentBounds: {},
	_parentChildNum: 0,


	// Copy of the element being dragged
	_dragCopy: null,


	// Placeholder drag element
	_placeholder: document.createElement('div'),


	// Drag direction
	_direction: 'vertical',


	// Last element position
	_lastPosition: null,


	// Drag callback
	_callback: null,


	// Move the element
	_move: function(event) {
		let x = event.clientX - DragManager._offset.x;
		let y = event.clientY - DragManager._offset.y;

		switch(DragManager._direction) {

			case 'vertical':
				x =	DragManager._bounds.x;
				break;

			case 'horizontal':
				y = DragManager._bounds.y;
				break;

		}

		if(x + DragManager._bounds.width / 4 < DragManager._parentBounds.x) {
			x = DragManager._parentBounds.x - DragManager._bounds.width / 4;
		}
		else if(x + DragManager._bounds.width * .75 > DragManager._parentBounds.endX) {
			x = DragManager._parentBounds.endX - DragManager._bounds.width * .75;
		}

		if(y + DragManager._bounds.height / 4 < DragManager._parentBounds.y) {
			y = DragManager._parentBounds.y - DragManager._bounds.height / 4;
		}
		else if(y + DragManager._bounds.height * .75 > DragManager._parentBounds.endY) {
			y = DragManager._parentBounds.endY - DragManager._bounds.height * .75;
		}

		DragManager._checkOrder(x, y);

		DragManager._dragCopy.style.left = x + 'px';
		DragManager._dragCopy.style.top = y + 'px';
	},


	// Check element order
	_checkOrder: function(x, y) {
		let index = 0;

		for(let c in this._parentChildren) {
			let bounds = this._parentChildren[c].getBoundingClientRect();

			if(this._direction === 'vertical' && y + this._bounds.height / 2 > bounds.y + bounds.height / 2) {
				index++;
			}
			else if(this._direction === 'horizontal' && x + this._bounds.width / 2 > bounds.x + bounds.width / 2) {
				index++;
			}
			else break;
		}


		if(index === this._lastPosition) return;
		this._lastPosition = index;

		if(index === this._parentChildNum) {
			this._parent.appendChild(this._placeholder);
		}
		else {
			this._parent.insertBefore(this._placeholder, this._parentChildren[index]);
		}
	},


	// Add movement listeners
	_addMoveListeners: function(event) {
		this._dragCopy.style.position = 'absolute';
		this._dragCopy.style.margin = '0';

		this._move(event);
		window.addEventListener('mousemove', this._move);
	},


	// Remove movement listeners
	_removeMoveListeners: function() {
		window.removeEventListener('mousemove', this._move);
	},


	// Start dragging an element
	drag: function(element, event, options={}) {
		if(this._dragging !== null) this.dragEnd();

		this._dragging = element;
		this._dragCopy = this._dragging.cloneNode(true);

		this._bounds = element.getBoundingClientRect();
		this._offset = {
			x: event.clientX - this._bounds.x,
			y: event.clientY - this._bounds.y
		};

		this._parent = element.parentNode;
		this._parentChildren = [...element.parentNode.children];
		this._parentChildNum = this._parent.children.length;

		this._parentBounds = element.parentNode.getBoundingClientRect();
		this._parentBounds.endX = this._parentBounds.x + this._parentBounds.width;
		this._parentBounds.endY = this._parentBounds.y + this._parentBounds.height;

		this._direction = options.direction || 'vertical';
		this._lastPosition = Array.prototype.indexOf.call(element.parentNode.children, element);

		if(options.filter) {
			this._parentChildren = [...this._parent.querySelectorAll(options.filter)];
		}

		let style = window.getComputedStyle(element);
		this._placeholder.style.width = style.width;
		this._placeholder.style.height = style.height;
		this._placeholder.style.margin = style.margin;
		this._placeholder.style.padding = style.padding;

		element.parentNode.replaceChild(this._placeholder, element);
		document.body.appendChild(this._dragCopy);

		this._addMoveListeners(event);
		window.addEventListener('mouseup', this.dragEnd.bind(this), { once: true });
		this._callback = options.callback || null;

		event.preventDefault();
	},


	// Stop dragging an element
	dragEnd: function() {
		this._removeMoveListeners();

		this._placeholder.parentNode.replaceChild(this._dragging, this._placeholder);
		document.body.removeChild(this._dragCopy);

		this._dragCopy = null;
		this._dragging = null;

		this._offset = {};
		this._bounds = {};

		this._parent = null;
		this._parentChildren = [];
		this._parentBounds = {};
		this._parentChildNum = 0;

		this._direction = 'vertical';

		this._lastPosition = null;

		if(this._callback) {
			this._callback();
			this._callback = null;
		}
	}

};
