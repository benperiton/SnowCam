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
		this.radius = (Math.random() * 2) + 0.75;
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
			flake = new Flake(),
			i
		;
		
		flake.canvas.width = $canvasWidth;
		
		return flake.init();
	}
	
	
	// ----- Main snow object
	// ----------------------------------------------------------------------
	
	snow.canvas = null;
	snow.context = null;
	
	snow.fallingFlakes = [];
	snow.stickyFlakes = {};
	snow.stickyFlakeCount = 0;
	
	snow.options = {
		maxFlakes: 200
	};
	
	snow.ledges = [];
	
	
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
			this.fallingFlakes.push( _createFlake( this.canvas.width ) );
		}
		
		this.draw();
	};
	
	/**
	 * 
	 */
	snow.draw = function () {
		var
			i = 0,
			l = this.fallingFlakes.length,
			j = 0,
			k = 0,
			ledge,
			flake,
			startX = -100,
			startY = -100,
			minDistance = 150,
			distance,
			deltaV,
			xcomp,
			ycomp,
			destroyCount = 0,
			createCount = 0
		;
		
		this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
		
		for ( i=0; i<l; i++ ) {	
			flake = this.fallingFlakes[i];
			
			var mx = Math.floor(flake.xPos);
			var my = Math.floor(flake.yPos);
			
			// Check if we have a flake here already
			if ( this.stickyFlakes[mx] && this.stickyFlakes[mx][my] > 0 ) {
				if ( this.stickyFlakes[mx][my] < 10 ) {
					// Pile up the snow
					if ( ! flake.sticky ) {
						flake.yPos += (this.stickyFlakes[mx][my] + flake.radius/2);
						flake.sticky = true;
						this.stickyFlakes[mx][my]++;
					//	this.stickyFlakeCount++;
					}
					
					//createCount++;
					//this.fallingFlakes.push( _createFlake( this.canvas.width ) );
					//console.log( 'l = ', l );
				} else if ( this.stickyFlakes[mx][my] === 10 ) {
					//createCount++;
					flake.sticky = false;
					this.stickyFlakes[mx][my] = 0;
					//this.stickyFlakeCount--;
					
				}
			}
			
			// Check if we have the flakes position in the ledges array
			if ( this.ledges[mx] && this.ledges[mx][my] ) {
				// Not already sticky, so make it stick
				if ( ! flake.sticky ) {
					flake.sticky = true;
					
					if ( ! this.stickyFlakes[mx] ) {
						this.stickyFlakes[mx] = {};
					}
					
					this.stickyFlakes[mx][my] = 1;
					this.stickyFlakeCount++;
					
					//createCount++;
					if ( this.stickyFlakeCount < (this.options.maxFlakes / 2) ) {
						this.fallingFlakes.push( _createFlake( this.canvas.width ) );
					}
				}
				
			// No match, so unstick if needed
			} else {
				if ( flake.sticky === true ) {
					// Set this so that a flake will be destoryed
					//destroyCount++;
					
					if ( this.stickyFlakes[mx] && this.stickyFlakes[mx][my] ) {
						this.stickyFlakes[mx][my] = 0;
						//this.stickyFlakeCount--;
					}
				}
				
				flake.sticky = false;
			}
			
			if ( ! flake.sticky ) {
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
		        
		        // Set new position
		        flake.xPos += flake.xVel;
				flake.yPos += flake.yVel;
				
				// Check bounds
		        if (flake.xPos >= this.canvas.width || flake.xPos <= 0) {
					flake.reset();
		        }
		        
				if (flake.yPos >= this.canvas.height || flake.yPos <= 0) {
					flake.reset();
		        }
	        }
			
			this.context.fillStyle = "rgba(255, 255, 255, " + flake.opacity + ")";
			this.context.beginPath();		
			this.context.moveTo( flake.xPos, flake.yPos );
			this.context.arc( flake.xPos, flake.yPos, flake.radius, 0, Math.PI*2, true );
			this.context.fill();
		}
		
		if ( destroyCount > 0 ) {
			for ( i=0; i<destroyCount; i++ ) {
				//if ( this.fallingFlakes.length > this.options.maxFlakes ) {
					//this.fallingFlakes.pop();
				//}
			}
			/*
			while ( destroyCount > 0 ) {
				l = this.fallingFlakes.length-1;
				
				if ( !this.fallingFlakes[l].sticky  ) {
					this.fallingFlakes.pop();
					destroyCount--;
					l--;
				}
				l--;
			}
			*/
    	}
    	
    	if ( createCount > 0 ) {
			for ( i=0; i<createCount; i++ ) {
				this.fallingFlakes.push( _createFlake( this.canvas.width ) );
			}
    	}
    	
    	if ( destroyCount > 0 || createCount > 0 ) {
    		//console.log(this.fallingFlakes.length);
    	}
		
		requestAnimationFrame( this.draw.bind( this ) );
	};
	
	
	// ----- Expose
	// ----------------------------------------------------------------------
	
	GLOBAL.snow = snow;
	
}( window ));