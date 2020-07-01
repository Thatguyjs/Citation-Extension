// This prevents the init message from being sent (most of the time)
// before the popup is loaded

window.CitationMessenger.send('init', sessionStorage.getItem('citation-ext-format'));
