// Create html elements with objects in js
function createElement(object) {
	if(!object) return;

	let elem = document.createElement(object.type);

	if(object.html) {
		elem.innerHTML = object.html;
	}

	if(object.name) {
		elem.setAttribute("name", object.name);
	}

	if(object.id) {
		elem.id = object.id;
	}

	if(object.class) {
		elem.className = object.class;
	}

	for(let c in object.classes) {
		elem.classList.add(object.classes[c]);
	}

	for(let c in object.children) {
		elem.appendChild(createElement(object.children[c]));
	}

	if(object.style) {
		for(let prop in object.style) {
			elem.style[prop] = object.style[prop];
		}
	}

	if(object.direct) {
		for(let prop in object.direct) {
			elem[prop] = object.direct[prop];
		}
	}

	return elem;
}


// The citation logger
window.CitationLogger = {

	// Normal log to the console
	log: function() {
		let logString = "[Citation Extension]:";

		for(let a in arguments) {
			logString += " " + arguments[a];
		}

		console.log(logString);
	},


	// Display a warning in the console
	warn: function() {
		let logString = "[Citation Extension]:";

		for(let a in arguments) {
			logString += " " + arguments[a];
		}

		console.warn(logString);
	},


	// Display an error in the console
	error: function() {
		let logString = "[Citation Extension]:";

		for(let a in arguments) {
			logString += " " + arguments[a];
		}

		console.error(logString);
	}

};
