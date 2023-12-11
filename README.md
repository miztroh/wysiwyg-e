# wysiwyg-e [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/miztroh/wysiwyg-e)

> /wɪziwɪɡi/

> A what-you-see-is-what-you-get editor web component created with Lit. Under the hood, it provides undo / redo history management, selection management, and a toolbar that accepts tools as child elements to provide editing functionality. All the included tools (see below for list) are accessible via both the toolbar buttons and keyboard shortcuts.

## Included Tools (opt-in)

* Bold
* Italic
* Underline
* Strikethrough
* Color
* Clear Formatting
* Code
* Table
* Link
* Image
* Audio
* Video
* Ordered List
* Unordered List
* Indent
* Outdent
* Justify
* Headings
* Blockquote

## Demo

<!--
```
<custom-element-demo>
  <template>
	<link href="/node_modules/@fontsource/material-symbols-outlined/index.css" rel="stylesheet">
	<link href="/node_modules/@fontsource/roboto/400.css" rel="stylesheet">
	<link href="/node_modules/@fontsource/roboto/700.css" rel="stylesheet">
	<script type="module" src="./wysiwyg-e.js"></script>
	<script type="module" src="./tools/bold.js"></script>
	<script type="module" src="./tools/italic.js"></script>
	<script type="module" src="./tools/underline.js"></script>
	<script type="module" src="./tools/strike.js"></script>
	<script type="module" src="./tools/color.js"></script>
	<script type="module" src="./tools/clear.js"></script>
	<script type="module" src="./tools/code.js"></script>
	<script type="module" src="./tools/table.js"></script>
	<script type="module" src="./tools/link.js"></script>
	<script type="module" src="./tools/image.js"></script>
	<script type="module" src="./tools/audio.js"></script>
	<script type="module" src="./tools/video.js"></script>
	<script type="module" src="./tools/ordered.js"></script>
	<script type="module" src="./tools/unordered.js"></script>
	<script type="module" src="./tools/indent.js"></script>
	<script type="module" src="./tools/outdent.js"></script>
	<script type="module" src="./tools/justify.js"></script>
	<script type="module" src="./tools/heading.js"></script>
	<script type="module" src="./tools/blockquote.js"></script>
	<wysiwyg-e style="width: 100vw; height: 100vh;" id="wysiwygE">
		<wysiwyg-tool-bold></wysiwyg-tool-bold>
		<wysiwyg-tool-italic></wysiwyg-tool-italic>
		<wysiwyg-tool-underline></wysiwyg-tool-underline>
		<wysiwyg-tool-strike></wysiwyg-tool-strike>
		<wysiwyg-tool-color></wysiwyg-tool-color>
		<wysiwyg-tool-clear></wysiwyg-tool-clear>
		<wysiwyg-tool-code></wysiwyg-tool-code>
		<wysiwyg-tool-table></wysiwyg-tool-table>
		<wysiwyg-tool-link></wysiwyg-tool-link>
		<wysiwyg-tool-image></wysiwyg-tool-image>
		<wysiwyg-tool-audio></wysiwyg-tool-audio>
		<wysiwyg-tool-video></wysiwyg-tool-video>
		<wysiwyg-tool-ordered></wysiwyg-tool-ordered>
		<wysiwyg-tool-unordered></wysiwyg-tool-unordered>
		<wysiwyg-tool-indent></wysiwyg-tool-indent>
		<wysiwyg-tool-outdent></wysiwyg-tool-outdent>
		<wysiwyg-tool-justify></wysiwyg-tool-justify>
		<wysiwyg-tool-heading></wysiwyg-tool-heading>
		<wysiwyg-tool-blockquote></wysiwyg-tool-blockquote>
	</wysiwyg-e>
  </template>
</custom-element-demo>
```
-->

```html
<wysiwyg-e>
    <wysiwyg-tool-bold></wysiwyg-tool-bold>
    <wysiwyg-tool-italic></wysiwyg-tool-italic>
    <wysiwyg-tool-underline></wysiwyg-tool-underline>
    <wysiwyg-tool-strike></wysiwyg-tool-strike>
    <wysiwyg-tool-color></wysiwyg-tool-color>
    <wysiwyg-tool-clear></wysiwyg-tool-clear>
    <wysiwyg-tool-code></wysiwyg-tool-code>
    <wysiwyg-tool-table></wysiwyg-tool-table>
    <wysiwyg-tool-link></wysiwyg-tool-link>
    <wysiwyg-tool-image></wysiwyg-tool-image>
    <wysiwyg-tool-audio></wysiwyg-tool-audio>
    <wysiwyg-tool-video></wysiwyg-tool-video>
    <wysiwyg-tool-ordered></wysiwyg-tool-ordered>
    <wysiwyg-tool-unordered></wysiwyg-tool-unordered>
    <wysiwyg-tool-indent></wysiwyg-tool-indent>
    <wysiwyg-tool-outdent></wysiwyg-tool-outdent>
    <wysiwyg-tool-justify></wysiwyg-tool-justify>
    <wysiwyg-tool-heading></wysiwyg-tool-heading>
    <wysiwyg-tool-blockquote></wysiwyg-tool-blockquote>
</wysiwyg-e>
```

## Installation

``npm install wysiwyg-e``

## License

### The 3-Clause BSD License
Copyright 2023 Jonathan Cox

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

![open source initiative](https://i0.wp.com/opensource.org/wp-content/uploads/2023/03/cropped-OSI-horizontal-large.png)