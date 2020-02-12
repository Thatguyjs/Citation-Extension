let CitationObject = {
	type: "Material Type", // Type of material, e.g. "Online" or "E-book"

	authors: [
		{
			prefix: "Prefix",
			firstname: "First",
			middlename: "Middle",
			lastname: "Last"
		}
	],

	title: "Website or Article Title", // Document or inline title

	url: "https://example.com/site-url", // Stripped URL of website (without ? or &)

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
