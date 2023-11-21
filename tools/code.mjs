export const ALLOWED_STYLE_TYPES = [];
export const ALLOWED_TAG_NAMES = ['CODE'];
export const REPLACEMENT_TAG_NAMES = {};

export const SANITIZE = (node) => {
	let sanitized = true;

	if (node && node.tagName && node.tagName === 'CODE') {
		const childNodes = Array.from(node.childNodes);

		for (let childNode of childNodes) {
			if (childNode.tagName === 'P') {
				node.outerHTML = node.innerHTML;
				sanitized = false;
			}
		}
	}

	return sanitized;
};