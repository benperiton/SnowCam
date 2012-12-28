/*!
 * @name		SnowCam : lib/snow.js
 */

/*global console*/
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
		
		this.sticky = false;
		this.noStick = false;
	}
	
	/**
	 * 
	 */
	Flake.prototype.init = function () {
		var
			speed = Math.random() + 0.5
		;

		this.xPos = Math.floor( Math.random() * this.canvas.width );
		this.yVel = speed;
		
		this.speed = speed;
		this.radius = Math.random() + 2;
		this.stepSize = Math.random() / 30;
		
		this.opacity = (Math.random() * 0.5) + 0.5;
		
		return this;
	};
	
	/**
	 * 
	 */
	Flake.prototype.stick = function () {
		if ( ! this.noStick ) {
			this.sticky = true;
			this.tm = setTimeout((function ($this) {
				return function () {
					$this.melt();
				};
			}( this )), ((Math.random() * 9 ) + 4) * 1000);
		}
	};
	
	/**
	 * 
	 */
	Flake.prototype.unStick = function () {
		this.sticky = false;
	};
	
	/**
	 * 
	 */
	Flake.prototype.melt = function () {
		if ( ! this.timer ) {
			this.timer = setInterval((function ($this) {
				return function () {
					$this.melt();
				};
			}( this )), 1000);
		}
		
		this.opacity  -= 0.1;
		
		if ( this.opacity <= 0 ) {
			this.reset();
		}
	};
	
	/**
	 * 
	 */
	Flake.prototype.reset = function () {
		this.yPos = 0;
		this.xVel = 0;
		this.step = 0;
		this.sticky = false;
		this.noStick = false;
		
		if ( this.tm ) {
			clearInterval( this.tm );
		}
		
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
	
	snow.options = {
		maxFlakes: 300
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
			x = 0,
			y = 0,
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
			
			x = Math.floor(flake.xPos);
			y = Math.floor(flake.yPos);
			
			// Check if we have a flake at this coord already
			if ( this.stickyFlakes[x] && this.stickyFlakes[x][y] ) {
				// Pile up the snow
				if ( ! flake.sticky ) {
					flake.yPos += (this.stickyFlakes[x][y] + flake.radius + 5);
					flake.stick();
					this.stickyFlakes[x][y]++;
				}
			}
			
			// Check if we have the flakes position in the ledges array
			if ( this.ledges[x] && this.ledges[x][y] ) {
				// Not already sticky, so make it stick
				if ( ! flake.sticky ) {
					flake.stick();
					
					if ( ! this.stickyFlakes[x] ) {
						this.stickyFlakes[x] = {};
					}
					
					// Save the coord of this flake
					this.stickyFlakes[x][y] = 1;
				}
				
			// No match, so unstick if needed
			} else {
				if ( flake.sticky === true ) {
					if ( this.stickyFlakes[x] && this.stickyFlakes[x][y] ) {
						this.stickyFlakes[x][y] = 0;
					}
					
					flake.unStick();
				}
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
	        
			this.context.fillStyle = 'rgba(255, 255, 255, ' + flake.opacity + ')';
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