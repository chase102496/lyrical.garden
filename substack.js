(function () {
// ---- CONFIGURE THESE TWO LINES ----
var RSS2JSON_API_KEY = "vmaaedrmpoklapajsng7rgeirj1uow89sk0etdiu";
var SUBSTACK_FEED_URL = "https://lyricalgarden.substack.com/feed";
// ------------------------------------

var MAX_POSTS = 10; // how many posts to show

var apiUrl =
"https://api.rss2json.com/v1/api.json?rss_url=" +
encodeURIComponent(SUBSTACK_FEED_URL) +
"&api_key=" +
encodeURIComponent(RSS2JSON_API_KEY) +
"&count=" +
MAX_POSTS;

var grid = document.querySelector("#substack-feed .sf-grid");

// Pulls the first image out of a post's HTML content, since
// Substack doesn't always populate the RSS "thumbnail" field.
function findImage(item) {
if (item.thumbnail && item.thumbnail.indexOf("data:") !== 0) return item.thumbnail;
if (!item.description) return null;

// Substack often lazy-loads: the real image lives in srcset, not src.
var srcsetMatch = item.description.match(/<img[^>]+srcset="([^">]+)"/);
if (srcsetMatch) {
  var firstUrl = srcsetMatch[1].split(",")[0].trim().split(" ")[0];
  if (firstUrl) return firstUrl;
}

var srcMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
if (srcMatch && srcMatch[1].indexOf("data:") !== 0) return srcMatch[1];

return null;
}

fetch(apiUrl)
.then(function (res) {
  return res.json();
})
.then(function (data) {
  if (data.status !== "ok" || !data.items || data.items.length === 0) {
	grid.innerHTML = '<p class="sf-error">No posts found. Check your feed URL.</p>';
	return;
  }

  var html = "";
  data.items.forEach(function (item) {
	var date = new Date(item.pubDate).toLocaleDateString(undefined, {
	  year: "numeric",
	  month: "long",
	  day: "numeric",
	});

	var plainText = item.description.replace(/<[^>]+>/g, "").trim();
	var excerpt =
	  plainText.length > 140 ? plainText.slice(0, 140).trim() + "…" : plainText;

	var img = findImage(item);
	var thumbHtml = img
	  ? '<img src="' + img + '" alt="" loading="lazy">'
	  : '<span class="sf-thumb-fallback">📝</span>';

	html +=
	  '<a class="sf-card" href="' + item.link + '" target="_blank" rel="noopener">' +
	  '<div class="sf-thumb-wrap">' + thumbHtml + '</div>' +
	  '<div class="sf-body">' +
	  '<h3 class="sf-title">' + item.title + '</h3>' +
	  '<div class="sf-date">' + date + '</div>' +
	  '<p class="sf-excerpt">' + excerpt + '</p>' +
	  '<div class="sf-readmore">Read more →</div>' +
	  '</div>' +
	  '</a>';
  });

  grid.innerHTML = html;
})
.catch(function (err) {
  grid.innerHTML = '<p class="sf-error">Could not load posts right now.</p>';
  console.error("Substack feed error:", err);
});
})();