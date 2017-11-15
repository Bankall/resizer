(function(w) {
	/*
	 * @TODO 		 
	 * - add dual side handles
	 */

	function Resizer(options) {
		for(var i in options) {
			if(options.hasOwnProperty(i)) {
				this[i] = options[i];
			}
		}

		this.sides = {};
		this.corners = {};

		if(this.ratio && typeof this.ratio === "string" && this.ratio.match(/\:/)) {
			this.ratio = parseInt(parseFloat(this.ratio.split(":")[0], 10) / parseFloat(this.ratio.split(":")[1], 10) * 100, 10) / 100;
		}

		this.wrapper.className += " resizer";
		this.loadImage();		
	}
	
	Resizer.prototype.getValues = function() {
		
		if(this.values) { return this.values; }
		
		var values = {};
		var p_gbcr = this.wrapper.getBoundingClientRect();
		
		values.width = (p_gbcr.width - (this.sides.left.gbcr("width") + this.sides.right.gbcr("width"))) / p_gbcr.width;
		values.height = (p_gbcr.height - (this.sides.top.gbcr("height") + this.sides.bottom.gbcr("height"))) / p_gbcr.height;
		values.left = this.sides.left.gbcr("width") / p_gbcr.width;
		values.top = this.sides.top.gbcr("height") / p_gbcr.height;
		
		for(var value in values) {
			if(values.hasOwnProperty(value)) {
				values[value] = parseInt(values[value] * 100, 10) / 100;
			}
		}
		
		return values;
	};

	Resizer.prototype.loadImage = function() {
		this.image = document.createElement("img");
		this.image.addEventListener("load", function() {
			this.image.original = {
				width : this.image.width,
				height : this.image.height
			};

			setTimeout(function() {
				this.image.style.position = "relative";
				this.image.style.width = "100%";
				this.image.style.opacity = "1";

				this.bindEvents();
				this.loadResizers();
				this.loadFillers();

				this.adjustInitialValue();
				
				if(typeof this.ready === "function") {
					this.ready();
				}
				
			}.bind(this), 50);
		}.bind(this));

		this.image.src = this.file;
		this.wrapper.appendChild(this.image);
		this.wrapper.addEventListener("drag", function(event) {
			event.preventDefault();	
		});
	};

	Resizer.prototype.bindEvents = function() {
		this.wrapper.addEventListener("mousedown", function(event) {
			this.currentHandle = this.wrapper;
			this.startingPointX = event.clientX;
			this.startingPointY = event.clientY;
		}.bind(this));

		document.addEventListener("mouseup", function() {
			this.currentHandle = null;
		}.bind(this));

		document.addEventListener("mousemove", this.handleSideResize.bind(this));
	};

	Resizer.prototype.refreshSides = function() {
		this.refreshSide(this.sides.top, this.sides.left);
		this.refreshSide(this.sides.bottom, this.sides.left);
		this.refreshSide(this.sides.left, this.sides.top);
		this.refreshSide(this.sides.right, this.sides.top);	
	};

	Resizer.prototype.refreshSide = function(side) {
		var p_gbcr = this.wrapper.getBoundingClientRect();

		if(["top", "bottom"].indexOf(side.className.split(" ")[1]) !== -1) {
			side.style.left = this.sides.left.gbcr("width") + "px";
			side.style.width = (p_gbcr.width - (this.sides.left.gbcr("width") + this.sides.right.gbcr("width"))) + "px";

		} else {
			side.style.top = this.sides.top.gbcr("height") + "px";
			side.style.height = (p_gbcr.height - (this.sides.top.gbcr("height") + this.sides.bottom.gbcr("height"))) + "px";
		}
	};

	Resizer.prototype.refreshCorners = function() {
		for(var corner in this.corners) {
			if(this.corners.hasOwnProperty(corner)) {
				var _corner = this.corners[corner];
				switch(corner) {
					case "topleft":
						_corner.style.width = this.sides.left.gbcr("width") + "px";
						_corner.style.height = this.sides.top.gbcr("height") + "px";
						break;
					case "topright":
						_corner.style.width = this.sides.right.gbcr("width") + "px";
						_corner.style.height = this.sides.top.gbcr("height") + "px";
						break;
					case "bottomright":
						_corner.style.width = this.sides.right.gbcr("width") + "px";
						_corner.style.height = this.sides.bottom.gbcr("height") + "px";
						break;
					case "bottomleft":
						_corner.style.width = this.sides.left.gbcr("width") + "px";
						_corner.style.height = this.sides.bottom.gbcr("height") + "px";
						break;								
				}
			}
		}
	};

	Resizer.prototype.handleSideResize = function(event, value) {
		if(this.currentHandle) {
			if(event.preventDefault) {
				event.preventDefault();
			}

			if(this.currentHandle === this.wrapper) {
				var offsetX = event.clientX - this.startingPointX,
					offsetY = event.clientY - this.startingPointY;

				if(this.sides.top.gbcr("height") + offsetY < 0) {
					offsetY = 0 - this.sides.top.gbcr("height");
				} else if(this.sides.bottom.gbcr("height") - offsetY < 0) {
					offsetY = (0 - this.sides.bottom.gbcr("height")) * -1;
				}

				if(this.sides.left.gbcr("width") + offsetX < 0) {
					offsetX = 0 - this.sides.left.gbcr("width");
				} else if(this.sides.right.gbcr("width") - offsetX < 0) {
					offsetX = (0 - this.sides.right.gbcr("width")) * -1;
				}

				this.sides.top.style.height = this.sides.top.gbcr("height") + offsetY + "px";
				this.sides.bottom.style.height = this.sides.bottom.gbcr("height") - offsetY + "px";

				this.sides.left.style.width = this.sides.left.gbcr("width") + offsetX + "px";
				this.sides.right.style.width = this.sides.right.gbcr("width") - offsetX + "px";

				this.startingPointX = event.clientX;
				this.startingPointY = event.clientY;

				this.refreshSides();
				this.refreshCorners();
			} else {					
				var side = this.currentHandle.parentNode,
					topbottom = ["top", "bottom"].indexOf(side.className.split(" ")[1]) !== -1,
					p_gbcr = this.wrapper.getBoundingClientRect();
				
				value = event ? side.className.match(/left|right/) ? event.clientX : event.clientY : value;

				var newValue;
				if(side.className.match(/top/)) {
					newValue = value - p_gbcr.top;							
				} else if(side.className.match(/right/)) {
					newValue = p_gbcr.left + p_gbcr.width - value;							
				} else if(side.className.match(/bottom/)) {
					newValue = p_gbcr.top + p_gbcr.height - value;							
				} else if(side.className.match(/left/)) {
					newValue = value - p_gbcr.left;							
				}

				if(newValue < 0) { newValue = 0; }
				else {					
					var otherside;
					if(topbottom) {								
						otherside = this.sides.top === side ? this.sides.bottom : this.sides.top;

						if(p_gbcr.height - (otherside.gbcr("height") + newValue) <= 10) {
							newValue = p_gbcr.height - otherside.gbcr("height") - 10;
						}
					} else {
						otherside = this.sides.left === side ? this.sides.right : this.sides.left;

						if(p_gbcr.width - (otherside.gbcr("width") + newValue) <= 10) {
							newValue = p_gbcr.width - otherside.gbcr("width") - 10;
						}
					}
				} 

				if(this.ratio) {
					if(topbottom) {
						var frameHeight = p_gbcr.height - ((side === this.sides.top ? this.sides.bottom.gbcr("height") : this.sides.top.gbcr("height")) + newValue),
							newLeftRightWidth = p_gbcr.width - (frameHeight * this.ratio),
							offsetLeft, offsetRight;

						offsetLeft = offsetRight = (newLeftRightWidth - (this.sides.left.gbcr("width") + this.sides.right.gbcr("width"))) / 2;

						if(newValue < side.gbcr("height")) {
							var canExpandLeft = this.sides.left.gbcr("width") > 0,
								canExpandRight = this.sides.right.gbcr("width") > 0;

							if(!canExpandLeft && !canExpandRight) {
								return;
							} else if(!canExpandLeft) {
								offsetRight += offsetLeft;
								offsetLeft = 0;
							} else if(!canExpandRight) {
								offsetLeft += offsetRight;
								offsetRight = 0;
							}									
						} 

						if(this.sides.left.gbcr("width") + offsetLeft >= 0) {
							this.sides.left.style.width = this.sides.left.gbcr("width") + offsetLeft + "px";
						} else {
							this.sides.left.style.width = "0px";
						}

						if(this.sides.right.gbcr("width") + offsetRight >= 0) {
							this.sides.right.style.width = this.sides.right.gbcr("width") + offsetRight + "px";									
						} else {
							this.sides.right.style.width = "0px";
						}

						// to make sure ratio are always respected even if we capped other top / bottom height to 0 we recalculate newValue
						newValue = (p_gbcr.height - (side === this.sides.top ? this.sides.bottom.gbcr("height") : this.sides.top.gbcr("height"))) - 
								   ((p_gbcr.width - (this.sides.left.gbcr("width") + this.sides.right.gbcr("width"))) / this.ratio);

					} else {
						var frameWidth = p_gbcr.width - ((side === this.sides.left ? this.sides.right.gbcr("width") : this.sides.left.gbcr("width")) + newValue),
							newTopBottomHeight = p_gbcr.height - (frameWidth / this.ratio),
							offsetTop, offsetBottom;

						offsetTop = offsetBottom = (newTopBottomHeight - (this.sides.top.gbcr("height") + this.sides.bottom.gbcr("height"))) / 2;

						if(newValue < side.gbcr("width")) {
							var canExpandTop = this.sides.top.gbcr("height") > 0,
								canExpandBottom = this.sides.bottom.gbcr("height") > 0;

							if(!canExpandTop && !canExpandBottom) {
								return;
							} else if(!canExpandTop) {
								offsetBottom += offsetTop;
								offsetTop = 0;
							} else if(!canExpandBottom) {
								offsetTop += offsetBottom;
								offsetBottom = 0;
							}									
						} 

						if(this.sides.top.gbcr("height") + offsetTop >= 0) {
							this.sides.top.style.height = this.sides.top.gbcr("height") + offsetTop + "px";
						} else {
							this.sides.top.style.height = "0px";
						}

						if(this.sides.bottom.gbcr("height") + offsetBottom >= 0) {
							this.sides.bottom.style.height = this.sides.bottom.gbcr("height") + offsetBottom + "px";									
						} else {
							this.sides.bottom.style.height = "0px";
						}

						// to make sure ratio are always respected even if we capped other top / bottom height to 0 we recalculate newValue
						newValue = (p_gbcr.width - (side === this.sides.left ? this.sides.right.gbcr("width") : this.sides.left.gbcr("width"))) - 
								   ((p_gbcr.height - (this.sides.top.gbcr("height") + this.sides.bottom.gbcr("height"))) * this.ratio);
					}

					this.refreshSides();
					this.refreshCorners();
				}

				if(topbottom) {							
					side.style.height = newValue + "px";

					this.refreshSide(this.sides.left, side);
					this.refreshSide(this.sides.right, side);
				} else {							
					side.style.width = newValue + "px";

					this.refreshSide(this.sides.top, side);
					this.refreshSide(this.sides.bottom, side);
				}

				this.refreshCorners();				
			}
			
			clearTimeout(this.triggerChangeTimeout);
			this.triggerChangeTimeout = setTimeout(function() {
				this.values = null;
				
				if(typeof this.onchange === "function") {
					this.onchange();
				}
			}.bind(this), 100);
		}								
	};

	Resizer.prototype.loadResizers = function() {

		var shortcutGetBoundingClientRect = function(side) {
			side.gbcr = function(prop) {
				var x = side.getBoundingClientRect();
				for(var y in x) {
					if(x.hasOwnProperty(y)) {
						x[y] = Math.round(x[y]);
					}
				}
				
				return prop ? x[prop] : x;
			};
		};

		var sides = ["top", "right", "bottom", "left"];
		for(var i = 0; i < sides.length; i ++) {

			var side = document.createElement("div");
			var background = document.createElement("div");
			var handle = document.createElement("div");

			side.className = "side-holder " + sides[i];
			background.className = "background";
			handle.className = "handle";

			side.appendChild(background);
			side.appendChild(handle);

			this.wrapper.appendChild(side);

			handle.addEventListener("mousedown", function(event) {
				event.stopPropagation();
				this.currentHandle = event.currentTarget;
			}.bind(this));

			this.sides[sides[i]] = side;
			shortcutGetBoundingClientRect(side);
		}
	};

	Resizer.prototype.loadFillers = function() {
		var corners = ["topleft", "topright", "bottomright", "bottomleft"];				
		for(var i = 0; i < corners.length; i ++) {

			var corner = document.createElement("div");
			corner.className = "corner " + corners[i];

			this.wrapper.appendChild(corner);

			this.corners[corners[i]] = corner;
		}
	};

	Resizer.prototype.adjustInitialValue = function() {
		var p_gbcr = this.wrapper.getBoundingClientRect();
		
		if(this.values) {
			this.sides.top.style.height = this.values.top * p_gbcr.height + "px";
			this.sides.bottom.style.height = (1 - (this.values.top + this.values.height)) * p_gbcr.height + "px";
			this.sides.left.style.width = this.values.left * p_gbcr.width + "px";
			this.sides.right.style.width = (1 - (this.values.left + this.values.width)) * p_gbcr.width + "px";
			
		} else {
			var localRatio = this.ratio || 16/9, 
				imageRatio = parseInt(this.image.original.width / this.image.original.height * 100, 10) / 100;

			if(imageRatio === localRatio) {
				
				this.sides.top.style.height = "0px";
				this.sides.bottom.style.height = "0px";

				this.sides.left.style.width = "0px";
				this.sides.right.style.width = "0px";

			} else if(imageRatio > localRatio) {
				this.sides.top.style.height = "0px";
				this.sides.bottom.style.height = "0px";

				var leftRightWidth = (p_gbcr.width - (p_gbcr.height * localRatio)) / 2;

				this.sides.left.style.width = leftRightWidth + "px";
				this.sides.right.style.width = leftRightWidth + "px";
			} else {
				this.sides.left.style.width = "0px";
				this.sides.right.style.width = "0px";

				var topBottomHeight = parseInt((p_gbcr.height - (p_gbcr.width / localRatio)) / 2, 10);

				this.sides.top.style.height = topBottomHeight + "px";
				this.sides.bottom.style.height = topBottomHeight + "px";

			}
		}

		this.refreshSides();
		this.refreshCorners();
	};

	w.Resizer = Resizer;
})(window);