/**
 * A main popup script that manage add, update and deletion of activities
 * Copyright 2012 the Time tracker Authors
 * Use of this source code is governed by a BSD-style license that can be found
 * in the "LICENSE" file.
 * Mustafa Zidan <mustafa@zidan.me>
 */

/**
 * you can use Activity model as follows
 * activity = new Activity('name'[,description [, start [,stop ] ] ] );
 */ 
var Activity = function() {
    this.name = arguments[0] ? arguments[0]:'';
    this.description =  arguments[1] ? arguments[1]:''; 
    this.start =  arguments[2] ? arguments[2]: Date.now();
    this.stop =  arguments[3] ? arguments[3]:null;
};

Activity.prototype = {
    name :"",
    description: "",
    start: null,
    stop: null,
    inprogress:true,
    isValid: function() { return !Tracker.inProgress() || Tracker.checkOverlapping(this); }
};

var Tracker = {
	shortName : "tracker",
	version :"1.0", 
 	displayName : "tracker",
	maxSize : 2 * 1024 * 1024, // 2 Megabytes 
	db: null,
	/**
	  * Open Database Connection and create database if doesn't exist 
	  * +======+============+===============+=========+========+==============+
	  * |  id  |  activity  |  description  |  start  |  end   |  inProgress  |
	  * +======+============+===============+=========+========+==============+
	  */
	dbInit : function() {
			this.db = openDatabase( this.shortName, this.version, this.displayName, this.maxSize);
			this.db.transaction(
				function(tx) {
 	 				tx.executeSql("CREATE TABLE IF NOT EXISTS activity" 
 	 				+ "(id INTEGER unique PRIMARY KEY ,activity TEXT"
 	  				+ ", description TEXT,start TIME,end TIME,inProgress BOOLEAN)", [ ] ,
 	  					function() {
 	  						console.log("DB INIT");
 	  					}
 	  					, function() {
 	  						console.log("error initiating tracker table");
 	  						exit(1);
 	  					}
 	  				);	
				} 
			); 
	},
	
	/**
	  *
	  */
	init : function() {
		this.dbInit();
		//chrome.alarms.onAlarm.addListener(function(Alarm alarm) {});
		this.getActivities( new Date());
	},
	
	/**
	  *
	  */
	getActivities: function( date ) {
		console.log("getting activities for " + moment(date).format("DD-MM-YYYY"));
		this.db.transaction(
			function( tx ) {
				tx.executeSql("SELECT * FROM activity where strftime('%d-%m-%Y', start ) = ? order by start ",
				[ moment(date).format("DD-MM-YYYY") ] ,
				Tracker.populateActivitesList,
				Tracker.showError
				);
			}
		);	
	},
	
	/**
	  *
	  */
	populateActivitesList : function( tx, activities) {
		
		$(activities.rows).each( function( index, activity ) { 
			$('.tasks-no-content').remove();
			console.log(index);
			console.log(activities.rows.item(index)['activity']);
			/*if ( activity['inProgress'] == 1 ) {
				Tracker.updateBadge( activity['start'] );		
				jQuery("#start").text("Stop");
		 		jQuery("#activity").attr("disabled", "disabled");
		 		jQuery("#start").attr("onclick","Tracker.stopTracking()");
			}*/
			$( "#taskRecord" ).tmpl(activity).appendTo( "#tasks" ); });
	},
	
	/**
	  *
	  */
	showError: function( error ) {
		console.log( error.message );
		
		jQuery("#error").html('<b>' + error.message + '</b><br />');
		$("#error").dialog({
			bgiframe: true,
			height: 70,
			modal: true,
			buttons: { "Ok": function() { $(this).dialog("close"); } } 
		});
		$("#error").dialog('open');
	},
	
	startTracking: function() {
		var activity = new Activity(jQuery("#activity").val());
		if( activity.isValid() ) {
			console.log( "activity started" );
			/* TODO : check overlapping
		 	 * 
		 	 * update in progress record to true
		 	 */
			this.db.transaction(
				function(tx) {
					tx.executeSql(
						" INSERT INTO activity (activity,description,start,end,inProgress)"+
						" VALUES(?,?,datetime('now','localtime'),?,1)", 
						[activity.name,activity.description,activity.stop],
						function(tx, result) {
							// update badge
							$('.tasks-no-content').remove();
							$( "#taskRecord" ).tmpl(activity).appendTo( "#tasks" );
							Tracker.updateBadge(0);
							console.log("Started Successfully" ); 
						} , 
						function(tx, error) {
							console.log( "ERROR=> "  +  error.message );
						} 
					);	
				}
			);

		 	jQuery("#start").text("Stop");
		 	jQuery("#activity").attr("disabled", "disabled");
		 	jQuery("#start").attr("onclick","Tracker.stopTracking()");
		} else {
			showError(activity.message);
		}
	},
	
	stopTracking: function() {
		console.log( "activity stopped" );
		jQuery("#start").text("Start");
		jQuery("#activity").removeAttr("disabled");
		jQuery("#start").attr("onclick","Tracker.startTracking()");
		//chrome.alarms.clear(string name)

	},
	
	/**
	 * Check if there is already a record 
	 * exist that overlapped with the current activity
	 */
	checkOverlapping : function( activity ) {
		this.db.transaction(
			function(tx) {
				tx.executeSql(
					" SELECT * from activity where TIME(start) between TIME(?) and TIME(?) " +
					" or TIME(stop) between TIME(?) and TIME(?)", 
					[activity.start, activity.stop], 
					function() {
						activity.status = Status.OVERLAPPED
					}, 
					function() {
						activity.status = Status.VALID;
					});	
			}
		);
	},
	
	/**
	 * clear all html in specific 
	 */
	clear : function(dom) {
		$( dom ).html("");
	},
	
	inProgress : function() {
		this.db.transaction(
			function(tx) {
				tx.executeSql(
					" SELECT * from activity where DATE(start) = DATE('now','localtime') " +
					" and inProgress = true", 
					[null], 
					function() {
						return true;
					}, 
					function() {
						return false;
					});	
			}
		);
	},
	updateBadge : function( minutes ) {
		//chrome.browserAction.setBadgeText({text:"000"});
		//TODO update every minute
		/*
		 * chrome.alarms.create("badge", {
			periodInMinutes: 1,
			scheduledTime: Date.now() + 1000 ,
			name:"badge"
		} );*/	
	} 
	
};