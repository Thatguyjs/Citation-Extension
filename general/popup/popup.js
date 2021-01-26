const PopupManager = {

	// Popup containers
	_containers: {},


	// List of popups
	popups: [],


	// Get popup containers
	init: function() {
		const containers = [...document.getElementsByClassName('popup-container')];

		for(let c in containers) {
			const name = containers[c].getAttribute('name');
			this._containers[name] = containers[c];
		}
	},


	// Construct a popup element
	createElement: function(text, options={}) {
		if(!options.type) options.type = 'info';

		const base = document.createElement('div');
		base.classList.add('popup');
		base.classList.add('popup-' + options.type);

		const colorBar = document.createElement('div');
		colorBar.classList.add('popup-color');

		const textElem = document.createElement('p');
		textElem.innerText = text;

		base.append(colorBar, textElem);
		return base;
	},


	// Add a popup
	add: function(container, text, options={}) {
		const containerElem = this._containers[container];
		if(!containerElem) return;

		const element = this.createElement(text, options);
		containerElem.appendChild(element);

		if(options.duration) {
			const id = this.popups.length;

			setTimeout(() => {
				element.classList.add('popup-fade');
				setTimeout(PopupManager.remove.bind(PopupManager, id), 500);
			}, options.duration * 1000);
		}

		return this.popups.push({
			container,
			element,
			text,
			options
		}) - 1;
	},


	// Remove a popup
	remove: function(id) {
		const popup = this.popups[id];
		if(!popup) return;

		this._containers[popup.container].removeChild(popup.element);
		this.popups[id] = null;

		// Clean up the end
		let ind = this.popups.length;
		while(this.popups[--ind] === null) this.popups.pop();
	}

};
