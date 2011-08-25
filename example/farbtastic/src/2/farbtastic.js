/**
 * Farbtastic: jQuery color picker plug-in 2.0a
 * 
 * Farbtastic Color Picker
 * © 2008 Steven Wittens
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

(function ($) {
	var console = window.console ? window.console : {
			log: $.noop,
			error: function (msg) {
				$.error(msg);
			}
		},
		debug = true;

	$._farbtastic = function (container, options) {
		var fb = this,
			defaults = {
				callback:		null,
				color:			"#808080",
				usingExCanvas:	false,
				version:		2,
				wheelWidth:		null,
				width:			300
			},
			element = null; // $(div.farbtastic)

		fb.init = function () {
			// Parse options
			if (options && !options.callback) {
				options = { callback: options };
			}

			options = $.extend(true, defaults, options);
			options.wheelWidth = options.width / 10;

			fb.options2 = options;
			
			// Touch support
			$.extend($.support, {
				touch: (typeof Touch === "object")
			});

			fb.usingExCanvas = options.usingExCanvas;

			// Initialize
			fb.initWidget();

			// Install mousedown handler (the others are set on the document on-demand)
			element.find(".farbtastic-overlay").bind("mousedown.farbtastic", fb.mousedown);

			// Install touch handlers to simulate appropriate mouse events
			if ($.support.touch) {
				element.find(".farbtastic-overlay")
					.bind("touchstart.farbtastic touchmove.farbtastic touchend.farbtastic touchcancel.farbtastic", $.farbtastic.touchHandle);
			}

			// Set linked elements/callback
			if (options.callback) {
				$.farbtastic.linkTo_(fb, options.callback);
			}
		};

		/**
		 * Initialize the color picker widget
		 */
		fb.initWidget = function () {
			//excanvas-compatible building of canvases
			function makeCanvas(className) {
				var canvas = document.createElement("canvas");

				if (!canvas.getContext) { // excanvas hack
					canvas = window.G_vmlCanvasManager.initElement(canvas);
					canvas.getContext(); //this creates the excanvas children
					fb.usingExCanvas = true;
				}

				$(canvas).addClass(className);

				return canvas;
			}

			// Insert markup and size accordingly
			var dim = {
				width: options.width,
				height: options.width
			};

			$(container).html('<div class="farbtastic" style="position: relative">' +
				'<div class="farbtastic-solid"></div>' +
				'</div>'
				)
				.children(".farbtastic")
				.append(makeCanvas("farbtastic-mask"))
				.append(makeCanvas("farbtastic-overlay"))
				.end()
				.find("*").attr(dim).css(dim).end()
				.find("div>*").css("position", "absolute");

			element = $(container).find(".farbtastic");
			
			// Determine layout
			fb.radius = (options.width - options.wheelWidth) / 2 - 1;
			fb.square = Math.floor((fb.radius - options.wheelWidth / 2) * 0.7) - 1;
			fb.mid = Math.floor(options.width / 2);
			fb.markerSize = options.wheelWidth * 0.3;

			fb.solidFill = element.find(".farbtastic-solid").css({
				width: fb.square * 2 - 1,
				height: fb.square * 2 - 1,
				left: fb.mid - fb.square,
				top: fb.mid - fb.square
			});

			// Set up drawing context
			fb.cnvMask = element.find(".farbtastic-mask");
			fb.ctxMask = fb.cnvMask[0].getContext("2d");
			fb.ctxOverlay = element.find(".farbtastic-overlay").get(0).getContext("2d");
			fb.ctxMask.translate(fb.mid, fb.mid);
			fb.ctxOverlay.translate(fb.mid, fb.mid);

			// Draw widget base layers
			fb.drawCircle();
			fb.drawMask();
		};

		/**
		 * Draw the color wheel
		 */
		fb.drawCircle = function () {
			// Draw a hue circle with a bunch of gradient-stroked beziers.
			// Have to use beziers, as gradient-stroked arcs don't work.
			var n = 24,
				r = fb.radius,
				w = options.wheelWidth,
				nudge = 8 / r / n * Math.PI, // Fudge factor for seams
				m = fb.ctxMask,
				angle1 = 0,
				color1,
				d1;

			var i, angle2, d2, x1, x2, y1, y2, am, tan, xm, ym, color2, corr, grad, r1, r2;

			m.save();
			m.lineWidth = w / r;
			m.scale(r, r);

			// Each segment goes from angle1 to angle2
			for (i = 0; i <= n; ++i) {
				d2 = i / n;
				angle2 = d2 * Math.PI * 2;
				// Endpoints
				x1 = Math.sin(angle1); y1 = -Math.cos(angle1);
				x2 = Math.sin(angle2); y2 = -Math.cos(angle2);
				// Midpoint chosen so that the endpoints are tangent to the circle
				am = (angle1 + angle2) / 2;
				tan = 1 / Math.cos((angle2 - angle1) / 2);
				xm = Math.sin(am) * tan; ym = -Math.cos(am) * tan;
				// New color
				color2 = $.farbtastic.colorUtilities.pack($.farbtastic.colorUtilities.HSLToRGB([d2, 1, 0.5]));

				if (i > 0) {
					if (fb.usingExCanvas) {
						// IE's gradient calculations mess up the colors. Correct along the diagonals
						corr = (1 + Math.min(Math.abs(Math.tan(angle1)), Math.abs(Math.tan(Math.PI / 2 - angle1)))) / n;
						color1 = $.farbtastic.colorUtilities.pack($.farbtastic.colorUtilities.HSLToRGB([d1 - 0.15 * corr, 1, 0.5]));
						color2 = $.farbtastic.colorUtilities.pack($.farbtastic.colorUtilities.HSLToRGB([d2 + 0.15 * corr, 1, 0.5]));
						// Create gradient fill between the endpoints
						grad = m.createLinearGradient(x1, y1, x2, y2);
						grad.addColorStop(0, color1);
						grad.addColorStop(1, color2);
						m.fillStyle = grad;
						// Draw quadratic curve segment as a fill
						r1 = (r + w / 2) / r; r2 = (r - w / 2) / r; // inner/outer radius
						m.beginPath();
						m.moveTo(x1 * r1, y1 * r1);
						m.quadraticCurveTo(xm * r1, ym * r1, x2 * r1, y2 * r1);
						m.lineTo(x2 * r2, y2 * r2);
						m.quadraticCurveTo(xm * r2, ym * r2, x1 * r2, y1 * r2);
						m.fill();
					} else {
						// Create gradient fill between the endpoints
						grad = m.createLinearGradient(x1, y1, x2, y2);
						grad.addColorStop(0, color1);
						grad.addColorStop(1, color2);
						m.strokeStyle = grad;
						// Draw quadratic curve segment
						m.beginPath();
						m.moveTo(x1, y1);
						m.quadraticCurveTo(xm, ym, x2, y2);
						m.stroke();
					}
				}
				// Prevent seams where curves join
				angle1 = angle2 - nudge; color1 = color2; d1 = d2;
			}

			m.restore();
		};

		/**
		 * Draw the saturation/luminance mask.
		 */
		fb.drawMask = function () {
			// Iterate over sat/lum space and calculate appropriate mask pixel values
			var size = fb.square * 2,
				sq = fb.square,
				sz;

			function calculateMask(sizex, sizey, outputPixel) {
				var isx = 1 / sizex, isy = 1 / sizey, x, y, l, s, a, c;

				for (y = 0; y <= sizey; ++y) {
					l = 1 - y * isy;

					for (x = 0; x <= sizex; ++x) {
						s = 1 - x * isx;
						// From sat/lum to alpha and color (grayscale)
						a = 1 - 2 * Math.min(l * s, (1 - l) * s);
						c = (a > 0) ? ((2 * l - 1 + a) * 0.5 / a) : 0;
						outputPixel(x, y, c, a);
					}
				}
			}

			// Method #1: direct pixel access (new Canvas)
			if (fb.ctxMask.getImageData) {
				// Create half-resolution buffer
				sz = Math.floor(size / 2);
				var	buffer = document.createElement("canvas"),
					ctx,
					frame,
					i;
				buffer.width = buffer.height = sz + 1;
				ctx = buffer.getContext("2d");
				frame = ctx.getImageData(0, 0, sz + 1, sz + 1);

				i = 0;
				calculateMask(sz, sz, function (x, y, c, a) {
					frame.data[i++] = frame.data[i++] = frame.data[i++] = c * 255;
					frame.data[i++] = a * 255;
				});

				ctx.putImageData(frame, 0, 0);
				fb.ctxMask.drawImage(buffer, 0, 0, sz + 1, sz + 1, -sq, -sq, sq * 2, sq * 2);
			} else if (!fb.usingExCanvas) { // Method #2: drawing commands (old Canvas)
				// Render directly at half-resolution
				sz = Math.floor(size / 2);
				calculateMask(sz, sz, function (x, y, c, a) {
					c = Math.round(c * 255);
					fb.ctxMask.fillStyle = "rgba(" + c + ", " + c + ", " + c + ", " + a + ")";
					fb.ctxMask.fillRect(x * 2 - sq - 1, y * 2 - sq - 1, 2, 2);
				});
			} else { // Method #3: vertical DXImageTransform gradient strips (IE)
				var cache_last, cache, w = 6, // Each strip is 6 pixels wide.
					sizex = Math.floor(size / w);

				// 6 vertical pieces of gradient per strip
				calculateMask(sizex, 6, function (x, y, c, a) {
					if (x === 0) {
						cache_last = cache;
						cache = [];
					}
					c = Math.round(c * 255);
					a = Math.round(a * 255);
					// We can only start outputting gradients once we have two rows of pixels
					if (y > 0) {
						var c_last = cache_last[x][0],
							a_last = cache_last[x][1],
							color1 = $.farbtastic.colorUtilities.packDX(c_last, a_last),
							color2 = $.farbtastic.colorUtilities.packDX(c, a),
							y1 = Math.round(fb.mid + ((y - 1) * 0.333 - 1) * sq),
							y2 = Math.round(fb.mid + (y * 0.333 - 1) * sq);
						$("<div>").css({
							position: "absolute",
							filter: "progid:DXImageTransform.Microsoft.Gradient(StartColorStr=" + color1 + ", EndColorStr=" + color2 + ", GradientType=0)",
							top: y1,
							height: y2 - y1,
							// Avoid right-edge sticking out.
							left: fb.mid + (x * w - sq - 1),
							width: w - (x === sizex ? Math.round(w / 2) : 0)
						}).appendTo(fb.cnvMask);
					}
					cache.push([c, a]);
				});
			}
		};

		/**
		 * Draw the selection markers.
		 */
		fb.drawMarkers = function () {
			// Determine marker dimensions
			var angle = fb.hsl[0] * 6.28,
				x1 =  Math.sin(angle) * fb.radius,
				y1 = -Math.cos(angle) * fb.radius,
				x2 = 2 * fb.square * (0.5 - fb.hsl[1]),
				y2 = 2 * fb.square * (0.5 - fb.hsl[2]),
				lw = Math.ceil(fb.markerSize / 4),
				r = fb.markerSize - lw + 1,
				c1 = fb.invert ? "#fff" : "#000",
				c2 = fb.invert ? "#000" : "#fff",
				circles = [
					{ x: x1, y: y1, r: r,             c: "#000", lw: lw + 1 },
					{ x: x1, y: y1, r: fb.markerSize, c: "#fff", lw: lw },
					{ x: x2, y: y2, r: r,             c: c2,     lw: lw + 1 },
					{ x: x2, y: y2, r: fb.markerSize, c: c1,     lw: lw }
				],
				i,
				c;

			// Update the overlay canvas
			fb.ctxOverlay.clearRect(-fb.mid, -fb.mid, options.width, options.width);
			for (i = 0; i < circles.length; i += 1) {
				c = circles[i];
				fb.ctxOverlay.lineWidth = c.lw;
				fb.ctxOverlay.strokeStyle = c.c;
				fb.ctxOverlay.beginPath();
				fb.ctxOverlay.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
				fb.ctxOverlay.stroke();
			}
		};

		/**
		 * Update the markers and styles
		 */
		fb.updateDisplay = function () {
			// Determine whether labels/markers should invert
			// :old: fb.invert = fb.hsl[2] <= 0.5;
			fb.invert = (fb.rgb[0] * 0.3 + fb.rgb[1] * 0.59 + fb.rgb[2] * 0.11) <= 0.6;

			// Update the solid background fill
			fb.solidFill.css("backgroundColor", $.farbtastic.colorUtilities.pack($.farbtastic.colorUtilities.HSLToRGB([fb.hsl[0], 1, 0.5])));

			// Draw markers
			fb.drawMarkers();

			// Linked elements or callback
			if (typeof fb.callback === "object") {
				// Set background/foreground color
				$(fb.callback).css({
					backgroundColor: fb.color,
					color: fb.invert ? "#fff" : "#000"
				});

				// Change linked value
				$(fb.callback).each(function () {
					if ((typeof this.value === "string") && this.value !== fb.color) {
						this.value = fb.color;
					}
				});
			} else if (typeof fb.callback === "function") {
				fb.callback.call(fb, fb.color);
			}
		};

		/**
		 * Mousedown handler
		 */
		fb.mousedown = function (event) {
			// Capture mouse
			if (!$.farbtastic.dragging) {
				$(document).bind("mousemove.farbtastic", fb.mousemove).bind("mouseup.farbtastic", $.farbtastic.mouseup);
				$.farbtastic.dragging = true;
			}

			// Update the stored offset for the widget
			fb.offset = element.offset();
//			fb.offset = $(container).offset();

			// Check which area is being dragged
			var pos = $.farbtastic.widgetCoords(fb, event);
			fb.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) > (fb.square + 2);

			// Process
			fb.mousemove(event);
			return false;
		};

		/**
		 * Mousemove handler
		 */
		fb.mousemove = function (event) {
			// Get coordinates relative to color picker center
			var pos = $.farbtastic.widgetCoords(fb, event), hue, sat, lum;

			if (!fb.hsl) {
				return false;
			}

			// Set new HSL parameters
			if (fb.circleDrag) {
				hue = Math.atan2(pos.x, -pos.y) / 6.28;
				$.farbtastic.setHsl(fb, [(hue + 1) % 1, fb.hsl[1], fb.hsl[2]]);
			} else {
				sat = Math.max(0, Math.min(1, -(pos.x / fb.square / 2) + 0.5));
				lum = Math.max(0, Math.min(1, -(pos.y / fb.square / 2) + 0.5));
				$.farbtastic.setHsl(fb, [fb.hsl[0], sat, lum]);
			}

			return false;
		};

		if (debug) {
			var funcsToDebug = ["drawCircle", "drawMask", "initWidget"], i;

			for (i = 0; i < funcsToDebug.length; i += 1) {
				(function () {
					var label = funcsToDebug[i], proxied = fb[label];
					fb[label] = function () {
						var tm = +(new Date()), tm2;
						proxied.apply(this, arguments);
						tm2 = +(new Date());
						$("body").append("<div>" + label + ": " + (tm2 - tm) + "ms</div>");
					};
				})();
			}

			$("body").append("<hr/>");
		}

		fb.init();
	};

	$.farbtastic = {
		dragging: false,

		messages: {
			noObject: "Something goes wrong, check object"
		},

		init: function (object, options) {
			var firstObject = null;

			return object.each(function () {
				// only first object used
				if (firstObject) {
					return;
				}

				firstObject = $(object[0]);

				if (!object.data("farbtastic")) {
					object.data("farbtastic", new $._farbtastic(object, options));
				}
			});
		},

		mouseup: function () {
			// Uncapture mouse
			$(document).unbind(".farbtastic");
			$.farbtastic.dragging = false;
		},

		/**
		 * Change color with HTML syntax #123456
		 */
		setColor: function (fbInstance, color) {
			var unpack = $.farbtastic.colorUtilities.unpack(color, fbInstance.options2.color);

			if (fbInstance.color !== color && unpack) {
				fbInstance.color = color;
				fbInstance.rgb = unpack;
				fbInstance.hsl = $.farbtastic.colorUtilities.RGBToHSL(fbInstance.rgb);
				fbInstance.updateDisplay();
			}

			return this;
		},

		/**
		 * Change color with HSL triplet [0..1, 0..1, 0..1]
		 */
		setHsl: function (fbInstance, hsl) {
			fbInstance.hsl = hsl;
			fbInstance.rgb = $.farbtastic.colorUtilities.HSLToRGB(hsl);
			fbInstance.color = $.farbtastic.colorUtilities.pack(fbInstance.rgb);
			fbInstance.updateDisplay();

			return this;
		},
		
		updateValue: function (fbInstance, linkedTo, event) {
			if (linkedTo.value && linkedTo.value !== fbInstance.color) {
				$.farbtastic.setColor(fbInstance, linkedTo.value);
			}
		},

		/**
		 * Helper for returning coordinates relative to the center
		 */
		widgetCoords: function (fbInstance, event) {
			return {
				x: event.pageX - fbInstance.offset.left - fbInstance.mid,
				y: event.pageY - fbInstance.offset.top - fbInstance.mid
			};
		},

		/**
		 * Link to the given element(s) or callback
		 * 
		 * @private
		 */
		linkTo_: function (fbInstance, callback) {
			// Unbind previous nodes
			if (typeof fbInstance.callback === "object") {
				$(fbInstance.callback).unbind("keyup.farbtastic", function (event) {
					$.farbtastic.updateValue(fbInstance, this, event);
				});
			}

			// Reset color
			fbInstance.color = null;

			// Bind callback or elements
			if (typeof callback === "function") {
				fbInstance.callback = callback;
			} else if (typeof callback === "object" || typeof callback === "string") {
				fbInstance.callback = $(callback);
				fbInstance.callback.bind("keyup.farbtastic", function (event) {
					$.farbtastic.updateValue(fbInstance, this, event);
				});

				if (fbInstance.callback[0].value) {
					$.farbtastic.setColor(fbInstance, fbInstance.callback[0].value);
				} else {
					$.farbtastic.setColor(fbInstance, fbInstance.options2.color);
				}
			} else {
				fbInstance.callback = null;
			}

			return this;
		},

		/**
		 * jQuery layer
		 */
		linkTo: function (object, callback) {
			var firstObject = null;

			return object.each(function () {
				// only first object used
				if (firstObject) {
					return;
				}

				firstObject = $(object[0]);

				if (object.data("farbtastic")) {
					$.farbtastic.linkTo_(object.data("farbtastic"), callback);
				}
			});
		},

		/**
		 * Simulate mouse events for touch devices
		 */
		touchHandle: function (event) {
			var touches = event.originalEvent.changedTouches,
				firstTouch = touches[0],
				type = "",
				simulatedEvent;

			switch (event.type) {
				case "touchstart":
					type = "mousedown";
					break;
				case "touchmove":
					type = "mousemove";
					break;
				case "touchend":
					type = "mouseup";
					break;
				default:
					return false;
			}

			// initMouseEvent(
			//     type, canBubble, cancelable, view, clickCount, 
			//     screenX, screenY, clientX, clientY, ctrlKey, 
			//     altKey, shiftKey, metaKey, button, relatedTarget
			// );
			simulatedEvent = document.createEvent("MouseEvent");
			simulatedEvent.initMouseEvent(
				type, true, true, window, 1, 
				firstTouch.screenX, firstTouch.screenY, 
				firstTouch.clientX, firstTouch.clientY, false, 
				false, false, false, 0 /*left*/, null
			);

			firstTouch.target.dispatchEvent(simulatedEvent);
			event.preventDefault();
		},

		/* Various color utility functions */
		colorUtilities: {
			defaults: {
				color: "#000000"
			},

			dec2hex: function (x) {
				return (x < 16 ? "0" : "") + x.toString(16);
			},

			packDX: function (c, a) {
				return "#" + this.dec2hex(a) + this.dec2hex(c) + this.dec2hex(c) + this.dec2hex(c);
			},

			pack: function (rgb) {
				var r = Math.round(rgb[0] * 255),
					g = Math.round(rgb[1] * 255),
					b = Math.round(rgb[2] * 255);

				return "#" + this.dec2hex(r) + this.dec2hex(g) + this.dec2hex(b);
			},

			unpack: function (color, defaultColor) {
				function longForm(color, i) {
					return parseInt(color.substring(i, i + 2), 16) / 255;
				}

				function shortForm(color, i) {
					return parseInt(color.substring(i, i + 1), 16) / 15;
				}
				
				if (color.length === 7) {
					return [ longForm(color, 1), longForm(color, 3), longForm(color, 5) ];
				} else if (color.length === 4) {
					return [ shortForm(color, 1), shortForm(color, 2), shortForm(color, 3) ];
				}

				if (!defaultColor) {
					defaultColor = this.defaults.color;
				}

				return [ longForm(defaultColor, 1), longForm(defaultColor, 3), longForm(defaultColor, 5) ];
			},

			HSLToRGB: function (hsl) {
				var m1, m2, r, g, b,
					h = hsl[0], s = hsl[1], l = hsl[2];

				m2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
				m1 = l * 2 - m2;
				return [
					this.hueToRGB(m1, m2, h + 0.33333),
					this.hueToRGB(m1, m2, h),
					this.hueToRGB(m1, m2, h - 0.33333)
				];
			},

			hueToRGB: function (m1, m2, h) {
//				h = (h < 0) ? h + 1 : ((h > 1) ? h - 1 : h);
				h = (h + 1) % 1;

				if (h * 6 < 1) {
					return m1 + (m2 - m1) * h * 6;
				}
				if (h * 2 < 1) {
					return m2;
				}
				if (h * 3 < 2) {
					return m1 + (m2 - m1) * (0.66666 - h) * 6;
				}
				return m1;
			},

			RGBToHSL: function (rgb) {
				var r = rgb[0], g = rgb[1], b = rgb[2],
					min = Math.min(r, g, b),
					max = Math.max(r, g, b),
					delta = max - min,
					h = 0,
					s = 0,
					l = (min + max) / 2;

				if (l > 0 && l < 1) {
					s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
				}

				if (delta > 0) {
					if (max === r && max !== g) {
						h += (g - b) / delta;
					}
					if (max === g && max !== b) {
						h += (2 + (b - r) / delta);
					}
					if (max === b && max !== r) {
						h += (4 + (r - g) / delta);
					}
					h /= 6;
				}

				return [h, s, l];
			}
		},

		plugin: {
			exists: function () {
				return false;
			}
		}
	};

	$.fn.farbtastic = function (method) {
		var args = arguments, plugin;

		if ("undefined" !== typeof $.farbtastic[method]) {
			args = Array.prototype.concat.call([args[0]], [this], Array.prototype.slice.call(args, 1));
			return $.farbtastic[method].apply($.farbtastic, Array.prototype.slice.call(args, 1));
		} else if ("object" === typeof method || !method) {
			Array.prototype.unshift.call(args, this);
			return $.farbtastic.init.apply($.farbtastic, args);
		} else if ($.farbtastic.plugin.exists(method)) {
			plugin = $.farbtastic.plugin.parseName(method);
			args = Array.prototype.concat.call([args[0]], [this], Array.prototype.slice.call(args, 1));
			return $.farbtastic[plugin.name][plugin.method].apply($.farbtastic[plugin.name], Array.prototype.slice.call(args, 1));
		} else {
			console.error("Method '" +  method + "' does not exist on jQuery.farbtastic.\nTry to include some extra controls or plugins");
		}
	};
})(jQuery);
