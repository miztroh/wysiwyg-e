export const ALLOWED_STYLE_TYPES = [];
export const ALLOWED_TAG_NAMES = ['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'CAPTION', 'COL', 'COLGROUP', 'TR', 'TH', 'TD'];
export const REPLACEMENT_TAG_NAMES = {};

export const SANITIZE = (node) => {
	let sanitized = true;

	if (node && node.tagName) {
		const childNodes = Array.from(node.childNodes);

		switch (node.tagName) {
			//Remove empty TABLE and invalid TABLE children
			case 'TABLE':
				if (!childNodes.length) {
					node.parentNode.removeChild(node);
				} else {
					for (let childNode of childNodes) {
						if (childNode.tagName && !['THEAD', 'TBODY', 'TFOOT', 'CAPTION', 'COL', 'COLGROUP'].includes(childNode.tagName)) {
							node.outerHTML = node.innerHTML;
							sanitized = false;
						}
					}
				}

				break;
			//Remove empty THEAD, TBODY, TFOOT and invalid THEAD, TBODY, TFOOT children
			case 'THEAD':
			case 'TBODY':
			case 'TFOOT':
				if (!childNodes.length) {
					node.parentNode.removeChild(node);
				} else {
					for (const childNode of childNodes) {
						if (childNode.tagName && childNode.tagName !== 'TR') {
							node.outerHTML = node.innerHTML;
							sanitized = false;
						}
					}
				}

				break;
			// Remove empty TR
			case 'TR':
				if (!childNodes.length) node.parentNode.removeChild(node);
				break;
		}
	}

	return sanitized;
}