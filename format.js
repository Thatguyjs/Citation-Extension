/*
	Generic Formatting Standards

	Next Up:
	 - User-defined title for citation on finish page
	 - FIX SAVING BUGS
	 - Celebrate because now it kinda works
*/



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
	Format Files:
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
	   them. This also applies to escaping backslashes (\\)


	Element Numbers:
	 0: title
	 1: url
	 2: authors
	 3: publishers
	 4: publishdate
	 5: accessdate


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



// Citation history parsing & storage syntax

/*
	History Files:
	 - All history files must begin with "HISTORY v.(version number)\r\n"
	   where (version number) is the format version triplet (e.g. 00.00.00)
	 - .chf is the default file extension


	Citation General Syntax:
	 - All containers must be defined before citations begin (see Containers)
	 - All citations start with their metadata (see Citation Metadata) and
	   one colon (:) on each side
	 - All citation must end with the group separator () followed by a
	   semicolon (;)
	 - Use the group separator (), a number (0-9), and a colon (:) to
	   mark different citation properties
	 - The order in which citation properties are listed does not matter
	 - Escape any formatting characters with a backslash (\) prefixing
	   them. This also applies to escaping backslashes (\\)


	Containers:
	 - Citations can belong to more than one container at a time
	 - Containers start with a hashtag (#) followed by a colon (:)
	 - Containers only store their name and end with a semicolon (;)


	Element Numbers:
	 0: title
	 1: url
	 2: authors
	 3: publishers
	 4: publish date
	 5: access date


	Citation Metadata:
	 - All metadata elements are separated by the group separator ()
	 - All metadata properties must be in the correct order
	 - Metadata properties:
	    - Citation format
	    - Citation name
	    - Date created (see Datatypes)
	    - Date modified (see Datatypes)
	    - Parent containers (Array, see Datatypes)


	Datatypes:
	 Dates:
	    - DDMMYYYY where DD and MM are two characters and YYYY is four characters
		- Dates are surrounded by angle brackets (< and >)
	 Arrays - Surrounded by brackets, use comma separated values


	Example History File (with added newlines):
	 HISTORY v.00.00.00
	 #:My container name;
	 #:Second container;
	 :MLA8My citation name<18032020><18032020>[My container name,Second container]:0:Some News Article Title1:https://article-url.com2:[Prefix,First,Middle,Last][Prefix,First,Middle,Last]3:[Publisher 1,Publisher 2]4:<11022016>5:<18032020>;
*/
