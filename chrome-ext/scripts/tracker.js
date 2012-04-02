/**
 * A main popup script that manage add, update and deletion of activities
 * Copyright 2012 the Time tracker Authors
 * Use of this source code is governed by a BSD-style license that can be found
 * in the "LICENSE" file.
 * Mustafa Zidan <mustafa@zidan.me>
 */
var Tracker = {
	shortName : "tracker",
	version :"1.0", 
 	displayName : "tracker",
	maxSize : 2 * 1024 * 1024, // 2 Megabytes 
	db: null,
	/**
	  *
	  */
	dbInit : function() {
			this.db = openDatabase( this.shortName, this.version, this.displayName, this.maxSize);
			this.db.transaction(
				function(tx) {
 	 				tx.executeSql("CREATE TABLE IF NOT EXISTS time_tracker" 
 	 				+ "(id INTEGER unique PRIMARY KEY ,activity TEXT"
 	  				+ ", description TEXT,start TIME,end TIME)", [ ] ,
 	  					function() {
 	  						console.log("database initiated sucessfully ");
 	  					}
 	  					, function() {
 	  						console.log("error initiating tracker table");
 	  					}
 	  				);	
				} 
			); 
	},
	/**
	  *
	  */
	init : function() {
		this.dbInit()
		this.getActivities( new Date() );
		//List data 
	},
	/**
	  *
	  */
	getActivities: function( date ) {
		console.log("getting activities for" + date );
		this.db.transaction(
			function( tx ) {
				tx.executeSql("SELECT * FROM time_tracker where DATE(start) = DATE(?) order by start ",
				[date] ,
				this.populateActivitesList,
				this.showError
				);
			}
		);	
	},
	/**
	  *
	  */
	populateActivitesList : function( activities ) {
		console.log( activities );
	},
	/**
	  *
	  */
	showError: function( error ) {
		//TODO show error dialog
		console.log( error.message );
	},
	startTracking: function() {
		console.log( "activity started" );
		
		/*TODO : check overlapping
		 * save entity, 
		 * update in progress record to true
		 * change label of button ==>DONE
		 * disable input text==> DONE
		 * refresh activity list 
		 */
		 jQuery("#start").text("Stop");
		 jQuery("#activity").attr("disabled", "disabled");
		 jQuery("#start").attr("onclick","Tracker.stopTracking()");

	},
	stopTracking: function() {
		console.log( "activity stopped" );
		 jQuery("#start").text("Start");
		 jQuery("#activity").removeAttr("disabled");
		 jQuery("#start").attr("onclick","Tracker.startTracking()");
	}
}