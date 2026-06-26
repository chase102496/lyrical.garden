// lightbox.js
document.addEventListener('DOMContentLoaded', () => {
	const overlay = document.createElement('div');
	overlay.className = 'lg-lightbox-overlay';
	const overlayImg = document.createElement('img');
	overlay.appendChild(overlayImg);
	document.body.appendChild(overlay);

	document.querySelectorAll('.lg-post-content img').forEach(img => {
		img.addEventListener('click', () => {
			overlayImg.src = img.src;
			overlay.classList.add('active');
		});
	});

	overlay.addEventListener('click', () => {
		overlay.classList.remove('active');
	});
});