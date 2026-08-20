(function () {
  // ---- CONFIGURE THIS LINE ----
  var SUBSTACK_FEED_URL = "https://lyricalgarden.substack.com/feed";
  // -------------------------------

  var MAX_POSTS = 6; // how many posts to show

  // Browsers can't fetch another domain's raw XML directly (CORS),
  // so we route through a lightweight pass-through proxy.
  var proxyUrl =
    "https://substack-proxy.spamonlychase.workers.dev/";

  var grid = document.querySelector("#substack-feed .sf-grid");

  // Pulls a post's cover image. Substack puts this in the <enclosure>
  // tag, NOT in the description text (which is often just plain text
  // with no image markup at all) — check that first.
  function findImage(itemEl, descriptionHtml) {
    var enclosure = itemEl.querySelector("enclosure");
	var enclosureType = enclosure ? enclosure.getAttribute("type") || "" : "";
	if (enclosure && enclosure.getAttribute("url") && enclosureType.indexOf("image") === 0) {
	  return enclosure.getAttribute("url");
	}

    var contentEncodedEl = itemEl.getElementsByTagName("content:encoded")[0];
    var html = (contentEncodedEl ? contentEncodedEl.textContent : "") || descriptionHtml || "";
    if (!html) return null;

    var srcsetMatch = html.match(/<img[^>]+srcset="([^">]+)"/);
    if (srcsetMatch) {
      var firstUrl = srcsetMatch[1].split(",")[0].trim().split(" ")[0];
      if (firstUrl) return firstUrl;
    }

    var srcMatch = html.match(/<img[^>]+src="([^">]+)"/);
    if (srcMatch && srcMatch[1].indexOf("data:") !== 0) return srcMatch[1];

    return null;
  }

  function textOf(itemEl, tagName) {
    var node = itemEl.querySelector(tagName);
    return node ? node.textContent : "";
  }

  fetch(proxyUrl, { cache: "no-store" })
    .then(function (res) {
      return res.text();
    })
    .then(function (xmlText) {
      var xml = new DOMParser().parseFromString(xmlText, "text/xml");
      var items = Array.prototype.slice.call(xml.querySelectorAll("item")).slice(0, MAX_POSTS);

      if (items.length === 0) {
        grid.innerHTML = '<p class="sf-error">No posts found. Check your feed URL.</p>';
        return;
      }

      var html = "";
      items.forEach(function (itemEl) {
        var title = textOf(itemEl, "title");
        var link = textOf(itemEl, "link");
        var pubDate = textOf(itemEl, "pubDate");
        var description = textOf(itemEl, "description");

        var date = pubDate
          ? new Date(pubDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "";

        var plainText = description.replace(/<[^>]+>/g, "").trim();
        var excerpt =
          plainText.length > 140 ? plainText.slice(0, 140).trim() + "…" : plainText;

        var img = findImage(itemEl, description);
        var thumbHtml = img
          ? '<img src="' + img + '" alt="" loading="lazy">'
          : '<span class="sf-thumb-fallback">📝</span>';

        html +=
          '<a class="sf-card" href="' + link + '" target="_blank" rel="noopener">' +
          '<div class="sf-thumb-wrap">' + thumbHtml + '</div>' +
          '<div class="sf-body">' +
          '<h3 class="sf-title">' + title + '</h3>' +
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