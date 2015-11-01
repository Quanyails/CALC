// http://www.xul.fr/en/html5/filereader.php
// http://stackoverflow.com/questions/22087076/how-to-make-a-simple-image-upload-using-javascript-html
// http://stackoverflow.com/questions/8751020/how-to-get-a-pixels-x-y-coordinate-color-from-an-image
// http://stackoverflow.com/questions/24148154/image-load-on-end-event
// http://stackoverflow.com/questions/17714742/looping-through-pixels-in-an-image
// http://davidwalsh.name/detect-gif-animated
// imageElement.naturalHeight
// imageElement.naturalWidth

// Created with raw JavaScript.
// Libraries would make the code cleaner, but this project is supposed to be small.

// Anonymous wrapper.
(function(){

var maxFileSize = 200000; // bytes
var minDimension = 320;
var maxDimension = 640;

// Global variables for future use.
var fileSize = 0;
var filetype = "";

// Generate DOM elements. I know I can use HTML to make this more attractive.

var header = document.createElement("h3");
	header.innerHTML = "Quanyails's CAP Art Legality Checker (CALC)";
	document.body.appendChild(header);

var foreword = document.createElement("p");
	foreword.innerHTML = "Hello! This script will check for some of the requirements an image needs for a legal submission:"
	document.body.appendChild(foreword);

var checkList = document.createElement("ul");
	document.body.appendChild(checkList);

var fs = document.createElement("li");
	fs.innerHTML = "File Size";
	checkList.appendChild(fs);
var ft = document.createElement("li");
	ft.innerHTML = "File Type";
	checkList.appendChild(ft);
var ds = document.createElement("li");
	ds.innerHTML = "Image dimensions";
	checkList.appendChild(ds);
var bg = document.createElement("li");
	bg.innerHTML = "Background";
	checkList.appendChild(bg);
var cl = document.createElement("li");
	cl.innerHTML = "Clipping";
	checkList.appendChild(cl);
// TODO: Is it feasible to check blending and colored outlines?

var fileInput = document.createElement("input");
	fileInput.setAttribute("type", "file");
	fileInput.setAttribute("accept", "image/*");
	document.body.appendChild(fileInput);
	fileInput.addEventListener("change",
		function(e)
		{
			var fileList = e.target.files;
			var file = fileList[0]; // Read only one file
			fileSize = file.size; // Update global variable
			fileType = file.type; // Update global variable
			
			// The reader is created a few lines below.
			reader.readAsDataURL(fileList[0]); // Implicitly calls onload
		});

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

// Create an element, but don't actually show it.
// We're going to be using a canvas instead in order to sample pixels.
var img = document.createElement("img");
// 	document.body.appendChild(img);
// Create the canvas:
var canvas = document.createElement("canvas");
	canvas.style.display = "block";
	document.body.appendChild(canvas);

var textContainer = document.createElement("p");
	document.body.appendChild(textContainer);
var loadingMessage = document.createElement("p");
	textContainer.appendChild(loadingMessage);
var outputList = document.createElement("ul");
	textContainer.appendChild(outputList);


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
		// Update the image/canvas.
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.getContext("2d").drawImage(img, 0, 0);
		
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
    // Returns true if the file is a PNG, JPEG, or GIF, false if not.
    // This function does not currently detect whether a GIF is animated.
	var fileTypeCheck = function()
    {
		var isPNG = fileType === "image/png";
		var isJPEG = fileType === "image/jpeg";
		var isGIF = fileType === "image/gif";
        return (isPNG || isJPEG || isGIF);
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
    var testCanvasSelection = function(x, y, w, h, pixelTester, threshold)
    {
        var selection = canvas.getContext("2d")
        	.getImageData(0, 0, w, h);

        var pixelsToArray = function(imageData)
        {
            var pixelArray = imageData.data;
            var pixelLength = pixelArray.length >> 2; // >> 2 to avoid floats?
            var arr = new Array(pixelLength);
            for (var i = 0; i < pixelLength; i++)
            {arr[i] = new Array(4);} // 4 elements for RGBA values

            pixelArray.forEach(function(d, i)
                               {
                var index = i >> 2;
                var channel = i % 4;
                arr[index][channel] = d;
            })
            return arr;
        }
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
        issues.push("The image uploaded exceeds the limit of " + maxFileSize + " bytes.");
    }
    if (!ftResult)
    {
        issues.push("The file is not of the JPEG, PNG, or GIF image types.");
    }
    if (!dResult)
    {
        issues.push("The image is not between " + minDimension + " and " + maxDimension + " in dimension.");
    }
    if (!bResult)
    {
        issues.push("The background is not solid, non-transparent white.");
    }
	if (!cResult)
    {
        issues.push("The image clips off the image's canvas.");
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
    iarr.forEach(function(str)
		{
        	var li = document.createElement("li");
				li.innerHTML = str;
				outputList.appendChild(li);
    	});
}

})()