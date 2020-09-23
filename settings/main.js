const Main = {

	// Active section
	active: '',


	// Initialize listeners
	init: function() {
		let defaultSection = document.querySelector('.section-header.default');
		this.showSection(defaultSection.getAttribute('name'));

		let headers = [...document.getElementsByClassName('section-header')];

		for(let h in headers) {
			headers[h].addEventListener('click', () => {
				Main.showSection(headers[h].getAttribute('name'));
			});
		}
	},


	// Hide a section
	hideSection: function(name=null) {
		if(!name) return;
		if(name === this.active) this.active = '';

		let headerElem = document.querySelector(`.section-header[name="${name}"]`);
		if(headerElem) headerElem.classList.remove('active');

		let contentElem = document.getElementById('section-' + name);
		if(contentElem) contentElem.classList.add('hidden');
	},


	// Show a section
	showSection: function(name=null) {
		if(!name || name === this.active) return;
		if(this.active) this.hideSection(this.active);

		this.active = name;

		let headerElem = document.querySelector(`.section-header[name="${name}"]`);
		if(headerElem) headerElem.classList.add('active');

		let contentElem = document.getElementById('section-' + name);
		if(contentElem) contentElem.classList.remove('hidden');
	},

};
