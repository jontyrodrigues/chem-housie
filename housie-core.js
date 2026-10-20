/*
 * Chem Housie core: element data, seeded ticket generation and claim checking.
 * Shared by the caller and the ticket generator so that any printed ticket can be
 * regenerated from its code (e.g. "K7Q2-3-5"), or from the game code plus its ticket
 * number, and checked against the called elements.
 */
(function (global) {
	'use strict';

	var CATEGORIES = {
		alkali:     { label: 'Alkali metal',          color: '#c2410c' },
		alkaline:   { label: 'Alkaline earth metal',  color: '#a16207' },
		transition: { label: 'Transition metal',      color: '#1d4ed8' },
		post:       { label: 'Post-transition metal', color: '#475569' },
		metalloid:  { label: 'Metalloid',             color: '#0f766e' },
		nonmetal:   { label: 'Reactive nonmetal',     color: '#15803d' },
		halogen:    { label: 'Halogen',               color: '#a21caf' },
		noble:      { label: 'Noble gas',             color: '#6d28d9' },
		lanthanide: { label: 'Lanthanide',            color: '#be185d' },
		actinide:   { label: 'Actinide',              color: '#b91c1c' }
	};

	// [symbol, name, atomic mass, category, caller's clue] in atomic-number order (1-90)
	var RAW = [
		['H',  'Hydrogen',     '1.008',  'nonmetal',   'The lightest of them all, fuel of every star'],
		['He', 'Helium',       '4.0026', 'noble',      'Floats balloons and makes voices squeak'],
		['Li', 'Lithium',      '6.94',   'alkali',     'Lives inside your phone battery'],
		['Be', 'Beryllium',    '9.0122', 'alkaline',   'Hidden inside every emerald'],
		['B',  'Boron',        '10.81',  'metalloid',  'Borax, the secret to slime'],
		['C',  'Carbon',       '12.011', 'nonmetal',   'Diamonds, pencil lead and every living thing'],
		['N',  'Nitrogen',     '14.007', 'nonmetal',   'Seventy-eight percent of every breath'],
		['O',  'Oxygen',       '15.999', 'nonmetal',   'The twenty-one percent that keeps you alive'],
		['F',  'Fluorine',     '18.998', 'halogen',    'Most electronegative of all, guards your teeth'],
		['Ne', 'Neon',         '20.180', 'noble',      'Glows red-orange in shop signs'],
		['Na', 'Sodium',       '22.990', 'alkali',     'Half of table salt, fizzes wildly in water'],
		['Mg', 'Magnesium',    '24.305', 'alkaline',   'Burns with a blinding white flame'],
		['Al', 'Aluminium',    '26.982', 'post',       'Soda cans and kitchen foil'],
		['Si', 'Silicon',      '28.085', 'metalloid',  'Sand on the beach, chips in your computer'],
		['P',  'Phosphorus',   '30.974', 'nonmetal',   'Glows in the dark and strikes your matches'],
		['S',  'Sulphur',      '32.06',  'nonmetal',   'Brimstone, the yellow stuff of volcanoes'],
		['Cl', 'Chlorine',     '35.45',  'halogen',    'Keeps swimming pools clean'],
		['Ar', 'Argon',        '39.948', 'noble',      'The lazy one, about one percent of air'],
		['K',  'Potassium',    '39.098', 'alkali',     'Bananas are full of it'],
		['Ca', 'Calcium',      '40.078', 'alkaline',   'Builds your bones and teeth'],
		['Sc', 'Scandium',     '44.956', 'transition', 'Named after Scandinavia'],
		['Ti', 'Titanium',     '47.867', 'transition', 'Strong as steel at half the weight, named for the Titans'],
		['V',  'Vanadium',     '50.942', 'transition', 'Named after Vanadis, Norse goddess of beauty'],
		['Cr', 'Chromium',     '51.996', 'transition', 'Makes rubies red and bumpers shine'],
		['Mn', 'Manganese',    '54.938', 'transition', 'Turns permanganate a deep purple'],
		['Fe', 'Iron',         '55.845', 'transition', 'Red blood and red rust'],
		['Co', 'Cobalt',       '58.933', 'transition', 'Named after goblins, colours glass deep blue'],
		['Ni', 'Nickel',       '58.693', 'transition', 'Old Nick\'s copper, jingling in your coins'],
		['Cu', 'Copper',       '63.546', 'transition', 'Electric wires and the Statue of Liberty\'s green'],
		['Zn', 'Zinc',         '65.38',  'transition', 'Galvanises iron so it never rusts'],
		['Ga', 'Gallium',      '69.723', 'post',       'A metal that melts in your hand'],
		['Ge', 'Germanium',    '72.630', 'metalloid',  'Named after Germany, inside early transistors'],
		['As', 'Arsenic',      '74.922', 'metalloid',  'The poisoner\'s favourite'],
		['Se', 'Selenium',     '78.971', 'nonmetal',   'Named after the Moon'],
		['Br', 'Bromine',      '79.904', 'halogen',    'The only nonmetal that is liquid at room temperature'],
		['Kr', 'Krypton',      '83.798', 'noble',      'The hidden one, no relation to Superman'],
		['Rb', 'Rubidium',     '85.468', 'alkali',     'Named for its deep red spectral lines'],
		['Sr', 'Strontium',    '87.62',  'alkaline',   'Makes fireworks burn crimson'],
		['Y',  'Yttrium',      '88.906', 'transition', 'Named after the Swedish village of Ytterby'],
		['Zr', 'Zirconium',    '91.224', 'transition', 'Cubic zirconia, the diamond lookalike'],
		['Nb', 'Niobium',      '92.906', 'transition', 'Named after Niobe, daughter of Tantalus'],
		['Mo', 'Molybdenum',   '95.95',  'transition', 'Toughens steel and twists your tongue'],
		['Tc', 'Technetium',   '[98]',   'transition', 'The first element made artificially'],
		['Ru', 'Ruthenium',    '101.07', 'transition', 'Named after Russia'],
		['Rh', 'Rhodium',      '102.91', 'transition', 'Rarer than gold, named for its rose-pink salts'],
		['Pd', 'Palladium',    '106.42', 'transition', 'Named after the asteroid Pallas'],
		['Ag', 'Silver',       '107.87', 'transition', 'Second place on the podium'],
		['Cd', 'Cadmium',      '112.41', 'transition', 'Bright yellow paint and old Ni-Cd batteries'],
		['In', 'Indium',       '114.82', 'post',       'Named for an indigo line, hides in touchscreens'],
		['Sn', 'Tin',          '118.71', 'post',       'Tin cans and the Tin Man'],
		['Sb', 'Antimony',     '121.76', 'metalloid',  'Ancient Egyptian eyeliner'],
		['Te', 'Tellurium',    '127.60', 'metalloid',  'Named after the Earth itself'],
		['I',  'Iodine',       '126.90', 'halogen',    'Turns starch blue-black'],
		['Xe', 'Xenon',        '131.29', 'noble',      'The stranger, drives ion thrusters in space'],
		['Cs', 'Caesium',      '132.91', 'alkali',     'Keeps atomic clocks ticking'],
		['Ba', 'Barium',       '137.33', 'alkaline',   'The X-ray meal that lights up your gut'],
		['La', 'Lanthanum',    '138.91', 'lanthanide', 'Leads the lanthanide parade'],
		['Ce', 'Cerium',       '140.12', 'lanthanide', 'The spark in lighter flints'],
		['Pr', 'Praseodymium', '140.91', 'lanthanide', 'The green twin'],
		['Nd', 'Neodymium',    '144.24', 'lanthanide', 'The strongest permanent magnets'],
		['Pm', 'Promethium',   '[145]',  'lanthanide', 'Named after the Titan who stole fire'],
		['Sm', 'Samarium',     '150.36', 'lanthanide', 'First element named, indirectly, after a person'],
		['Eu', 'Europium',     '151.96', 'lanthanide', 'Glows on euro banknotes under UV light'],
		['Gd', 'Gadolinium',   '157.25', 'lanthanide', 'Sharpens MRI scans'],
		['Tb', 'Terbium',      '158.93', 'lanthanide', 'Another one from Ytterby, glows green'],
		['Dy', 'Dysprosium',   '162.50', 'lanthanide', 'Greek for hard to get'],
		['Ho', 'Holmium',      '164.93', 'lanthanide', 'Named after Stockholm'],
		['Er', 'Erbium',       '167.26', 'lanthanide', 'Boosts the light in fibre-optic cables'],
		['Tm', 'Thulium',      '168.93', 'lanthanide', 'Named after Thule, the mythical far north'],
		['Yb', 'Ytterbium',    '173.05', 'lanthanide', 'The fourth element named after Ytterby'],
		['Lu', 'Lutetium',     '174.97', 'lanthanide', 'Named after Paris'],
		['Hf', 'Hafnium',      '178.49', 'transition', 'Named after Copenhagen'],
		['Ta', 'Tantalum',     '180.95', 'transition', 'Named after Tantalus, lives in your phone'],
		['W',  'Tungsten',     '183.84', 'transition', 'The highest melting point of any metal'],
		['Re', 'Rhenium',      '186.21', 'transition', 'Named after the river Rhine'],
		['Os', 'Osmium',       '190.23', 'transition', 'The densest element in nature'],
		['Ir', 'Iridium',      '192.22', 'transition', 'Named after the rainbow, marks the dinosaurs\' end'],
		['Pt', 'Platinum',     '195.08', 'transition', 'Platinum records and catalytic converters'],
		['Au', 'Gold',         '196.97', 'transition', 'Olympic champion'],
		['Hg', 'Mercury',      '200.59', 'transition', 'Quicksilver, the liquid metal'],
		['Tl', 'Thallium',     '204.38', 'post',       'Named after a green twig'],
		['Pb', 'Lead',         '207.2',  'post',       'Plumbers got their name from it'],
		['Bi', 'Bismuth',      '208.98', 'post',       'Rainbow staircase crystals'],
		['Po', 'Polonium',     '[209]',  'post',       'Found by Marie Curie, named after Poland'],
		['At', 'Astatine',     '[210]',  'halogen',    'The rarest natural element on Earth'],
		['Rn', 'Radon',        '[222]',  'noble',      'Radioactive gas seeping from the ground'],
		['Fr', 'Francium',     '[223]',  'alkali',     'Named after France, almost never seen'],
		['Ra', 'Radium',       '[226]',  'alkaline',   'Glow-in-the-dark watch dials of old'],
		['Ac', 'Actinium',     '[227]',  'actinide',   'Its name means ray, it glows blue in the dark'],
		['Th', 'Thorium',      '232.04', 'actinide',   'Named after the Norse god of thunder']
	];

	// Grid position in an 18-column periodic table; f-block rows sit at 9 and 10.
	function tablePosition(z) {
		if (z === 1) return [1, 1];
		if (z === 2) return [1, 18];
		if (z <= 18) {
			var period = z <= 10 ? 2 : 3;
			var i = z - (period === 2 ? 3 : 11);
			return [period, i < 2 ? i + 1 : i + 11];
		}
		if (z <= 36) return [4, z - 18];
		if (z <= 54) return [5, z - 36];
		if (z <= 56) return [6, z - 54];
		if (z <= 71) return [9, z - 54];
		if (z <= 86) return [6, z - 68];
		if (z <= 88) return [7, z - 86];
		return [10, z - 86];
	}

	var ELEMENTS = RAW.map(function (e, i) {
		var z = i + 1;
		var pos = tablePosition(z);
		return { z: z, symbol: e[0], name: e[1], mass: e[2], category: e[3], clue: e[4], row: pos[0], col: pos[1] };
	});

	// Ticket column c holds these atomic numbers: 1-9, 10-19, ..., 70-79, 80-90
	var COLUMN_RANGES = [[1, 9], [10, 19], [20, 29], [30, 39], [40, 49], [50, 59], [60, 69], [70, 79], [80, 90]];

	function hashSeed(str) {
		var h = 1779033703 ^ str.length;
		for (var i = 0; i < str.length; i++) {
			h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
			h = (h << 13) | (h >>> 19);
		}
		h = Math.imul(h ^ (h >>> 16), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		return (h ^ (h >>> 16)) >>> 0;
	}

	function mulberry32(a) {
		return function () {
			a = (a + 0x6D2B79F5) | 0;
			var t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function normaliseCode(code) {
		return String(code).trim().toUpperCase();
	}

	/*
	 * A strip is 6 tickets that together use all 90 elements exactly once.
	 * Every ticket has 3 rows of 5, and 1 to 3 elements in each of its 9 columns.
	 */
	function generateStrip(code, stripNo) {
		code = normaliseCode(code);
		var rng = mulberry32(hashSeed(code + '/' + stripNo));
		function rand(n) { return Math.floor(rng() * n); }
		function shuffle(arr) {
			for (var i = arr.length - 1; i > 0; i--) {
				var j = rand(i + 1), tmp = arr[i];
				arr[i] = arr[j];
				arr[j] = tmp;
			}
			return arr;
		}

		// 1. How many elements each ticket takes from each column
		var counts;
		do { counts = distributeCounts(rand); } while (!counts);

		// 2. Which rows those elements go in, so every row ends up with exactly 5
		var rows = counts.map(function (ticketCounts) { return assignRows(ticketCounts, rng, shuffle); });

		// 3. Deal the shuffled elements out, ascending down each column
		var grids = counts.map(function () { return [0, 1, 2].map(function () { return [0, 0, 0, 0, 0, 0, 0, 0, 0]; }); });
		COLUMN_RANGES.forEach(function (range, c) {
			var pool = [];
			for (var z = range[0]; z <= range[1]; z++) pool.push(z);
			shuffle(pool);
			grids.forEach(function (grid, t) {
				var mine = pool.splice(0, counts[t][c]).sort(function (a, b) { return a - b; });
				rows[t][c].forEach(function (r, i) { grid[r][c] = mine[i]; });
			});
		});

		return grids.map(function (grid, t) {
			return {
				id: code + '-' + stripNo + '-' + (t + 1),
				number: (stripNo - 1) * 6 + t + 1,
				code: code,
				strip: stripNo,
				ticket: t + 1,
				grid: grid
			};
		});
	}

	function distributeCounts(rand) {
		var counts = [], totals = [];
		for (var t = 0; t < 6; t++) {
			counts.push([1, 1, 1, 1, 1, 1, 1, 1, 1]);
			totals.push(9);
		}
		for (var c = 8; c >= 0; c--) {
			var size = COLUMN_RANGES[c][1] - COLUMN_RANGES[c][0] + 1;
			for (var extra = size - 6; extra > 0; extra--) {
				var open = [];
				for (t = 0; t < 6; t++) {
					if (counts[t][c] < 3 && totals[t] < 15) open.push(t);
				}
				if (!open.length) return null;
				var pick = open[rand(open.length)];
				counts[pick][c]++;
				totals[pick]++;
			}
		}
		return counts;
	}

	// Fill the fullest columns first, each into the rows with the most room left
	function assignRows(colCounts, rng, shuffle) {
		var need = [5, 5, 5];
		var rows = [];
		var order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).sort(function (a, b) { return colCounts[b] - colCounts[a]; });
		order.forEach(function (c) {
			var ranked = [0, 1, 2]
				.map(function (r) { return { r: r, need: need[r], tie: rng() }; })
				.sort(function (a, b) { return b.need - a.need || a.tie - b.tie; });
			var chosen = ranked.slice(0, colCounts[c]).map(function (x) { return x.r; }).sort();
			chosen.forEach(function (r) {
				if (need[r] <= 0) throw new Error('Row assignment overflowed');
				need[r]--;
			});
			rows[c] = chosen;
		});
		return rows;
	}

	function parseTicketId(text) {
		var m = /^\s*([A-Za-z0-9]{2,12})\s*[-\s/.]\s*(\d{1,4})\s*[-\s/.]\s*([1-6])\s*$/.exec(String(text));
		if (!m) return null;
		return { code: normaliseCode(m[1]), strip: parseInt(m[2], 10), ticket: parseInt(m[3], 10) };
	}

	function getTicket(text) {
		var p = parseTicketId(text);
		if (!p || p.strip < 1) return null;
		return generateStrip(p.code, p.strip)[p.ticket - 1];
	}

	// Ticket numbers run 1-6 on strip 1, 7-12 on strip 2, and so on
	function getTicketByNumber(code, number) {
		if (!code || !(number >= 1)) return null;
		return generateStrip(code, Math.ceil(number / 6))[(number - 1) % 6];
	}

	function rowValues(grid, r) {
		return grid[r].filter(function (z) { return z; });
	}

	function allValues(grid) {
		return rowValues(grid, 0).concat(rowValues(grid, 1), rowValues(grid, 2));
	}

	var PATTERNS = [
		{ key: 'early5',  label: 'Early Five',   cells: allValues, need: 5 },
		{ key: 'corners', label: 'Four Corners', cells: function (g) {
			var top = rowValues(g, 0), bottom = rowValues(g, 2);
			return [top[0], top[top.length - 1], bottom[0], bottom[bottom.length - 1]];
		} },
		{ key: 'top',     label: 'Top Line',     cells: function (g) { return rowValues(g, 0); } },
		{ key: 'middle',  label: 'Middle Line',  cells: function (g) { return rowValues(g, 1); } },
		{ key: 'bottom',  label: 'Bottom Line',  cells: function (g) { return rowValues(g, 2); } },
		{ key: 'full',    label: 'Full House',   cells: allValues }
	];

	/*
	 * calledOrder: atomic numbers in the order they were called.
	 * For each pattern, reports the call number (1-based) on which it was completed, or null.
	 */
	function checkTicket(grid, calledOrder) {
		var callIndex = {};
		calledOrder.forEach(function (z, i) { callIndex[z] = i; });
		return PATTERNS.map(function (p) {
			var cells = p.cells(grid);
			var need = p.need || cells.length;
			var hits = cells
				.map(function (z) { return z in callIndex ? callIndex[z] : Infinity; })
				.sort(function (a, b) { return a - b; });
			var at = hits[need - 1];
			return {
				key: p.key,
				label: p.label,
				need: need,
				marked: hits.filter(isFinite).length,
				completedAt: isFinite(at) ? at + 1 : null
			};
		});
	}

	function randomCode() {
		var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		var out = '';
		for (var i = 0; i < 4; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
		return out;
	}

	global.ChemHousie = {
		CATEGORIES: CATEGORIES,
		ELEMENTS: ELEMENTS,
		COLUMN_RANGES: COLUMN_RANGES,
		PATTERNS: PATTERNS,
		generateStrip: generateStrip,
		parseTicketId: parseTicketId,
		getTicket: getTicket,
		getTicketByNumber: getTicketByNumber,
		checkTicket: checkTicket,
		randomCode: randomCode
	};
})(typeof window !== 'undefined' ? window : globalThis);
