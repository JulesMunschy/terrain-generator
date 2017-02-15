var Cell = require('./ServerCell.js');

module.exports = {
	init : function (config) {

		config = config || {};

		this.size = 5; // only used for generated maps
		this.cellSize = typeof config.cellSize === 'undefined' ? 10 : config.cellSize;
		this.cells = {};
		this.numCells = 0;

		this.extrudeSettings = null;
		this.autogenerated = false;

		this._hashDelimeter = '.';
		
		// pre-computed permutations
		this._directions = [new Cell(+1, -1, 0), new Cell(+1, 0, -1), new Cell(0, +1, -1),
							new Cell(-1, +1, 0), new Cell(-1, 0, +1), new Cell(0, -1, +1)];
		this._diagonals = [new Cell(+2, -1, -1), new Cell(+1, +1, -2), new Cell(-1, +2, -1),
						   new Cell(-2, +1, +1), new Cell(-1, -1, +2), new Cell(+1, -2, +1)];

		// cached objects
		this._list = [];
		this._cel = new Cell();
	},

	getNeighbors: function(cell, diagonal, filter) {
		// always returns an array
		var i, n, l = this._directions.length;
		this._list.length = 0;
		for (i = 0; i < l; i++) {
			this._cel.copy(cell);
			this._cel.add(this._directions[i]);
			n = this.cells[this.cellToHash(this._cel)];
			if (!n || (filter && !filter(cell, n))) {
				continue;
			}
			this._list.push(n);
		}
		if (diagonal) {
			for (i = 0; i < l; i++) {
				this._cel.copy(cell);
				this._cel.add(this._diagonals[i]);
				n = this.cells[this.cellToHash(this._cel)];
				if (!n || (filter && !filter(cell, n))) {
					continue;
				}
				this._list.push(n);
			}
		}
		return this._list;
	},

	cellToHash: function(cell) {
		return cell.q+this._hashDelimeter+cell.r+this._hashDelimeter+cell.s;
	},

	// create a flat, hexagon-shaped grid
	generate: function(config) {
		config = config || {};
		this.size = typeof config.size === 'undefined' ? this.size : config.size;
		var x, y, z, c;
		for (x = -this.size; x < this.size+1; x++) {
			for (y = -this.size; y < this.size+1; y++) {
				z = -x-y;
				if (Math.abs(x) <= this.size && Math.abs(y) <= this.size && Math.abs(z) <= this.size) {
					c = new Cell(x, y, z);
					this.add(c);
				}
			}
		}
	},

	add: function(cell) {
		var h = this.cellToHash(cell);
		if (this.cells[h]) {
			// console.warn('A cell already exists there');
			return;
		}
		this.cells[h] = cell;
		this.numCells++;

		return cell;
	},

	remove: function(cell) {
		var h = this.cellToHash(cell);
		if (this.cells[h]) {
			delete this.cells[h];
			this.numCells--;
		}
	},

	dispose: function() {
		this.cells = null;
		this.numCells = 0;
		this.cellShape = null;
		this.cellGeo.dispose();
		this.cellGeo = null;
		this.cellShapeGeo.dispose();
		this.cellShapeGeo = null;
		this._list = null;
		this._vec3 = null;
		this._conversionVec = null;
		this._geoCache = null;
		this._matCache = null;
	},
}