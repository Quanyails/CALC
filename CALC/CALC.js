// Created with raw JavaScript.
// Libraries would make the code cleaner, but this project is supposed to be small.

// Anonymous wrapper.
(function(){

var maxFileSize = 200000; // bytes
var minDimension = 320;
var maxDimension = 640;
var allowedMIMETypes = ["image/png", "image/jpeg", "image/gif"];

// Global variables for future use.
var fileSize = 0;
var fileType = "";

// Generate DOM elements.
// I know I can use HTML/libraries to make this more attractive. :U

var header = document.createElement("h3");
	document.body.appendChild(header);
	header.innerHTML = "CAP Art Legality Checker (CALC)";

var foreword = document.createElement("p");
	document.body.appendChild(foreword);
	foreword.innerHTML = "Hello! This script will check for some of the requirements an image needs for a legal submission:"


var checkList = document.createElement("ul");
	document.body.appendChild(checkList);

var fs = document.createElement("li");
	checkList.appendChild(fs);
	fs.innerHTML = "File size";
var ft = document.createElement("li");
	checkList.appendChild(ft);
	ft.innerHTML = "File type";
var ds = document.createElement("li");
	checkList.appendChild(ds);
	ds.innerHTML = "Image dimensions";
var bg = document.createElement("li");
	checkList.appendChild(bg);
	bg.innerHTML = "Background";
var cl = document.createElement("li");
	checkList.appendChild(cl);
	cl.innerHTML = "Clipping";
// TODO: Is it feasible to check blending and colored outlines (edge detection)?

var fileInput = document.createElement("input");
	document.body.appendChild(fileInput);
	fileInput.setAttribute("type", "file");
	fileInput.setAttribute("accept", "image/*");
	fileInput.addEventListener("change",
		function(e)
		{
			var fileList = e.target.files;
			readFiles(fileList);
		});

var readFiles = function(fileList)
{
	if (fileList.length > 0)
	{
		var file = fileList[0]; // Read only one file
		fileSize = file.size; // Update global variable
		fileType = file.type; // Update global variable

		// The reader is created a few lines below.
		// It implicitly calls onloadstart and onload.
		reader.readAsDataURL(fileList[0]);
	}
}

// Create the reader and synchronize function calls.
var reader = new FileReader();
	reader.onloadstart = function()
	{
		loadingMessage.innerHTML = "Loading... If this does not load after a few seconds, try uploading again.";
	}
	reader.onload = function()
	{
		// The result parameter is a binary string encoding the image source.
		// loadImage is defined below.
		loadImage(reader.result);
		loadingMessage.innerHTML = "Loaded!";
	}

// Create an image element, but don't actually show it.
// We're going to be using a canvas instead in order to sample pixels.
var img = document.createElement("img");
// 	document.body.appendChild(img);

// Create the canvas and prepare it for dragging-and-dropping.
var canvas = document.createElement("canvas");
	document.body.appendChild(canvas);
	// canvas.width = 0;
	// canvas.height = 0;
	canvas.style.display = "block";
	canvas.style.border = "1px solid #000000";
	canvas.style.backgroundColor = "#FFFFFF"; // This changes when we're dragging.
var canvas2d = canvas.getContext("2d");
	canvas2d.font = "30px serif";
	canvas2d.textAlign = "center";
	canvas2d.fillText("Drag-and-drop!", canvas.width / 2, canvas.height / 2);

	canvas.addEventListener("dragenter", function(e)
		{
			// Prevent default needed?
			canvas.style.backgroundColor = "#EEEEEE";
		})
	canvas.addEventListener("dragover", function(e)
		{
			e.preventDefault(); // Prevent browser redirecting.
		});
	canvas.addEventListener("dragleave", function(e)
		{
			// Prevent default needed?
			canvas.style.backgroundColor = "#FFFFFF";
		});
	canvas.addEventListener("drop", function(e) // ondrop
		{
			e.preventDefault(); // Prevent browser redirecting.
			canvas.style.backgroundColor = "#FFFFFF";
			
			var data = e.dataTransfer;
			var fileList = data.files;
			readFiles(fileList);
			
			// var uri = e.dataTransfer.getData("text/uri-list");
			// var url = e.dataTransfer.getData("text/plain");
			var url = data.getData("url");
			// We cannot call loadImage(url) and canvas.toDataURL() across domains.
			if (url !== "")
			{
				loadingMessage.innerHTML = "Due to security issues, this script cannot accept cross-domain images. :("
			}
		});

// Create the output DOM elements.
var textContainer = document.createElement("p");
	document.body.appendChild(textContainer);
var loadingMessage = document.createElement("p");
	textContainer.appendChild(loadingMessage);
var outputList = document.createElement("ul");
	textContainer.appendChild(outputList);

// Functions to synchronize loading.
var loadImage = function(src)
	{
		img.setAttribute("src", src);
	}
img.onload = function()
	{
		loadCanvas();
	};

var loadCanvas = function()
	{
		// Update the canvas's dimensions.
		canvas.width = img.width;
		canvas.height = img.height;
		canvas2d.drawImage(img, 0, 0);
		evaluate();
	}

// Main function: check the image.
var evaluate = function()
{
	var width = img.width;
	var height = img.height;

	// Returns true if file is in size limits, false if not.
	var fileSizeCheck = function()
	{
		return (fileSize <= maxFileSize);
	}
	// Returns true if file is one of the permitted file types, false if not.
	// This function does not currently detect whether a GIF is animated.
	var fileTypeCheck = function()
	{
		return allowedMIMETypes.some(function(str){return (str === fileType);});
	}

	// Returns true if both dimensions are in the ranges, false if at least one
	// of them is not.
	var dimensionsCheck = function()
	{
		var widthInRange = minDimension <= width && width <= maxDimension;
		var heightInRange = minDimension <= height && height <= maxDimension;
		return widthInRange && heightInRange;
	}

	// TestFunction must take in an array of four numbers and returns a bool.
	// Threshold represents the minimum percentage of pixels that must pass the
	// test for the entire test to be considered 'passing'/'true'.
	var testCanvasSelection = function(x0, y0, x1, y1, pixelTester, threshold)
	{

		var pixelsToArray = function(imageData)
		{
			var pixelArray = imageData.data;
			var pixelArrayLength = pixelArray.length;
			var pixelLength = pixelArrayLength >> 2; // >> 2 to avoid floats?
			// = imageData.width * imageData.height;
			var arr = new Array(pixelLength);
			for (var i = 0; i < pixelLength; i++)
			{arr[i] = new Array(4);} // 4 elements for RGBA values

			/*
			// IE doesn't support forEach. Go figure. D:
			pixelArray.forEach(function(d, i)
			{
				var index = i >> 2;
				var channel = i % 4;
				arr[index][channel] = d;
			})
			*/
			for (var i = 0; i < pixelArrayLength; i++)
			{
				var index = i >> 2;
				var channel = i % 4;
				arr[index][channel] = pixelArray[i];
			}
			return arr;
		}

		var selection = canvas2d.getImageData(x0, y0, x1, y1);
		var pixels = pixelsToArray(selection);
		var passedPixels = pixels.filter(pixelTester);

		return (passedPixels.length / pixels.length >= threshold);
	}

	// Check border pixels for white/transparency.
	// Returns true if the background is suitable, false if not.
	var backgroundCheck = function()
	{
		// TODO: More precise thresholds?
		var threshold = 0.8;
		// Minimum channel value needed for a color to be considered 'white'.
		var limit = 240;

		var isBackground = function(pixel)
		{
			var r = pixel[0];
			var g = pixel[1];
			var b = pixel[2];
			var a = pixel[3];

			var isWhite = (r - limit > 0) && (g - limit > 0) && (b - limit > 0);
			var isTransparent = (a !== 255);

			return isWhite && !isTransparent;
		}

		var left = testCanvasSelection(0, 0, 1, height, isBackground, threshold);
		var right = testCanvasSelection(width - 1, 0, 1, height, isBackground, threshold);
		var top = testCanvasSelection(0, 0, width, 1, isBackground, threshold);
		var bottom = testCanvasSelection(0, height - 1, width, 1, isBackground, threshold);
		
		return left && right && top && bottom;
	}

	var clipCheck = function()
	{
		// TODO: More precise thresholds?
		var threshold = 0.95;
		// Minimum channel value needed for a color to be considered 'white'.
		var limit = 240;

		var doesNotClip = function(pixel)
		{
			var r = pixel[0];
			var g = pixel[1];
			var b = pixel[2];
			var a = pixel[3];

			var noClip = (r - limit > 0) && (g - limit > 0) && (b - limit > 0);

			return noClip;
		}

		var left = testCanvasSelection(0, 0, 1, height, doesNotClip, threshold);
		var right = testCanvasSelection(width - 1, 0, 1, height, doesNotClip, threshold);
		var top = testCanvasSelection(0, 0, width, 1, doesNotClip, threshold);
		var bottom = testCanvasSelection(0, height - 1, width, 1, doesNotClip, threshold);

		return left && right && top && bottom;
	}

	// Run each check and save the results.
	var fsResult = fileSizeCheck();
	var ftResult = fileTypeCheck();
	var dResult = dimensionsCheck();
	var bResult = backgroundCheck();
	var cResult = clipCheck();

	// Evaluate result of each check and adds its corresponding issue, if any.
	var issues = [];
	if (!fsResult)
	{
		issues.push("The image exceeds the limit of " + maxFileSize + " bytes.");
	}
	if (!ftResult)
	{
		issues.push("The image is not in one of these file formats: " + allowedMIMETypes.join(", "));
	}
	if (!dResult)
	{
		issues.push("The image is not between " + minDimension + " and " + maxDimension + " pixels in dimension.");
	}
	if (!bResult)
	{
		issues.push("The background is not solid, non-transparent white.");
	}
	if (!cResult)
	{
		issues.push("The image clips off the image's canvas (may be caused by background issues).");
	}

	// If we had no issues, report that there are no issues.
	if (issues.length === 0)
	{
		issues.push("There are no technical issues detected with the image!");
	}

	report(issues);
}

var report = function(iarr)
{
	// Clear existing list of issues.
	var c = outputList.firstChild;
	while (c != null)
	{
		outputList.removeChild(c);
		c = outputList.firstChild;
	}

	// List the new issues in an HTML list.
	/*
	// IE doesn't support forEach. Go figure. D:
	iarr.forEach(function(str)
		{
			var li = document.createElement("li");
				outputList.appendChild(li);
				li.innerHTML = str;
		});
	*/
	var l = iarr.length;
	for (var i = 0; i < l; i++)
	{
		var li = document.createElement("li");
			outputList.appendChild(li);
			li.innerHTML = iarr[i];
	}
}

})()