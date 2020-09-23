// Initialize pages as they load

const Main = {

	// List of all pages
	_pages: {
		'home': { inline: true },
		'create': { inline: true },
		'history': { inline: false, url: '/history/index.html' },
		'settings': { inline: false, url: '/settings/index.html' }
	},


	// Active page title
	_title: document.getElementById('title'),


	// Back button
	_back: document.getElementById('back'),


	// Initialize the main object
	init: function() {

		// Get redirect buttons
		for(let p in this._pages) {
			let buttons = [...document.getElementsByClassName("redirect-" + p)];

			for(let b in buttons) {
				buttons[b].addEventListener('click', () => {
					Main.open(p);
				});
			}
		}

	},


	// Open a specific page / menu
	open: function(name) {
		if(!this._pages[name]) throw new Error(`Page "${name}" does not exist`);

		// Show / hide the back button
		if(name === 'home') this._back.classList.add("hidden");
		else this._back.classList.remove("hidden");

		// Show the requested page
		if(this._pages[name].inline) {
			let pages = [...document.getElementsByClassName('page')];

			for(let p in pages) {
				if(pages[p].classList.contains('page-' + name)) {
					this._title.innerHTML = name[0].toUpperCase() + name.slice(1);
					pages[p].classList.remove("hidden");
				}
				else {
					pages[p].classList.add("hidden");
				}
			}
		}

		// Open in new tab (or same tab if url is browser://newtab/)
		else {
			chrome.tabs.query({ active: true }, (tabs) => {
				if(tabs[0].url === 'chrome://newtab/') {
					chrome.tabs.update(null, { url: Main._pages[name].url });
					window.close();
				}
				else {
					chrome.tabs.create({ url: Main._pages[name].url });
				}
			});
		}
	}

};
