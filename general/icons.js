// Load svg icons into the page


(function() {
	'use strict';

	let container = document.getElementById('svg-icons');
	if(!container) return;

	fetch('/general/icons.svg').then(async (response) => {
		container.innerHTML = await response.text();
	}).catch((error) => {
		console.error("Missing icon file");
	});
}());


// Change an icon
function ChangeSVGIcon(element, iconName) {
	iconName = '#icon-' + iconName;

	let useElement = element.querySelector('use');
	if(!useElement) return;

	useElement.setAttribute('href', iconName);
}
