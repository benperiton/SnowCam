/*!
 * @name		SnowCam : lib/wwConvolution.js
 * 
 * This basically came from http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
 */

/*global console, postMessage, Float32Array*/
/*jslint white:true*//*jslint nomen:true*//*jslint plusplus:true*/

/**
 * 
 */
function convoluteFloat32 ($pixels,$weights,$opaque) {
	'use strict';
	
	var
		side = Math.round(Math.sqrt($weights.length)),
		halfSide = Math.floor(side/2),
		src = $pixels.data,
		sw = $pixels.width,
		sh = $pixels.height,
		w = sw,
		h = sh,
		output = {
			width: w,
			height: h,
			data: new Float32Array(w*h*4)
		},
		dst = output.data,
		alphaFac = $opaque ? 1 : 0,
		x = 0,
		y = 0,
		sy = 0,
		sx = 0,
		cy = 0,
		cx = 0,
		scy = 0,
		scx = 0,
		srcOff = 0,
		wt = 0,
		dstOff = 0,
		r=0, g=0, b=0, a=0
	;

	for ( y=0; y<h; y++ ) {
		for ( x=0; x<w; x++ ) {
			sy = y;
			sx = x;
			dstOff = (y*w+x)*4;
			r=0; g=0; b=0; a=0;
			for ( cy=0; cy<side; cy++ ) {
				for ( cx=0; cx<side; cx++ ) {
					scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
					scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
					srcOff = (scy*sw+scx)*4;
					wt = $weights[cy*side+cx];
					r += src[srcOff] * wt;
					g += src[srcOff+1] * wt;
					b += src[srcOff+2] * wt;
					a += src[srcOff+3] * wt;
				}
			}
			dst[dstOff] = r;
			dst[dstOff+1] = g;
			dst[dstOff+2] = b;
			dst[dstOff+3] = a + alphaFac*(255-a);
		}
	}
	
	return output;
}

onmessage = function ($evt) {
	'use strict';

	var
		response = {
			horizontal: null,
			vertical: null,
			width: 0,
			height: 0
		}
	;
	
	if ( $evt.data.horizontal ) {
		response.horizontal = convoluteFloat32( $evt.data.image, [
			-1, -2, -1,
			0,  0,  0,
			1,  2,  1
		] );
		
		response.width = response.horizontal.width;
		response.height = response.horizontal.height;
	}
	
	if ( $evt.data.vertical ) {
		response.vertical = convoluteFloat32( $evt.data.image, [
			-1, 0, 1,
			-2, 0, 2,
			-1, 0, 1 
		] );
		
		response.width = response.vertical.width;
		response.height = response.vertical.height;
	}

	postMessage( response );
	return;
};

