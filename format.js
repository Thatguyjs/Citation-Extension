// Citation Object Format

let CitationObject = {
	type: "Material Type", // Type of material, e.g. "Online" or "E-book"
	format: "Citation Format",

	title: "Website or Article Title", // Document or inline title
	url: "https://example.com/site-url", // Stripped URL of website (without ? or &)

	authors: [
		{
			prefix: "Prefix",
			firstname: "First",
			middlename: "Middle",
			lastname: "Last"
		}
	],

	publishers: [
		"Publisher Name"
	],

	publishdate: {
		day: 1, // Start at 1
		month: "January",
		year: "2020"
	},

	accessdate: {
		day: 5,
		month: "February",
		year: "2020"
	}
};



// Web popup list format

<div class="citation-ext-list">
	<button id="citation-ext-listadd">Add Item</button>

	<div class="citation-ext-listnode">
		<button class="citation-ext-itemtoggle">Item 1</button>
		<div class="citation-ext-listdata citation-ext-listhidden">
			// First item data
		</div>
	</div>

	<div class="citation-ext-listnode">
		<button class="citation-ext-itemtoggle">Item 2</button>
		<div class="citation-ext-listdata citation-ext-listhidden">
			// Second item data
		</div>
	</div>
</div>



// Citation parsing & storage syntax

/*
	Format files:
	 - All format files must begin with "FORMAT v.(version number)\r\n"
	   where (version number) is the format version triplet (e.g. 00.00.00)
	 - .fmt is the default format file extension


	General Syntax:
	 - All citations start with their uppercase format name and one
	   colon (:) on each side
	 - All citations end with a semicolon
	 - Anything between the last element and the next element is ignored
	 - Use the group separator () followed by the element number
	   to mark citation elements
	 - To get a property of an element, add a colon (:) and property
	   number. This works recursively; properties of properties are allowed
	 - Escape any formatting characters with a backslash (\) prefixing
	   them. This also applies to escaping backslashes (escaped = \\)


	Element Numbers:
	 title: 0
	 url: 1
	 authors: 2
	 publishers: 3
	 publishdate: 4
	 accessdate: 5


	Element properties:
	 title:
	  - N/A
	 url:
	  - (0) Remove the URI (http[s]://)
	 authors:
	  - (0) Only the first author
	  - (1) The prefix of any author (recursive)
	  - (2) The first name of any author (recursive)
	  - (3) The middle name of any author (recursive)
	  - (4) The last name of any author (recursive)
	  - (5) Get a specific author
	     - (n) Get the (n)th author
	 publishers:
	  - (0) Only the first publisher
	  - (1) Get a specific publisher
	     - (n) Get the (n)th publisher
	 publishdate:
	  - (0) Get the day
	  - (1) Get the month
	  - (2) Get the year
	 accessdate:
	  - (0) Get the day
	  - (1) Get the month
	  - (2) Get the year


	Example Citation Format:
	 :MLA8:2. "0" 3, 4, 1:0.;
*/
