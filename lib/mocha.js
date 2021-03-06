/*
	anvil.mocha - Mocha test runner for anvil.js
	version:	0.1.0
	author:		Alex Robson <alex@sharplearningcurve.com> (http://sharplearningcurve.com)
	copyright:	2011 - 2012
	license:	Dual licensed
				MIT (http://www.opensource.org/licenses/mit-license)
				GPL (http://www.opensource.org/licenses/gpl-license)
*/
var path = require( "path" );
var Mocha;

var mochaRunnerFactory = function( _, anvil ) {

	return anvil.plugin( {
		name: "anvil.mocha",
		activity: "test",
		dependencies: [],
		commander: [
			[ "--mocha", "runs mocha tests after each build" ]
		],
		config: {
			growl: false,
			ignoreLeaks: true,
			reporter: "spec",
			ui: "bdd",
			colors: true,
			specs: "./spec"
		},
		shouldTest: false,

		configure: function( config, command, done ) {
			this.reporterName = this.config.reporter.toLowerCase().replace( /[a-z]/, function( letter ) { return letter.toUpperCase(); } );
			this.ui = this.config.ui.toLowerCase();
			this.shouldTest = command.mocha;
			done();
		},

		run: function( done ) {
			if( !this.shouldTest ) {
				done();
			} else {
				if( !Mocha ) {
					Mocha = require( "mocha" );
				}
				try {
					var self = this,
						config = this.config,
						mocha = new Mocha( {
							colors: config.colors,
							growl: config.growl,
							ignoreLeaks: config.ignoreLeaks,
							slow: config.slow,
							timeout: config.timeout,
							ui: this.ui
						} );
					mocha.reporter( this.reporterName );
					_.each( anvil.project.specs, function( file ) {
						var fullPath = file.fullPath;
						delete require.cache[ fullPath ];
						mocha.addFile( fullPath );
					} );
					_.each( anvil.project.files, function( file ) {
						var fullPath = file.fullPath,
							relativeSegment = path.relative( anvil.config.spec, fullPath ),
							relativePath = path.join( "/", relativeSegment );
						delete require.cache[ fullPath ];
					} );
					mocha.run( function() {
						self.emit( "tests.complete" );
						anvil.log.complete( "tests complete" );
						done();
					} );
				} catch ( err ) {
					anvil.log.error( "Error starting mocha: " + err + "\n" + err.stack );
					self.emit( "tests.complete" );
					done();
				}
			}
		}
	} );
};

module.exports = mochaRunnerFactory;