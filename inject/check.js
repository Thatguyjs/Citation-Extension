// Check to see if a citation is finished
window.citation_connection = chrome.runtime.connect({ name: "Citation-Extension" });
window.citation_data = localStorage.getItem("citation-ext-result");
window.citation_finished = !!window.citation_data;

window.citation_connection.postMessage({
	finished: window.citation_finished,
	citation: JSON.parse(window.citation_data)
});

delete window.citation_data;
delete window.citation_finished;
delete window.citation_connection;

localStorage.removeItem("citation-ext-result");
