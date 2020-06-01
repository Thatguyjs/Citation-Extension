// Create custom context menus


const ContextMenu = {

	// The current mouse position
	_mouse: {
		x: null,
		y: null
	},


	// The list of context menus
	_menus: [],


	// Load the context-menu stylesheet
	init: function() {
		let sheet = document.createElement('link');
		sheet.rel = "stylesheet";
		sheet.href = "../general/contextmenu.css";

		document.head.appendChild(sheet);
	},


	// Create a new context menu
	create: function(items, callback, oneUse) {
		let menuNum = this._menus.length;

		let container = document.createElement('div');
		container.className = "context-menu";

		for(let i in items) {

			// Add a line break
			if(items[i] === '#break') {
				let elem = document.createElement('span');
				elem.className = 'context-menu-break';

				container.appendChild(elem);
			}

			// Add an element
			else {
				let elem = document.createElement('span');
				elem.className = 'context-menu-item';
				elem.innerHTML = items[i];

				elem.addEventListener('click', (event) => {
					callback(Number(i), elem.innerHTML, event);

					// Remove menu automatically
					if(oneUse) ContextMenu.destroy(menuNum);
				});

				container.appendChild(elem);
			}

		}

		// Move to the mouse
		container.style.left = this._mouse.x + 'px';
		container.style.top = this._mouse.y + 'px';

		// Append to the page
		document.body.appendChild(container);

		// Reposition if the menu is past window bounds
		let position = container.getBoundingClientRect();

		if(position.x + position.width >= window.innerWidth) {
			container.style.left = position.x - position.width + 'px';
		}
		if(position.y + position.height >= window.innerHeight) {
			container.style.top = position.y - position.height + 'px';
		}

		// Remove after clicking
		if(oneUse) {
			let listener = () => {
				ContextMenu.destroy(menuNum);
				document.body.removeEventListener('click', listener);
			};

			document.body.addEventListener('click', listener);
		}

		// Prevent multiple menus
		for(let m = 0; m < this._menus.length; m++) {
			ContextMenu.destroy(m);
		}

		return this._menus.push(container) - 1;
	},


	// Remove a context menu
	destroy: function(index) {
		if(!this._menus[index]) return -1;

		document.body.removeChild(this._menus[index]);
		this._menus[index] = null;

		while(this._menus.slice(-1) === null) {
			this._menus.splice(this._menus.length - 1, 1);
		}

		return 0;
	}

};


// Update the mouse coordinates
window.addEventListener('mousemove', (event) => {
	ContextMenu._mouse.x = event.clientX;
	ContextMenu._mouse.y = event.clientY;
});
