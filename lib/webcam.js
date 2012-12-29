/*!
 * @name		SnowCam : lib/webcam.js
 */

/*global console*/
/*jslint white:true*//*jslint nomen:true*//*jslint plusplus:true*/

/**
 * 
 */
(function () {
	
	// ----- Internal
	// ----------------------------------------------------------------------
	
	'use strict';
	
	var
		webcam = {}
	;
	
	// Normalise
	window.URL = window.URL || window.webkitURL;
	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || null;
	navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || null;
	
	
	// ----- Main webcam object
	// ----------------------------------------------------------------------
	
	webcam.init = function ($video) {
		this.video = ('string' === typeof $video) ? document.getElementById( $video ) : $video;
		this.width = this.video.width;
		this.height = this.video.height;
		
		return this;
	};
	
	webcam.connect = function () {
		navigator.getUserMedia( {video: true}, function ($stream) {
			if ( this.video.mozSrcObject ) {
				this.video.mozSrcObject = $stream;
			} else {
				if ( window.URL ) { // Opera dones thave this
					this.video.src = window.URL.createObjectURL( $stream );
				} else {
					this.video.src = $stream;
				}
			}
			this.video.play();
			
			window.requestAnimationFrame( this.onReadFrame );
			
		}.bind( this ), function err($err) {
			console.log('Ooops, that didnt work', $err);
		});
		
		return this;
	};
	
	webcam.onReadFrame = function () {
		return;
	};
	
	
	// ----- Expose
	// ----------------------------------------------------------------------
	
	window.webcam = webcam;
	
}());