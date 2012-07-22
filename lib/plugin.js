/*
	anvil.mocha - Mocha test runner for anvil.js
	version: 0.0.2
	author: Alex Robson <alex@sharplearningcurve.com> (http://sharplearningcurve.com)
	copyright: 2012
	license: Dual licensed 
			 MIT (http://www.opensource.org/licenses/mit-license)
			 GPL (http://www.opensource.org/licenses/gpl-license)
*/
var Mocha = require( "mocha" );

var mochaRunnerFactory = function( _, anvil ) {
	return anvil.plugin( {
		name: "anvil.mocha",
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

		configure: function( config, command, done ) {
			var mochaConfig = config.mocha;
			this.reporterName = mochaConfig.reporter.toLowerCase().replace( /[a-z]/, function( letter ) { return letter.toUpperCase(); } );
			this.ui = mochaConfig.ui.toLowerCase();
			if( command.mocha ) {
				anvil.events.on( "build.done", this.test );
			}
			done();
		},

		test: function() {
			try {
				var self = this,
					config = anvil.config.mocha,
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
				mocha.run( function() {
					anvil.events.raise( "tests.complete" );
					anvil.log.complete( "tests complete" );
				} );
			} catch ( err ) {
				anvil.log.error( "Error starting mocha: " + err );
			}
		}
	} );
};

module.exports = mochaRunnerFactory;