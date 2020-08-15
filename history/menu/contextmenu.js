const ContextMenu = {

	// Context menu container
	_container: null,


	// Current data loaded
	_loaded: {},


	// Current event callback
	_callback: null,


	// Menu presets
	_presets: [],


	// Remove all children from the container
	_removeChildren: function() {
		if(!this._container) return;

		let children = [...this._container.children];

		for(let c in children) {
			this._container.removeChild(children[c]);
		}
	},


	// Correct menu position to prevent it appearing off-screen
	_validatePosition: function(x, y) {
		if(!this._container) return {x, y};

		let pos = this._container.getBoundingClientRect();

		if(typeof x === 'number' && x + pos.width >= window.innerWidth) {
			x -= pos.width;
		}
		if(typeof y === 'number' && y + pos.height >= window.innerHeight) {
			y -= pos.height;
		}

		return {x, y};
	},


	// Construct a menu item
	_constructItem: function(object) {
		let item = document.createElement('div');
		item.className = 'context-menu-item';
		item.setAttribute('data-name', object.name || "");

		if(object.type !== 'separator') {
			let text = document.createElement('span');
			text.className = 'context-menu-text';
			text.innerText = object.text;

			item.appendChild(text);
		}
		else {
			item.className = 'context-menu-separator';
			return item;
		}

		if(object.icon) {
			let icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			icon.setAttribute('class', 'context-menu-icon');

			let ref = document.createElementNS('http://www.w3.org/2000/svg', 'use');
			ref.setAttribute('href', '#icon-' + object.icon);

			icon.appendChild(ref);
			item.appendChild(icon);
		}

		if(object.shortcut) {
			let shortcut = document.createElement('span');
			shortcut.innerText = object.shortcut;

			item.appendChild(shortcut);
		}

		return item;
	},


	// Click on a menu item
	_menuClick: function(event) {
		let includesItem = false;
		let item = null;

		for(let p in event.path) {
			if(!event.path[p].classList) break;

			if(event.path[p].classList.contains('context-menu-separator')) {
				return;
			}

			if(event.path[p].classList.contains('context-menu-item')) {
				includesItem = true;
				item = event.path[p];
				break;
			}
		}

		if(!includesItem) {
			this.hide();
			return;
		}

		if(this._loaded.type === 'preset') {
			this._presets[this._loaded.id].callback(item.getAttribute('data-name'), this._loaded.data);
		}
		else {
			this._loaded.callback(item.getAttribute('data-name'), this._loaded.data);
		}

		this.hide();
	},


	// Start listening for menu clicks
	_addClickListener: function() {
		if(!this._container) return;
		window.addEventListener('click', this._menuClick);
	},


	// Stop listening for menu clicks
	_removeClickListener: function() {
		if(!this._container) return;
		window.removeEventListener('click', this._menuClick);
	},


	// Initalize variables
	init: function() {
		this._container = document.createElement('div');
		this._container.className = 'context-menu hidden';

		this._container.addEventListener('contextmenu', (event) => {
			event.preventDefault();
		});

		document.body.appendChild(this._container);

		this._menuClick = this._menuClick.bind(this);
	},


	// Add a preset
	addPreset: function(items, callback) {
		return this._presets.push({ items, callback }) - 1;
	},


	// Get a preset
	getPreset: function(presetId) {
		return this._presets[presetId];
	},


	// Load a preset into the container
	loadPreset: function(presetId, options={}) {
		this.load(
			this._presets[presetId].items,
			this._presets[presetId].callback,
			options
		);

		this._loaded = { type: 'preset', id: presetId, data: options.data || null };
	},


	// Directly load data into the container
	load: function(items, callback, options={}) {
		if(!this._container) return;

		if(typeof options.clear === 'undefined') options.clear = true;
		if(typeof options.show === 'undefined') options.show = false;

		if(options.clear) this._removeChildren();
		this._loaded = { type: 'raw', callback, data: options.data || null };

		for(let i in items) {
			let item = this._constructItem(items[i]);
			this._container.appendChild(item);
		}

		if(options.show) this.show(options.x, options.y);
	},


	// Get the loaded data
	get loaded() {
		if(!this._loaded.type) return null;
		return this._loaded;
	},


	// Show the menu
	show: function(x=null, y=null) {
		if(!this._container) return;

		this._container.classList.remove('hidden');
		this._addClickListener();

		let adjusted = this._validatePosition(x, y);
		if(typeof x === 'number') this._container.style.left = adjusted.x + 'px';
		if(typeof y === 'number') this._container.style.top = adjusted.y + 'px';
	},


	// Hide the menu
	hide: function(clear=false) {
		if(!this._container) return;

		this._container.classList.add('hidden');
		this._removeClickListener();

		if(clear) this._removeChildren();
	}

};
