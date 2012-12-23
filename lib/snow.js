/*!
 * @name		SnowCam : lib/snow.js
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
		snow = {},
		requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function ($cb) {
			window.setTimeout( $cb, 1000 / 60 );
		}
	;
	
	
	// ----- Flake object
	// ----------------------------------------------------------------------
	
	function Flake () {
		this.canvas = {
			width: 0
		};
		
		this.xPos = 0;
		this.yPos = 0;
		this.xVel = 0;
		this.yVel = 0;
		
		this.speed = 0;
		this.radius = 0;
		this.step = 0;
		this.stepSize = 0;
		
		this.opacity = 1;
	}
	
	/**
	 * 
	 */
	Flake.prototype.init = function () {
		var
			speed = (Math.random() * 1) + 0.5
		;

		this.xPos = Math.floor( Math.random() * this.canvas.width );
		this.yVel = speed;
		
		this.speed = speed;
		this.radius = (Math.random() * 2) + 1;
		this.stepSize = (Math.random()) / 30;
		
		this.opacity = (Math.random() * 0.5) + 0.5;
		
		return this;
	};
	
	/**
	 * 
	 */
	Flake.prototype.reset = function () {
		this.yPos = 0;
		this.xVel = 0;
		this.step = 0;
		
		return this.init();
	};
	
	
	// ----- Helpers
	// ----------------------------------------------------------------------
	
	function _createFlake ($canvasWidth) {
		var 
			flake = new Flake()
		;
		
		flake.canvas.width = $canvasWidth;
		
		return flake.init();
	}
	
	
	// ----- Main snow object
	// ----------------------------------------------------------------------
	
	snow.canvas = null;
	snow.context = null;
	
	snow.flakes = [];
	
	snow.options = {
		maxFlakes: 50
	};
	
	
	/**
	 * 
	 * @param {Object} $canvas
	 * @param {Object} $options
	 */
	snow.init = function ($canvas,$options) {
		var
			i = 0
		;
		
		this.canvas = ('string' === typeof $canvas) ? document.getElementById( $canvas ) : $canvas;
		this.context = this.canvas.getContext( '2d' );
		
		this.canvas.width = 320;
		this.canvas.height = 240;
		
		// Create the flakes
		for ( i=0; i<this.options.maxFlakes; i++ ) {
			this.flakes.push( _createFlake( this.canvas.width ) );
		}
		
		this.draw();
	};
	
	/**
	 * 
	 */
	snow.draw = function () {
		var
			i = 0,
			flake,
			startX = -100,
			startY = -100,
			minDistance = 150,
			distance,
			deltaV,
			xcomp,
			ycomp
		;
		
		this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
		
		for ( i=0; i<this.options.maxFlakes; i++ ) {		
			flake = this.flakes[i];
			
			distance = Math.sqrt( (flake.xPos - startX) * (flake.xPos - startX) + (flake.yPos - startY) * (flake.yPos - startY) );
	
	        if ( distance < minDistance ) { 
				xcomp = (startX - flake.xPos) / distance;
				ycomp = (startY - flake.yPos) / distance;
				deltaV = (minDistance / (distance * distance)) / 2;
	
	            flake.xVel -= deltaV * xcomp;
	            flake.yVel -= deltaV * ycomp;
	            
	        } else {
	            flake.xVel *= 0.98;
	            
	            if (flake.yVel <= flake.speed) {
					flake.yVel = flake.speed;
	            }
	            
	            flake.step += 0.5;
	            
	            flake.xVel += Math.cos(flake.step) * flake.stepSize;
	        }
	        
	        flake.xPos += flake.xVel;
			flake.yPos += flake.yVel;
	        
	        if (flake.xPos >= this.canvas.width || flake.xPos <= 0) {
	            flake.reset();
	        }
	        
			if (flake.yPos >= this.canvas.height || flake.yPos <= 0) {
	            flake.reset();
	        }
	        
			this.context.fillStyle = "rgba(255, 255, 255, " + flake.opacity + ")";
			this.context.beginPath();		
			this.context.moveTo( flake.xPos, flake.yPos );
			this.context.arc( flake.xPos, flake.yPos, flake.radius, 0, Math.PI*2, true );
			this.context.fill();
		}

		requestAnimationFrame( this.draw.bind( this ) );
	};
	
	
	// ----- Expose
	// ----------------------------------------------------------------------
	
	GLOBAL.snow = snow;
	
}( window ));