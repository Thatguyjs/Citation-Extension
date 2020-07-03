window.CitationLogger = {

	// Log a citation-formatted string
	log: function() {
		let args = Array.from(arguments);

		args.unshift('color: rgb(70, 140, 175);');
		args.unshift('%c[Citation Extension]');

		console.log.apply(globalThis, args);
	}

};
