class Dropdown {

	// Dropdown element & button
	element = null;
	button = null;


	// Dropdown state
	open = false;


	// Event list
	#events = {};


	// Dispatch an event
	#dispatch(eventName, ...data) {
		const events = this.#events[eventName];
		if(!events) return;

		for(let e in events) {
			events[e].callback(...data);
			if(events[e].once) this.removeListener(eventName, +e);
		}
	}


	constructor(element) {
		if(!element || !element.classList.contains('dropdown')) {
			throw new Error("Invalid dropdown element");
		}

		this.element = element;
		this.button = element.querySelector('button');

		// Event dispatchers

		this.element.addEventListener('focusin', (event) => {
			if(!this.open) this.#dispatch('open', event);
			this.open = true;
		});

		this.element.addEventListener('focusout', (event) => {
			if(this.open) this.#dispatch('close', event);
			this.open = false;
		});

		this.element.addEventListener('click', (event) => {
			const target = event.target;

			if(target.classList.contains('dropdown-button')) {
				this.#dispatch('select', event, target, target.getAttribute('name'));
			}
			else if(target.classList.contains('dropdown-menu')) {
				this.#dispatch('menu', event, target, target.getAttribute('name'));
			}
		});
	}


	// Add an event listener
	on(eventName, callback, once=false) {
		if(!eventName || !callback) return;
		if(!this.#events[eventName]) this.#events[eventName] = [];

		return this.#events[eventName].push({
			callback,
			once
		}) - 1;
	}


	// Remove an event listener
	removeListener(eventName, id) {
		if(!this.#events[eventName]) return;
		if(id < 0 || id >= this.#events[eventName].length) return;

		this.#events[eventName][id] = null;

		// Clean up
		let index = this.#events[eventName].length;

		while(this.#events[eventName][--index] === null) {
			this.#events[eventName].pop();
		}
	}
}
