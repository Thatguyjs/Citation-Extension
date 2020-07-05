// Let the popup be dragged around the screen

(function() {
	let dragging = false;

	let pos = window['citation-ext-container'].getBoundingClientRect();
	let mouse = { x: 0, y: 0 }; // Initial mouse distance from corner of popup


	// Start dragging
	window['citation-ext-header'].addEventListener('mousedown', (event) => {
		dragging = true;

		mouse.x = event.clientX - pos.x;
		mouse.y = event.clientY - pos.y;

		// Prevent iframe pointer events
		window['citation-ext-popup'].style.pointerEvents = 'none';

		event.preventDefault();
	});


	// Stop dragging
	document.addEventListener('mouseup', () => {
		if(dragging) {
			dragging = false;
			pos = window['citation-ext-container'].getBoundingClientRect();

			// Allow iframe pointer events
			window['citation-ext-popup'].style.pointerEvents = 'all';
		}
	});


	// Update position
	document.addEventListener('mousemove', (event) => {
		if(dragging) {
			let newPos = {
				x: event.clientX - mouse.x,
				y: event.clientY - mouse.y
			};

			// Constrain position
			if(newPos.x < 0) {
				newPos.x = 0;
			}
			else if(newPos.x + pos.width > window.innerWidth) {
				newPos.x = window.innerWidth - pos.width;
			}

			if(newPos.y < 0) {
				newPos.y = 0;
			}
			else if(newPos.y + 36 > window.innerHeight) {
				newPos.y = window.innerHeight - 36; // 36 is the header height
			}

			// Set position
			window['citation-ext-container'].style.left = newPos.x + 'px';
			window['citation-ext-container'].style.top = newPos.y + 'px';
		}
	});


	// Contrain a value
	function constrain(val, min, max) {
		if(val < min) return min;
		if(val > max) return max;
		return val;
	}


	// Check position after resizing the window
	window.addEventListener('resize', () => {
		let newPos = {
			x: constrain(pos.x, 0, window.innerWidth - pos.width),
			y: constrain(pos.y, 0, window.innerHeight - pos.height)
		};

		// Set position
		window['citation-ext-container'].style.left = newPos.x + 'px';
		window['citation-ext-container'].style.top = newPos.y + 'px';

		// Update variables
		pos = window['citation-ext-container'].getBoundingClientRect();
	});

})();
