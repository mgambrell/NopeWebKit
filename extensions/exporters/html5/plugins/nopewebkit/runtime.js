// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.NopeWebkit = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var isNWjs = false;
	var path = null;
	var fs = null;
	var os = null;
	var gui = null;
	var child_process = null;
	var process = null;
	var nw_appfolder = "";
	var nw_userfolder = "";
	var nw_projectfilesfolder = "";
	var slash = "\\";
	var filelist = [];
	var droppedfile = "";
	var chosenpath = "";
	
	function parseXml(xmlString)
	{
		// Parse the XML string into a DOM object
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlString, "application/xml");

		// Check for parsing errors
		const parseError = xmlDoc.querySelector("parsererror");
		if (parseError) {
			throw new Error(`XML Parsing Error: ${parseError.textContent}`);
		}

		// Extract file name and content
		const nameNode = xmlDoc.querySelector("name");
		const contentNode = xmlDoc.querySelector("content");

		if (!nameNode || !contentNode) {
			throw new Error("Missing required <name> or <content> elements in XML.");
		}

		const fileName = nameNode.textContent;
		const base64Content = contentNode.textContent;
		const encoding = contentNode.getAttribute("encoding");

		if (encoding !== "base64") {
			throw new Error("Unsupported encoding type: " + encoding);
		}

		// Decode Base64 content to binary string
		const binaryString = atob(base64Content);

		// Convert binary string to Uint8Array
		const byteArray = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			byteArray[i] = binaryString.charCodeAt(i);
		}

		return { fileName, byteArray };
	}
	
	function byteArrayToUtf8(byteArray)
	{
		const decoder = new TextDecoder('utf-8');
		return decoder.decode(byteArray);
	}
	
	function loadFileSync(filePath)
	{
		console.log("loadFileSync: " + filePath);
		const xhr = new XMLHttpRequest();
		xhr.open('GET', filePath, false); // false for synchronous request
		try {
				xhr.send();
				if (xhr.status === 200 || xhr.status === 0) { // Status 0 for file:// protocol
						var ret = parseXml(xhr.responseText);
						return byteArrayToUtf8(ret.byteArray);
						//console.log(ret);
						return ret;
				} else {
						//console.error(`Failed to load ${filePath}: ${xhr.status}`);
				}
		} catch (err) {
				//console.error(`Error loading ${filePath}:`, err);
		}
		console.log("/\\/\\/\\ FAILED")
		return null;
	}
	
	var pluginProto = cr.plugins_.NopeWebkit.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.curTag = "";
		this.lastData = "";
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		isNWjs = this.runtime.isNWjs;
		var self = this;
	};
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
	};
	
	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		return {
		};
	};
	
	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": "NW.js",
			"properties": [
				{"name": "App folder", "value": nw_appfolder, "readonly": true},
				{"name": "User folder", "value": nw_userfolder, "readonly": true}
			]
		});
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	Cnds.prototype.OnEndReadFile = function (tag)
	{
		return cr.equals_nocase(tag, this.curTag);
	};

	Cnds.prototype.PathExists = function (path_)
	{
		if (isNWjs)
			return fs["existsSync"](path_);
		else
			return false;
	};
	
	Cnds.prototype.OnFileDrop = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnOpenDlg = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnFolderDlg = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnSaveDlg = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnOpenDlgCancel = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnFolderDlgCancel = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnSaveDlgCancel = function ()
	{
		return true;
	};
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.WriteFile = function (path_, contents_)
	{
	};
	
	Acts.prototype.RenameFile = function (old_, new_)
	{
	};
	
	Acts.prototype.DeleteFile = function (path_)
	{
	};
	
	Acts.prototype.CopyFile = function (path_, dest_)
	{
	
	};
	
	Acts.prototype.MoveFile = function (path_, dest_)
	{
	};
	
	Acts.prototype.RunFile = function (path_)
	{
	};
	
	Acts.prototype.ShellOpen = function (path_)
	{
	};
	
	Acts.prototype.OpenBrowser = function (url_)
	{
	};
	
	Acts.prototype.CreateFolder = function (path_)
	{
	};
	
	Acts.prototype.AppendFile = function (path_, contents_)
	{
	};
	
	Acts.prototype.ListFiles = function (path_)
	{
		if (!filelist)
			filelist = [];
	};
	
	Acts.prototype.ShowOpenDlg = function (accept_)
	{
	};
	
	Acts.prototype.ShowFolderDlg = function (accept_)
	{
	};
	
	Acts.prototype.ShowSaveDlg = function (accept_)
	{
	};
	
	Acts.prototype.SetWindowX = function (x_)
	{
		//gui["Window"]["get"]()["x"] = x_;
	};
	
	Acts.prototype.SetWindowY = function (y_)
	{
		//gui["Window"]["get"]()["y"] = y_;
	};
	
	Acts.prototype.SetWindowWidth = function (w_)
	{
		//gui["Window"]["get"]()["width"] = w_;
	};
	
	Acts.prototype.SetWindowHeight = function (h_)
	{
		//gui["Window"]["get"]()["height"] = h_;
	};
	
	Acts.prototype.SetWindowTitle = function (str)
	{
		//document.title = str;
	};
	
	Acts.prototype.WindowMinimize = function ()
	{
	};
	
	Acts.prototype.WindowMaximize = function ()
	{
	};
	
	Acts.prototype.WindowUnmaximize = function ()
	{
	};
	
	Acts.prototype.WindowRestore = function ()
	{
	};
	
	Acts.prototype.WindowRequestAttention = function (request_)
	{
	};
	
	Acts.prototype.WindowSetMaxSize = function (w, h)
	{
	};
	
	Acts.prototype.WindowSetMinSize = function (w, h)
	{
	};
	
	Acts.prototype.WindowSetResizable = function (x)
	{
	};
	
	Acts.prototype.WindowSetAlwaysOnTop = function (x)
	{
	};
	
	Acts.prototype.ShowDevTools = function ()
	{
	};
	
	Acts.prototype.SetClipboardText = function (str)
	{
	};
	
	Acts.prototype.ClearClipboard = function ()
	{
	};
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.AppFolder = function (ret)
	{
		ret.set_string(nw_appfolder);
	};
	
	Exps.prototype.AppFolderURL = function (ret)
	{
		// Force local file resolution when treated as a URL, e.g. for AJAX requests.
		ret.set_string("file://" + nw_appfolder);
	};
	
	Exps.prototype.ProjectFilesFolder = function (ret)
	{
		ret.set_string(nw_projectfilesfolder);
	};
	
	Exps.prototype.ProjectFilesFolderURL = function (ret)
	{
		ret.set_string("file://" + nw_projectfilesfolder);
	};
	
	Exps.prototype.UserFolder = function (ret)
	{
		ret.set_string(nw_userfolder);
	};
	
	Acts.prototype.BeginReadFile = function (tag_, path_)
	{
		var self = this;
		
		const img = new Image();
		img.src = path_;

		// Ensure the image loads cross-origin (required for canvas read operations if not same-origin)
		img.crossOrigin = "Anonymous";

		// Once the image is loaded
		img.onload = function () {
			// Create a canvas with the same dimensions as the image
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			// Draw the image onto the canvas
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);

			// Get the image data (RGBA values for every pixel)
			const imageData = ctx.getImageData(0, 0, img.width, img.height);
			const data = imageData.data; // Contains RGBA values in sequential order

			// Extract the grayscale values from the RGB triplets
			const byteArray = new Uint8Array(img.width * img.height);
			for (let i = 0; i < byteArray.length; i++) {
				// Since it's grayscale, R, G, and B are redundant; pick one (e.g., data[i * 4])
				byteArray[i] = data[i * 4]; // R component
			}
			
			self.lastData = byteArrayToUtf8(byteArray);
			
			// Pass the resulting byte array to the callback
			//callback(byteArray, img.width, img.height);
			self.curTag = tag_;
			self.runtime.trigger(cr.plugins_.NopeWebkit.prototype.cnds.OnEndReadFile, self);
		};
	}
	
	Exps.prototype.ReadFile = function (ret, path_)
	{
		var contents = loadFileSync(path_ + ".xml");
		ret.set_string(contents);
	};
	
	Exps.prototype.FileSize = function (ret, path_)
	{
		if (!isNWjs)
		{
			ret.set_int(0);
			return;
		}
		
		var size = 0;
		
		try {
			var stat = fs["statSync"](path_);
			if (stat)
				size = stat["size"] || 0;
		}
		catch (e) {}
		
		ret.set_int(size);
	};
	
	Exps.prototype.ListCount = function (ret)
	{
		ret.set_int(filelist.length);
	};
	
	Exps.prototype.ListAt = function (ret, index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= filelist.length)
			ret.set_string("");
		else
			ret.set_string(filelist[index]);
	};
	
	Exps.prototype.DroppedFile = function (ret)
	{
		ret.set_string(droppedfile);
	};
	
	Exps.prototype.ChosenPath = function (ret)
	{
		ret.set_string(chosenpath);
	};
	
	Exps.prototype.WindowX = function (ret)
	{
		ret.set_int((isNWjs && gui) ? gui["Window"]["get"]()["x"] : 0);
	};
	
	Exps.prototype.WindowY = function (ret)
	{
		ret.set_int((isNWjs && gui) ? gui["Window"]["get"]()["y"] : 0);
	};
	
	Exps.prototype.WindowWidth = function (ret)
	{
		ret.set_int((isNWjs && gui) ? gui["Window"]["get"]()["width"] : 0);
	};
	
	Exps.prototype.WindowHeight = function (ret)
	{
		ret.set_int((isNWjs && gui) ? gui["Window"]["get"]()["height"] : 0);
	};
	
	Exps.prototype.WindowTitle = function (ret)
	{
		ret.set_string((isNWjs && gui) ? (gui["Window"]["get"]()["title"] || "") : 0);
	};
	
	Exps.prototype.ClipboardText = function (ret)
	{
		ret.set_string((isNWjs && gui) ? (gui["Clipboard"]["get"]()["get"]() || "") : 0);
	};
	
	Exps.prototype.LastData = function (ret)
	{
		ret.set_string(this.lastData);
	};
	
	pluginProto.exps = new Exps();

}());