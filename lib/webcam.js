/*!
 * @name		SnowCam : lib/webcam.js
 * @version		1.0.0
 * Copyright 2012 Ben Periton All rights reserved.
 */

/*global console, document, window, module, exports, process*/
/*jslint white:true*//*jslint nomen:true*//*jslint plusplus:true*/

/**
 * 
 */
(function (GLOBAL) {
	
	// ----- Internal
	// ----------------------------------------------------------------------
	
	'use strict';
	
	var
		webcam = {},
		requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function ($cb) {
			window.setTimeout( $cb, 1000 / 60 );
		},
		getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webmitGetUserMedia || null
	;
	
	
	// ----- Main webcam object
	// ----------------------------------------------------------------------
	
	webcam.init = function ($video) {
		this.video = ('string' === typeof $video) ? document.getElementById( $video ) : $video;
		this.width = this.video.width;
		this.height = this.video.height;
		
		return this;
	};
	
	webcam.connect = function () {
		navigator.mozGetUserMedia( {video: true}, function ($stream) {
			this.video.mozSrcObject = $stream;
			this.video.play();
			
			requestAnimationFrame( this.onReadFrame );
			
		}.bind( this ), function err() {});
		
		return this;
	};
	
	webcam.onReadFrame = function () {
		return;
	};
	
	
	// ----- Expose
	// ----------------------------------------------------------------------
	
	GLOBAL.webcam = webcam;
	
}( window ));