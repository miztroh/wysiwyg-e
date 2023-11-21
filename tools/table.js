import { html, css } from 'lit';
import '@material/web/dialog/dialog.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/button/text-button.js';
import '@material/web/switch/switch.js';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './table.mjs';

class WysiwygToolTable extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Cell': 'Célula',
				'Cell After': 'Célula Após',
				'Cell Before': 'Célula Antes',
				'Column': 'Coluna',
				'Column After': 'Coluna Após',
				'Column Before': 'Coluna Antes',
				'Columns': 'Colunas',
				'Delete': 'Excluir',
				'Insert': 'Inserir',
				'Row': 'Linha',
				'Row After': 'Linha Após',
				'Row Before': 'Linha Antes',
				'Rows': 'Linhas',
				'Show Footer': 'Mostrar Rodapé',
				'Show Header': 'Mostrar Cabeçalho',
				'Table': 'Tabela'
			},
			'en': {
				'Cell': 'Cell',
				'Cell After': 'Cell After',
				'Cell Before': 'Cell Before',
				'Column': 'Column',
				'Column After': 'Column After',
				'Column Before': 'Column Before',
				'Columns': 'Columns',
				'Delete': 'Delete',
				'Insert': 'Insert',
				'Row': 'Row',
				'Row After': 'Row After',
				'Row Before': 'Row Before',
				'Rows': 'Rows',
				'Show Footer': 'Show Footer',
				'Show Header': 'Show Header',
				'Table': 'Table'
			},
			'fr': {
				'Cell': 'Cellule',
				'Cell After': 'Cellule Après',
				'Cell Before': 'Cellule Avant',
				'Column': 'Colonne',
				'Column After': 'Colonne Après',
				'Column Before': 'Colonne Avant',
				'Columns': 'Colonnes',
				'Delete': 'Supprimer',
				'Insert': 'Insérer',
				'Row': 'Ligne',
				'Row After': 'Ligne Après',
				'Row Before': 'Ligne Avant',
				'Rows': 'Lignes',
				'Show Footer': 'Montrer Pied de page',
				'Show Header': 'Montrer Entête',
				'Table': 'Tableau'
			},
			'de': {
				'Cell': 'Zelle',
				'Cell After': 'Zelle danach',
				'Cell Before': 'Zelle davor',
				'Column': 'Spalte',
				'Column After': 'Spalte danach',
				'Column Before': 'Spalte davor',
				'Columns': 'Spalten',
				'Delete': 'Löschen',
				'Insert': 'Einfügen',
				'Row': 'Zeile',
				'Row After': 'Zeile danach',
				'Row Before': 'Zeile davor',
				'Rows': 'Zeilen',
				'Show Footer': 'Fußzeile anzeigen',
				'Show Header': 'Kopfzeile anzeigen',
				'Table': 'Tabelle'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'shift+ctrl+t': this.openDialog
		};
	}

	static get styles () {
		return [
			super.styles,
			css`
				#dialog {
					max-width: 90vw;
				}
			`
		]
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.openDialog}"><md-icon>table_chart</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Table')} (Shift + Ctrl + T)</wysiwyg-tooltip>
			<md-dialog id="dialog" @closed="${this.table}">
				<div slot="headline">${this.localize('Table')}</div>
				<form slot="content" id="form" method="dialog" style="display: none;"></form>
				<div slot="content">
					<md-filled-text-field id="rowCount" label="${this.localize('Rows')}" dialogInitialFocus required autoValidate type="number" min="1" value="1"></md-filled-text-field>
					<md-filled-text-field id="columnCount" label="${this.localize('Columns')}" required autoValidate type="number" min="1" value="1"></md-filled-text-field>
					<div style="display: flex; flex-direction: row; margin-top: 20px;">
						<label>
							${this.localize('Show Header')}
							<md-switch id="showHeader"></md-switch>
						</label>
						<div style="flex: 1;"></div>
						<label>
							${this.localize('Show Footer')}
							<md-switch id="showFooter"></md-switch>
						</label>
					</div>
				</div>				
				<div slot="actions">
					<div>
						<div style="font-weight: bold; text-align: center; margin-bottom: 10px;" ?hidden="${!this.selectedTable}">${this.localize('Insert')}:</div>
						<div style="display: flex; flex-direction: row; justify-content: center; flex-wrap: wrap;" ?hidden="${!this.selectedTable}">
							<md-text-button form="form" value="insertCellBefore">${this.localize('Cell Before')}</md-text-button>
							<md-text-button form="form" value="insertCellAfter">${this.localize('Cell After')}</md-text-button>
							<md-text-button form="form" value="insertRowBefore">${this.localize('Row Before')}</md-text-button>
							<md-text-button form="form" value="insertRowAfter">${this.localize('Row After')}</md-text-button>
							<md-text-button form="form" value="insertColumnBefore">${this.localize('Column Before')}</md-text-button>
							<md-text-button form="form" value="insertColumnAfter">${this.localize('Column After')}</md-text-button>
						</div>
						<div style="font-weight: bold; text-align: center; margin: 10px auto;" ?hidden="${!this.selectedTable}">${this.localize('Delete')}:</div>
						<div style="display: flex; flex-direction: row; justify-content: center; flex-wrap: wrap;" ?hidden="${!this.selectedTable}">
							<md-text-button form="form" value="deleteCell">${this.localize('Cell')}</md-text-button>
							<md-text-button form="form" value="deleteRow">${this.localize('Row')}</md-text-button>
							<md-text-button form="form" value="deleteColumn">${this.localize('Column')}</md-text-button>
						</div>
						<div style="display: flex; flex-direction: row; justify-content: end; margin-top: 20px;">
							<md-text-button form="form" value="remove" ?hidden="${!this.selectedTable}">Remove</md-text-button>
							<md-text-button form="form" value="save">Save</md-text-button>
							<md-text-button form="form" value="cancel">Cancel</md-text-button>
						</div>
					</div>
				</div>
			</md-dialog>
		`;
	}

	table (e) {
		const returnValue = this.shadowRoot.getElementById('dialog').returnValue;
		const rowCount = +this.shadowRoot.getElementById('rowCount').value;
		const columnCount = +this.shadowRoot.getElementById('columnCount').value;
		const showHeader = this.shadowRoot.getElementById('showHeader').checked;
		const showFooter = this.shadowRoot.getElementById('showFooter').checked;
		this.closeDialog();
		const after = !!returnValue.toLowerCase().match('after');

		switch (returnValue) {
			case 'save':
				if (!Number.isInteger(rowCount) || !Math.sign(rowCount) || !Number.isInteger(columnCount) || !Math.sign(columnCount)) return;
				var table, row, column, existingColumns, existingRows, existingColumn, existingRow, columnCountDiff, rowCountDiff, i, j, thead, tfoot, tbody;

				if (this.selectedTable) {
					table = this.selectedTable;
				} else {
					table = document.createElement('table');
				}

				// BEGIN HEADER SECTION
				thead = table.querySelector('thead');

				if (!showHeader) {
					if (thead) thead.parentNode.removeChild(thead);
				} else {
					if (!thead) {
						thead = document.createElement('thead');
						table.appendChild(thead);
					}

					existingRow = thead.querySelector('tr');

					if (!existingRow) {
						existingRow = document.createElement('tr');
						thead.appendChild(existingRow);
					}

					existingColumns = existingRow.querySelectorAll('th'), columnCountDiff = columnCount - existingColumns.length, column;

					for (j = columnCountDiff; Math.abs(j) !== 0; j -= Math.sign(columnCountDiff)) {
						if (columnCountDiff < 0) {
							column = existingColumns[existingColumns.length - 1];
							column.parentNode.removeChild(column);
						} else if (columnCountDiff > 0) {
							column = document.createElement('th');
							existingRow.appendChild(column);
						}

						existingColumns = existingRow.querySelectorAll('th');
					}
				}
				//END HEADER SECTION

				//BEGIN BODY SECTION
				tbody = table.querySelector('tbody');

				if (!tbody) {
					tbody = document.createElement('tbody');
					table.appendChild(tbody);
				}

				existingRows = tbody.querySelectorAll('tr'), rowCountDiff = rowCount - existingRows.length;

				for (i = rowCountDiff; Math.abs(i) !== 0; i -= Math.sign(rowCountDiff)) {
					if (rowCountDiff < 0) {
						row = existingRows[existingRows.length - 1];
						row.parentNode.removeChild(row);
					} else if (rowCountDiff > 0) {
						row = document.createElement('tr');
						tbody.appendChild(row);
					}

					existingRows = tbody.querySelectorAll('tr');
				}

				for (i = 0; i < existingRows.length; i += 1) {
					row = existingRows[i];
					existingColumns = row.querySelectorAll('td'), columnCountDiff = columnCount - existingColumns.length, column;

					for (j = columnCountDiff; Math.abs(j) !== 0; j -= Math.sign(columnCountDiff)) {
						if (columnCountDiff < 0) {
							column = existingColumns[existingColumns.length - 1];
							column.parentNode.removeChild(column);
						} else if (columnCountDiff > 0) {
							column = document.createElement('td');
							row.appendChild(column);
						}

						existingColumns = row.querySelectorAll('td');
					}
				}
				//END BODY SECTION

				// BEGIN FOOTER SECTION
				tfoot = table.querySelector('tfoot');

				if (!showFooter) {
					if (tfoot) tfoot.parentNode.removeChild(tfoot);
				} else {
					if (!tfoot) {
						tfoot = document.createElement('tfoot');
						table.appendChild(tfoot);
					}

					existingRow = tfoot.querySelector('tr');

					if (!existingRow) {
						existingRow = document.createElement('tr');
						tfoot.appendChild(existingRow);
					}

					existingColumns = existingRow.querySelectorAll('td'), columnCountDiff = columnCount - existingColumns.length, column;

					for (j = columnCountDiff; Math.abs(j) !== 0; j -= Math.sign(columnCountDiff)) {
						if (columnCountDiff < 0) {
							column = existingColumns[existingColumns.length - 1];
							column.parentNode.removeChild(column);
						} else if (columnCountDiff > 0) {
							column = document.createElement('td');
							existingRow.appendChild(column);
						}

						existingColumns = existingRow.querySelectorAll('td');
					}
				}
				//END FOOTER SECTION

				if (!this.selectedTable) {
					tbody.querySelector('td').appendChild(this.selection.range0.extractContents());
					this.selection.range0.deleteContents();
					this.selection.range0.insertNode(table);
				}

				break;
			case 'remove':
				if (this.selectedTable) {
					this.selectedTable.parentNode.removeChild(this.selectedTable);
					this.selectedTable = null;
				}

				break;
			case 'insertCellBefore':
			case 'insertCellAfter':
				if (this.selectedTable && this.selection.commonAncestorPath) {
					for (let i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
						if (['TD', 'TH'].includes(this.selection.commonAncestorPath[i].tagName)) {
							let cell = document.createElement(this.selection.commonAncestorPath[i].tagName);
							this.selection.commonAncestorPath[i].parentNode.insertBefore(cell, after ? this.selection.commonAncestorPath[i].nextSibling : this.selection.commonAncestorPath[i]);
							break;
						}
					}
				}

				break;
			case 'insertRowBefore':
			case 'insertRowAfter':
				if (this.selectedTable && this.selection.commonAncestorPath) {
					for (let i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
						if (this.selection.commonAncestorPath[i].tagName === 'TR') {
							let row = document.createElement('tr');
		
							for (let j = 0; j < this.selection.commonAncestorPath[i].querySelectorAll(this.selection.commonAncestorPath[i].parentNode.tagName === 'THEAD' ?  'TH' : 'TD').length; j += 1) {
								var cell = document.createElement(this.selection.commonAncestorPath[i].parentNode.tagName === 'THEAD' ?  'TH' : 'TD');
								row.appendChild(cell);
							}
		
							this.selection.commonAncestorPath[i].parentNode.insertBefore(row, after ? this.selection.commonAncestorPath[i].nextSibling : this.selection.commonAncestorPath[i]);
							break;
						}
					}
				}

				break;
			case 'insertColumnBefore':
			case 'insertColumnAfter':
				if (this.selectedTable && this.selection.commonAncestorPath) {
					for (var i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
						if (['TD', 'TH'].includes(this.selection.commonAncestorPath[i].tagName)) {
							var columnIndex = Array.prototype.indexOf.call(this.selection.commonAncestorPath[i].parentNode.children, this.selection.commonAncestorPath[i]);
							if (after) columnIndex += 1;
							var rows = this.selectedTable.querySelectorAll('tr');
		
							for (var j = 0; j < rows.length; j += 1) {
								var columns = rows[j].querySelectorAll('td, th'), column = document.createElement(rows[j].parentNode.tagName === 'THEAD' ?  'TH' : 'TD');
		
								if (columns.length === 0 || columns.length <= columnIndex) {
									rows[j].appendChild(column);
								} else {
									rows[j].insertBefore(column, columns[columnIndex]);
								}
							}
		
							break;
						}
					}
				}

				break;
			case 'deleteCell':
				if (this.selectedTable && this.selection.commonAncestorPath) {
					for (var i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
						if (['TD', 'TH'].includes(this.selection.commonAncestorPath[i].tagName)) {
							this.selection.commonAncestorPath[i].parentNode.removeChild(this.selection.commonAncestorPath[i]);
							break;
						}
					}
				}

				break;
			case 'deleteRow':
				if (this.selectedTable && this.selection.commonAncestorPath) {
					for (var i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
						if (this.selection.commonAncestorPath[i].tagName === 'TR') {
							this.selection.commonAncestorPath[i].parentNode.removeChild(this.selection.commonAncestorPath[i]);
							break;
						}
					}
				}

				break;
			case 'deleteColumn':
				if (this.selectedTable && this.selection.commonAncestorPath) {
					for (var i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
						if (['TD', 'TH'].includes(this.selection.commonAncestorPath[i].tagName)) {
							var nthChild = Array.prototype.indexOf.call(this.selection.commonAncestorPath[i].parentNode.children, this.selection.commonAncestorPath[i]) + 1;
							var cellsToDelete = this.selectedTable.querySelectorAll('td:nth-child(' + nthChild + '), th:nth-child(' + nthChild + ')');
		
							for (var j = 0; j < cellsToDelete.length; j += 1) {
								cellsToDelete[j].parentNode.removeChild(cellsToDelete[j]);
							}
		
							break;
						}
					}
				}

				break;
		}
	}

	closeDialog () {
		this.shadowRoot.getElementById('dialog').open = false;
		this.shadowRoot.getElementById('rowCount').value = 1;
		this.shadowRoot.getElementById('columnCount').value = 1;
		this.shadowRoot.getElementById('showHeader').checked = false;
		this.shadowRoot.getElementById('showFooter').checked = false;
		this.dispatchEvent(new CustomEvent('restoreSelection', {bubbles: true, composed: true, detail: { selection: this._savedSelection}}));
		delete this._savedSelection;
	}

	openDialog () {
		if (this.disabled) return;

		this._savedSelection = {
			start: this._getNodeOffset(this.target, this.selection.range0.startContainer) + this._totalOffsets(this.selection.range0.startContainer, this.selection.range0.startOffset),
			end: this._getNodeOffset(this.target, this.selection.range0.endContainer) + this._totalOffsets(this.selection.range0.endContainer, this.selection.range0.endOffset)
		};

		this.shadowRoot.getElementById('dialog').open = true;
	}

	static get properties() {
		return {
			selectedTable: {
				type: HTMLAnchorElement
			}
		};
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			let selectedTable = null;

			if (this.selection && this.selection.commonAncestorPath) {
				for (var i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
					if (this.selection.commonAncestorPath[i].tagName === 'TABLE') {
						selectedTable = this.selection.commonAncestorPath[i];
						break;
					}
				}
			}

			this.selectedTable = selectedTable;
		}

		if (props.has('selectedTable')) {
			if (this.selectedTable) {
				this.shadowRoot.getElementById('showHeader').checked = !!this.selectedTable.querySelector('thead');
				this.shadowRoot.getElementById('showFooter').checked = !!this.selectedTable.querySelector('tfoot');
				var rows = this.selectedTable.querySelectorAll('tbody > tr');
				this.shadowRoot.getElementById('rowCount').value = rows.length;
				var maxColumns = 1;
	
				for (var i = 0; i < rows.length; i += 1) {
					var columns = rows[i].querySelectorAll('td');
					if (columns.length > maxColumns) maxColumns = columns.length;
				}
	
				this.shadowRoot.getElementById('columnCount').value = maxColumns;
			} else {
				this.shadowRoot.getElementById('columnCount').value = 1;
				this.shadowRoot.getElementById('rowCount').value = 1;
				this.shadowRoot.getElementById('showFooter').checked = false;
				this.shadowRoot.getElementById('showHeader').checked = false;
			}
		}

		if (props.has('selection') || props.has('selectedTable')) {
			this.active = !!this.selectedTable;

			if (this.selectedTable || (this.selection && this.selection.range0)) {
				this.disabled = false;
			} else {
				this.disabled = true;
			}
		}
	}

	sanitize (node) {
		return SANITIZE(node);
	}
}

customElements.define('wysiwyg-tool-table', WysiwygToolTable);