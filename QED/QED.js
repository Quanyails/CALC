// Created mostly with raw JavaScript,
// sans the JSZip and FileSaver libraries.

// Potential future additions:
// Add an HTML checkbox element to toggle sorting files.
// Accept .zip files as inputs, unzip them, and batch process its images.

// Anonymous wrapper.
(function(){

// Global variables for future use.
var filesList; // file list
var filesIndex; // index
var zipper; // JSZip

// Check for JavaScript libraries:
if (JSZip == null)
	{throw("JSZip library not found.");}
if (saveAs == null)
	{throw("FileSaver library not found.");}

// Generate DOM elements.
var articleContainer = document.createElement("p");
	document.body.appendChild(articleContainer);
var header = document.createElement("h3");
	articleContainer.appendChild(header);
	header.textContent = "Edge Detection Widget";
var foreword = document.createElement("p");
	articleContainer.appendChild(foreword);
	foreword.textContent = "Hello! This is a simple script for edge detection processing."
		+ " The script will return a zipped package containing one PNG image for each supported image file uploaded."
		+ " Please be careful about the size of files uploaded."
		+ " JavaScript is not an optimal language for image processing,"
		+ " so operations can be slow and stall your browser.";

// Generate image processing input elements.
var inputContainer = document.createElement("p");
	document.body.appendChild(inputContainer);
var method = document.createElement("a");
	inputContainer.appendChild(method);
	method.textContent = "Method: ";
// Selection drop-down for the various edge detection algorithms.
var algorithmSelector = document.createElement("select");
	inputContainer.appendChild(algorithmSelector);
	algorithmSelector.onchange = function()
	{
		// Get the algorithm selected.
		var algorithmIndex = algorithmSelector.selectedIndex;
		var algorithmOption = algorithmSelector.options[algorithmIndex];
		var algorithmName = algorithmOption.value;
		// Set up the page for the selected algorithm.
		algorithms[algorithmName]["set"]();

		// readFiles is defined below.
		readFiles();
	};
	// We'll fill this selection box with algorithms.
	// For code cleanliness, the algorithms are listed
	// in a separate section at the bottom of the file.
var fileInput = document.createElement("input");
	inputContainer.appendChild(fileInput);
	fileInput.type = "file";
	fileInput.accept = "image/*";
	fileInput.multiple = "";
	fileInput.onchange = function(e)
		{
			// Set global filesList
			filesList = e.target.files;
			readFiles();
		};
// additionalInput is a container for any additional
// inputs the user needs for a specific method.
var additionalInput = document.createElement("p");
	inputContainer.appendChild(additionalInput);


// Create the reader and synchronize function calls.
var reader = new FileReader();
	reader.onloadstart = function()
	{
		loadingMessage.textContent = "Loading.... If this does not load after a few seconds, try uploading again.";
	};
	reader.onload = function()
	{
		// The result parameter is a binary string encoding the image source.
		// loadImage is defined below.
		loadImage(reader.result);
		loadingMessage.textContent = "Loaded!";
	};

// Read/write operations:

var readFiles = function()
{
	// Reset global variables:
	filesIndex = -1; // We do a ++ in readNextFile to get it to 0.
	zipper = new JSZip();

	// Initiate the read-process-write loop.
	readNextFile();
}

// Iterative function. Called as callback for FileReader.
var readNextFile = function()
{
	filesIndex++;
	if (0 <= filesIndex && filesIndex < filesList.length)
	{
		var file = filesList[filesIndex];
		// The reader is created a few lines below.
		// It implicitly calls onloadstart and onload.
		reader.readAsDataURL(file);
	}
	else if (filesIndex === filesList.length)
	{
		// downloadButton is an HTML element defined below.
		// The user is allowed to click the download button
		// only after the files have finished processing.
		downloadButton.disabled = false;
		
		// I found the automatic saveAs prompt a tad annoying.
		/* This line should be enabled for debugging. */
		// finishFiles();
	}
}

// Write proccessed image to zipped file.
// Data is given as a base 64 data URI after canvas.toDataURL is called.
var writeFile = function(data)
{
	// Remove leading "data:image/png;base64," string, if it exists.
	data = data.replace(/^(data:image\/png;base64,)/, "");
	var fileName = "QED_" + filesList[filesIndex].name;
	// Add the data to the zipped package.
	zipper.file(fileName, data, {base64: true}); // base64 encoding
}

// Present the processed images in a zipped package.
var finishFiles = function()
{
	downloadButton.disabled = false;
	var blob = zipper.generate({type: "blob"});
	// saveAs is from the FileSaver library.
	saveAs(blob, "QED.zip");
}

// Create the graphical DOM elements.

// Create an image element, but don't actually show it.
// We're going to be using a canvas instead in order to sample pixels.
var img = document.createElement("img");
// 	document.body.appendChild(img);

// Create the input ('read') canvas.
var canvasIn = document.createElement("canvas");
	document.body.appendChild(canvasIn);
	// canvasIn.width = 0;
	// canvasIn.height = 0;
	canvasIn.style.display = "block";
	canvasIn.style.border = "1px solid #000000";
	canvasIn.style.backgroundColor = "#FFFFFF"; // This changes when we're dragging.
var canvas2dIn = canvasIn.getContext("2d");
	canvas2dIn.font = "30px serif";
	canvas2dIn.textAlign = "center"; // Horizontal centering
	canvas2dIn.textBaseline = "middle"; // Vertical centering
	canvas2dIn.fillText("Drag-and-drop!", canvasIn.width / 2, canvasIn.height / 2);
	// Prepare input canvas for dragging-and-dropping.
	canvasIn.ondragenter = function(e)
		{
			// Prevent default needed?
			canvasIn.style.backgroundColor = "#EEEEEE";
		};
	canvasIn.ondragover = function(e)
		{
			e.preventDefault(); // Prevent browser redirecting.
		};
	canvasIn.ondragleave = function(e)
		{
			// Prevent default needed?
			canvasIn.style.backgroundColor = "#FFFFFF";
		};
	canvasIn.ondrop = function(e)
		{
			e.preventDefault(); // Prevent browser redirecting.
			canvasIn.style.backgroundColor = "#FFFFFF";
			
			// Set global filesList
			var data = e.dataTransfer;
			filesList = data.files;
			readFiles();
			
			// var uri = e.dataTransfer.getData("text/uri-list");
			// var url = e.dataTransfer.getData("text/plain");
			var url = data.getData("url");
			// We cannot call loadImage(url) and canvas.toDataURL() across domains.
			if (url !== "")
			{
				loadingMessage.textContent = "Due to security issues, this script cannot accept cross-domain images. :(";
			}
		};

// Create the output ('write') canvas.
var canvasOut = document.createElement("canvas");
	document.body.appendChild(canvasOut);
	// canvasOut.width = 0;
	// canvasOut.height = 0;
	canvasOut.style.display = "block";
	canvasOut.style.border = "1px solid #000000";
	canvasOut.style.backgroundColor = "#FFFFFF";
var canvas2dOut = canvasOut.getContext("2d");
	canvas2dOut.font = "30px serif";
	canvas2dOut.textAlign = "center"; // Horizontal centering
	canvas2dOut.textBaseline = "middle"; // Vertical centering
	canvas2dOut.fillText("Edges displayed here!", canvasOut.width / 2, canvasOut.height / 2);

// Create the output DOM elements.
var textContainer = document.createElement("p");
	document.body.appendChild(textContainer);
var loadingMessage = document.createElement("p");
	textContainer.appendChild(loadingMessage);
var downloadButton = document.createElement("button");
	textContainer.appendChild(downloadButton);
	downloadButton.textContent = "Download";
	// This element should only be clickable after finishFiles had been called.
	downloadButton.disabled = true;
	downloadButton.onclick = finishFiles;

// Process images in callbacks.

// Functions to synchronize loading.
var loadImage = function(src){img.src = src;};
img.onload = function()
	{
		// Update/reset the input canvas's dimensions.
		// Setting the width/height should clear the canvas.
		canvasIn.width = img.width;
		canvasIn.height = img.height;
		canvas2dIn.drawImage(img, 0, 0);

		// Update/reset the output canvas's dimensions.
		// Setting the width/height should clear the canvas.
		canvasOut.width = img.width;
		canvasOut.height = img.height;

		// Perform image processing.
		processImage();
	}

// Main function: check the image.
var processImage = function()
{
	// Get the algorithm selected.
	var algorithmIndex = algorithmSelector.selectedIndex;
	var algorithmOption = algorithmSelector.options[algorithmIndex];
	var algorithmName = algorithmOption.value;

	// Run the selected algorithm.
	algorithms[algorithmName]["algorithm"](canvasIn, canvasOut);

	// Set global output data and continue/finish image processing.
	var dataURI = canvasOut.toDataURL("image/png");
	writeFile(dataURI);
	readNextFile();
}



/*********************** Edge detection filter section ***********************/

// ImageData is the output from canvas.getImageData(x, y, w, h);
// I guess this is an implicit constructor for a pixel2DArray object.
var pixelsTo2DArray = function(imageData)
{
	var w = imageData.width;
	var h = imageData.height;
	var pixelArray = imageData.data;

	var pixel2DArray = new Array(w);
	for (var x = 0; x < w; x++)
	{
		var row = new Array(h);
		for (var y = 0; y < h; y++)
		{
			var col = new Array(4); // 4 elements for RGBA values
			var index = 4 * (y * w + x);
			col[0] = pixelArray[index];
			col[1] = pixelArray[index + 1];
			col[2] = pixelArray[index + 2];
			col[3] = pixelArray[index + 3];

			row[y] = col;
		}
		pixel2DArray[x] = row;
	}

	pixel2DArray.width = imageData.width;
	pixel2DArray.height = imageData.height;

	// Safe array access.
	// Null is better than undefined for math operators.
	pixel2DArray.get = function(x, y)
	{
		var row = pixel2DArray[x];
		if (row == null) {return null;}
		var col = row[y];
		if (col == null) {return null;}
		return col;
	}

	return pixel2DArray;
}

// Curried function.
// Returns a function that takes in parameters (x, y), which
// returns the convoluted pixel from the input pixel2DArray.
// Depending on the operation, 
// we may want to just perform RGB convolution,
// or we might want to convolute the alpha channel in addition.
// Hence the optional 'alpha' parameter.
var convolute = function(pixel2DArray, mask, alpha)
{
	var convolutePixel = function(x, y)
	{
		// Assume the mask is a square 2D array.
		var maskSize = mask.length;
		var w = pixel2DArray.width;
		var h = pixel2DArray.height;

		var convolutedPixel = new Array(4); // RGBA
		convolutedPixel[0] = 0;
		convolutedPixel[1] = 0;
		convolutedPixel[2] = 0;
		convolutedPixel[3] = 0;

		// Apply convolution mask.
		for (var dx = 0; dx < maskSize; dx++)
		{
			for (var dy = 0; dy < maskSize; dy++)
			{
				var xi = x - (maskSize - 1) / 2 + dx; 
				var yi = y - (maskSize - 1) / 2 + dy;
				// Convolute if the pixel is in bounds.
				if (0 <= xi && xi < w && 0 <= yi && yi < h)
				{
					// Array access should be safe if the mask is proper.
					var weight = mask[dx][dy];
					var sourcePixel = pixel2DArray.get(xi, yi);
					convolutedPixel[0] += weight * sourcePixel[0];
					convolutedPixel[1] += weight * sourcePixel[1];
					convolutedPixel[2] += weight * sourcePixel[2];
					convolutedPixel[3] += weight * sourcePixel[3];
				}
			}
		}
		// If we shouldn't convolute alpha,
		// replace the convoluted alpha value with the original alpha value.
		// The loose equality here is intentional. I won't be stringent.
		if (!!alpha == false)
		{
			convolutedPixel[3] = pixel2DArray.get(x, y)[3];
		}
		return convolutedPixel;
	};
	return convolutePixel;
}

// Simple edge detection: check neighboring pixels for different values.
var setSimple = function()
{
	// Clear innerHTML.
	additionalInput.innerHTML = "";
};
var simple = function(canvasIn, canvasOut)
{
	var canvas2dIn = canvasIn.getContext("2d");
	var canvas2dOut = canvasOut.getContext("2d");
	var w = canvasIn.width;
	var h = canvasIn.height;

	var selection = canvas2dIn.getImageData(0, 0, w, h);
	var pixels2D = pixelsTo2DArray(selection);

	// Iterate through all but edge pixels.
	for (var x = 0; x < w - 1; x++)
	{
		for (var y = 0; y < h - 1; y++)
		{
			var currentPixel = pixels2D.get(x, y);
			var downPixel = pixels2D.get(x + 1, y);
			var rightPixel = pixels2D.get(x, y + 1);

			// Pixels match, no border.
			if (currentPixel[0] === downPixel[0]
			 && currentPixel[1] === downPixel[1]
			 && currentPixel[2] === downPixel[2]
			 && currentPixel[3] === downPixel[3]

			 && currentPixel[0] === rightPixel[0]
			 && currentPixel[1] === rightPixel[1]
			 && currentPixel[2] === rightPixel[2]
			 && currentPixel[3] === rightPixel[3]
			)
			{
				canvas2dOut.fillStyle = "#ffffff"; // white
				canvas2dOut.fillRect(x, y, 1, 1);
			}
			// Pixels don't match, border.
			else
			{
				canvas2dOut.fillStyle = "#000000"; // black
				canvas2dOut.fillRect(x, y, 1, 1);
			}
		}
	}
	// End for loop
};

// Sobel edge filter: use a convolution mask to approximate sharp gradients.
var setSobel = function()
{
	// Clear innerHTML.
	additionalInput.innerHTML = "";
};
var sobel = function(canvasIn, canvasOut)
{
	var canvas2dIn = canvasIn.getContext("2d");
	var canvas2dOut = canvasOut.getContext("2d");
	var w = canvasIn.width;
	var h = canvasIn.height;

	var selection = canvas2dIn.getImageData(0, 0, w, h);
	var pixels2D = pixelsTo2DArray(selection);

	var xMask = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
	var yMask = [[-1,  0, 1], [-2, 0, 2], [-1, 0, 1]];
	var xConvolute = convolute(pixels2D, xMask, false);
	var yConvolute = convolute(pixels2D, yMask, false);

	// Convolute all pixels not on boundary.
	for (var x = 1; x < w - 1; x++)
	{
		for (var y = 1; y < h - 1; y++)
		{
			var xConvolutedPixel = xConvolute(x, y);
			var yConvolutedPixel = yConvolute(x, y);

			var rgba = new Array(4);
			// Get convoluted RGB
			for (var i = 0; i < 3; i++)
			{
				var xChannel = xConvolutedPixel[i];
				var yChannel = yConvolutedPixel[i];
				var channel = Math.hypot(xChannel, yChannel);
					// Clamp value to [0, 255]
					channel = Math.max(0, Math.min(255, channel));
					// Set value to nearest uint8 integer.
					channel = Math.round(channel);

				rgba[i] = channel;
			}
			// Retain original A.
			rgba[3] = xConvolutedPixel[3]; // = yConvolutedPixel[3];

			canvas2dOut.fillStyle = "rgba(" + rgba.join(",") + ")";
			canvas2dOut.fillRect(x, y, 1, 1);
		}
	}
	// End for loop.
};

// Use the largest contrast in RGB channel values as the line intensity.
// Conceptually derived from: http://gamedev.stackexchange.com/a/86413
var setDifference = function()
{
	additionalInput.innerHTML = "";
	var minText = document.createElement("p");
		additionalInput.appendChild(minText);
	var minSlider = document.createElement("input");
		additionalInput.appendChild(minSlider);
		minSlider.id = "minSlider"; // For fetching in [difference]
		minSlider.type = "range";
		minSlider.min = 0;
		minSlider.max = 255;
		minSlider.defaultValue = 102;
		//
		minText.textContent = "Minimum value: " + minSlider.value;
		minSlider.onchange = function()
		{
			// Unary + to convert value from string to number.
			var minValue = +minSlider.value;
			var maxValue = +maxSlider.value;
			minText.textContent = "Minimum value: " + minValue;
			if (maxValue < minValue)
			{
				maxText.textContent = "Maximum value: " + minValue;
				maxSlider.value = minValue;
			}
			readFiles();
		};

	var maxText = document.createElement("p");
		additionalInput.appendChild(maxText);
	var maxSlider = document.createElement("input");
		additionalInput.appendChild(maxSlider);
		maxSlider.id = "maxSlider"; // For fetching in [difference]
		maxSlider.type = "range";
		maxSlider.min = 0;
		maxSlider.max = 255;
		maxSlider.defaultValue = 187;
		//
		maxText.textContent = "Maximum value: " + maxSlider.value;
		maxSlider.onchange = function()
		{
			// Unary + to convert value from string to number.
			var minValue = +minSlider.value;
			var maxValue = +maxSlider.value;
			maxText.textContent = "Maximum value: " + maxValue;
			if (maxValue < minValue)
			{
				minText.textContent = "Minimum value: " + maxValue;
				minSlider.value = maxValue;
			}
			readFiles();
		};
	//
};
var difference = function(canvasIn, canvasOut)
{
	var canvas2dIn = canvasIn.getContext("2d");
	var canvas2dOut = canvasOut.getContext("2d");
	var w = canvasIn.width;
	var h = canvasIn.height;

	var selection = canvas2dIn.getImageData(0, 0, w, h);
	var pixels2D = pixelsTo2DArray(selection);

	// Iterate through all but edge pixels.
	for (var x = 0; x < w - 1; x++)
	{
		for (var y = 0; y < h - 1; y++)
		{
			// Sample the adjacent pixels with increasing indices.
			var currentPixel = pixels2D.get(x, y);
			var downPixel = pixels2D.get(x + 1, y);
			var rightPixel = pixels2D.get(x, y + 1);
			var downrightPixel = pixels2D.get(x + 1, y + 1);

			// Get RGB values for each pixel.
			var rc = currentPixel[0];
			var gc = currentPixel[1];
			var bc = currentPixel[2];
			
			var rd = downPixel[0];
			var gd = downPixel[1];
			var bd = downPixel[2];

			var rr = rightPixel[0];
			var gr = rightPixel[1];
			var br = rightPixel[2];

			var rdr = downrightPixel[0];
			var gdr = downrightPixel[1];
			var bdr = downrightPixel[2];

			// Get difference in values between the pixel and its neighbors.
			var deltas = [rc - rd, gc - gd, bc - bd,
						  rc - rr, gc - gr, bc - br,
						  rc - rdr, gc - gdr, bc - bdr];
			// Find the biggest difference in values as the magnitude.
			var maxDelta = deltas
				// Take magnitude of each channel difference.
				.map(function(n){return Math.abs(n);})
				// Take maximal value of the computed magnitudes.
				.reduce(function(prev, current)
					{return Math.max(prev, current);}, 0);

			// Modified version of reference threshold algorithm,
			// which removes small contrasts and retains a nice
			// range of dark values for retained edges.
			//
			// In contrast to the reference,
			// the channels have values from 0 to 255 nstead of 0 to 1.
			// Hence, I used values from [0, 255] instead of [0, 1].
			//
			// In addition, I didn't see significant difference in
			// output if I removed the first/inner clamp, so I removed it.
			//
			// Otherwise, I simplified the operations before the clamp:
			// contrast = 1.5 * (2 * maxDelta - 0.8 * 255);
			// 			= 3 * maxDelta - 306;
			// 			= 3 * (maxDelta - 102);
			// And we can see that, by default,
			// maxDelta <= 102 -> black
			// maxDelta >= 187 -> white

			// But that's a bit moot with this implementation,
			// since it now uses a parameterized slider set above.
			// Unary + to convert value from string to number.
			var dMin = +document.getElementById("minSlider").value;
			var dMax = +document.getElementById("maxSlider").value;
			var contrast = maxDelta;
				// clamp to [dMin, dMax].
				contrast = Math.max(dMin, Math.min(dMax, contrast));
				// map [dMin, dMax] -> [0, 255].
				contrast = (contrast - dMin) / (dMax - dMin) * 255;

				// Cast to grayscale channel.
				contrast = 255 - Math.round(contrast);

			// Set RGB values to the magnitude to get a shade of gray.
			var rgba = new Array(4);
			rgba[0] = contrast;
			rgba[1] = contrast;
			rgba[2] = contrast;
			rgba[3] = currentPixel[3]; // Keep original alpha.

			canvas2dOut.fillStyle = "rgba(" + rgba.join(",") + ")";
			canvas2dOut.fillRect(x, y, 1, 1);
		}
	}
	// End for loop.
};

// Object to contain algorithms.
var algorithms = {
	"simple": {"set": setSimple, "algorithm": simple},
	"sobel": {"set": setSobel, "algorithm": sobel},
	"color difference": {"set": setDifference, "algorithm": difference}
};

// Add all algorithms as selectable options to algorithmSelector, as created above.
for (var key in algorithms)
{
	var algorithmOption = document.createElement("option");
		algorithmOption.value = key;
		algorithmOption.textContent = key;
		algorithmSelector.appendChild(algorithmOption);
}



})()