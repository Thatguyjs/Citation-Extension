// Resources for managing html lists


class ListItem {
	constructor(name) {
		this.name = name;

		this.contents = [];
	}

	// Add an element
	add(name, value, options={}) {
		let elem = document.createElement(name);

		if(name === 'input' || name === 'textarea') {
			elem.value = value;
		}
		else {
			elem.innerText = value;
		}

		// Extra options
		if(options.id) elem.id = options.id;
		if(options.class) elem.className = options.class;

		for(let c in options.classList) {
			elem.classList.add(options.classList[c]);
		}

		for(let s in options.style) {
			elem.style[s] = options.style[s];
		}

		for(let h in options.html) {
			elem[h] = options.html[h];
		}

		this.contents.push(elem);
	}

	// Return an html representation of the item
	toHtml() {
		let node = document.createElement('div');
		node.classList.add('fold-list-node');
		node.classList.add('fold-list-hidden');

		let toggle = document.createElement('button');
		toggle.className = 'fold-list-toggle';
		toggle.innerText = this.name;

		let remove = document.createElement('button');
		remove.className = 'fold-list-remove';
		remove.innerText = 'X';

		let data = document.createElement('div');
		data.className = 'fold-list-data';

		for(let c in this.contents) {
			data.appendChild(this.contents[c]);
		}

		node.appendChild(toggle);
		node.appendChild(remove);
		node.appendChild(data);

		return node;
	}
}


const ListManager = {

	// Clear a list of items
	clear: function(list) {
		list.innerHTML = "";
	},


	// Create a new ListItem
	createItem: function(name) {
		return new ListItem(name);
	},


	// Append list items to a list
	appendItems: function(list, items=[], callback=new Function) {
		if(!Array.isArray(items)) items = [items];

		for(let i in items) {
			let html = items[i].toHtml();

			html.querySelector('.fold-list-remove').addEventListener('click', () => {
				list.removeChild(html);
				callback(i);
			});

			html.querySelector('.fold-list-toggle').addEventListener('click', () => {
				html.classList.toggle('fold-list-hidden');
			});

			list.appendChild(html);
		}
	}

};
