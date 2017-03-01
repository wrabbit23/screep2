module.exports =
	{
		"isNull": function (value) {
			if (typeof value === "undefined" || value === null)
				return true;
			else
				return false;
		},

		"clamp": function (value, min, max) {
			return Math.min(Math.max(value, min), max);
		},

		"log": function (message, output) {
			if (output)
				console.log(message);
		},

		logSpecial: function( data, maxLevels=Infinity ) {
			console.log( this.outputSpecial( data, maxLevels ) );
		},

		outputSpecial: function( data, maxLevels=Infinity ) {
			if ( _.isObject( data ) || _.isArray( data ) ) {
				data = JSON.stringify( data );
			}

			if ( maxLevels <= 0 ) {
				return data;
			}

			let pos = 0;
			let lastPos = data.length;
			let output = '';
			let level = 0;

			while ( pos < lastPos ) {
				let char = data.charAt( pos );

				if ( ( char === '[' ) || ( char === '{' ) ) {
					let nextChar = data.charAt( pos + 1 );
					if ( ( nextChar === ']' ) || ( nextChar === '}' ) ) {
						output += char + nextChar;
						pos += 2;
					} else {
						let outputInner = '';
						[ outputInner, pos ] = this.outputSpecialInner( data, pos + 1, 1, maxLevels );
						output += char + '\n' + outputInner;
					}
				} else if ( char === ',' ) {
					output += char + '\n';
				} else {
					pos += 1;
					output += char;
				}
			}

			return output;
		},

		outputSpecialInner: function( data, pos, level, maxLevels ) {
			let lastPos = data.length;
			let output = ' '.repeat( level * 2 );
			let opens = 0;

			while ( pos < lastPos ) {
				let char = data.charAt( pos );

				if ( ( char === '[' ) || ( char === '{' ) ) {
					let nextChar = data.charAt( pos + 1 );
					if ( ( nextChar === ']' ) || ( nextChar === '}' ) ) {
						output += char + nextChar;
						pos += 2;
					} else if ( level >= maxLevels ) {
						opens += 1;
						output += char;
						pos += 1;
					} else {
						let outputInner = '';
						[ outputInner, pos ] = this.outputSpecialInner( data, pos + 1, level + 1, maxLevels );
						output += char + '\n' + outputInner;
					}
				} else if ( ( char === ']' ) || ( char === '}' ) ) {
					if ( ( level >= maxLevels ) && ( opens > 0 ) ) {
						opens -= 1;
						output += char;
						pos += 1;
					} else {
						output += '\n' + ' '.repeat( ( level - 1 ) * 2 ) + char;
						pos += 1;
						return [ output, pos ];
					}
				} else if ( char === ',' ) {
					if ( opens === 0 ) {
						output += char + '\n' + ' '.repeat( level * 2 );
					} else if ( level >= maxLevels ) {
						output += char;
					} else {
						output += char + '\n' + ' '.repeat( level * 2 );
					}
					pos += 1;
				} else {
					output += char;
					pos += 1;
				}
			}

			return [ output, pos ];
		},

	};
