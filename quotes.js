const quotes = [
	"making stuff is fun. go make stuff.",
	"gardening is a metaphor, jimmy. a metaphor.",
	"cook · clean · eat green bean",
	"look at me, doing things.",
	"somewhere between music and a game.",
	"don't gobblefunk around with words.",
	"reject norms, bake bread upside down.",
	"sometimes you just gotta go welp",
	"bloggy bloggy blog. Who came up with that word? Lmao",
	"blogs are just infodumps to the void",
	"wash, scrub, avoid the club.",
	"I occasionally eat food.",
	"when in doubt, blog it out.",
	"stressed, depressed, but well dressed.",
	"does anyone even read this? read me, damn it.",
];

function showRandomQuote(elementId) {
	const random = quotes[Math.floor(Math.random() * quotes.length)];
	const el = document.getElementById(elementId);
	if (el) el.textContent = random;
}