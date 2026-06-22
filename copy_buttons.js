document.querySelectorAll('.lg-post-content pre').forEach(block => {
	const button = document.createElement('button');
	button.textContent = '📋 copy';
	button.className = 'lg-copy-btn';

	button.addEventListener('click', () => {
		const code = block.querySelector('code').innerText;
		navigator.clipboard.writeText(code);
		button.textContent = '✅ copied';
		setTimeout(() => button.textContent = '📋 copy', 1500);
	});

	block.style.position = 'relative';
	block.appendChild(button);
});