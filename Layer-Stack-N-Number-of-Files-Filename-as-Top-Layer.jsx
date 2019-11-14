//////////////////////////////////////////////////////////////  
/*
www.mouseprints.net/old/dpr/PhotoCollageToolkit.html
ORIGINAL "BatchMultiImageCollage.jsx" SCRIPT CREATED BY JJMACK & MODIFIED BY STEPHEN A. MARSH 2019   
DEPENDENT ON SCRIPT "PCTpreferences.jsx" RESIDING IN SAME FOLDER AS THIS SCRIPT

community.adobe.com/t5/Photoshop/Batch-automating-sequences-of-images/m-p/10619866#M263871

This script will stack N number of input files and save as PSD using the top layer name as the filename with a suffix of " Final" appended to the output filename, any non-digit characters at the end of the output filename will be removed

To stack in groups/sequences of 4 consecutive images, the Template file requires a true Background layer and would need four white alpha channels named Image 1, Image 2, Image 3, Image 4.
The template file would also need to be the same pixel width/height/resolution/orientation as the source files.

*/
////////////////////////////////////////////////////////////// 


//* ==========================================================
// 2010  John J. McAssey (JJMack)
// ======================================================= */

// This script is supplied as is. It is provided as freeware.
// The author accepts no liability for any problems arising from its use.

// Image files and Template Alpha Channel "Image 1" should have the same orientation matching Aspect
// ratio is even better.  This script will try to transform the placed Images to match the Image 1 Alpha channel as
// best as it can and even try to handle orientation miss matches.

/* Help Category note tag menu can be used to place script in automate menu
<javascriptresource>
<about>$$$/JavaScripts/BatchMultiImageCollage/About=JJMack's Batch populate a multi Image Collage.^r^rCopyright 2010 Mouseprints.^r^rBatch populate a multi Image collage template</about>
<category>JJMack's Collage Script</category>
</javascriptresource>
*/

// enable double-clicking from Mac Finder or Windows Explorer
#target photoshop // this command only works in Photoshop CS2 and higher

// bring application forward for double-click events
app.bringToFront();

//////////////////////////////////
//       SET-UP Preferences	//       
//////////////////////////////////
//@include "PCTpreferences.jsx"


var gVersion = 1.0;

// a global variable for the title of the dialog
// this string will also be used for the preferences file I write to disk
// Photoshop Install Directory/Presets/Image Processor/Image Processor.xml for example

var gScriptName = "MICollage";


// remember the dialog modes
var saveDialogMode = app.displayDialogs;
app.displayDialogs = DialogModes.NO;

try {
	// make sure they are running Photoshop CS2
	CheckVersion();

}
// Lot's of things can go wrong, Give a generic alert and see if they want the details
catch(e) {
	if ( confirm("Sorry, something major happened and I can't continue! Would you like to see more info?" ) ) {
		alert(e);
	}
}

// Save the current preferences
var startRulerUnits = app.preferences.rulerUnits;
var startTypeUnits = app.preferences.typeUnits;
var startDisplayDialogs = app.displayDialogs;

// Set Photoshop to use pixels and display no dialogs
app.displayDialogs = DialogModes.NO;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
	
// Set the script location

var scriptLocation = findScript() + "0";

// Stuff I don't know much about
var strButtonSelect = localize("$$$/JavaScripts/ExportLayersToFiles/Select=Select...");
var strButtonBrowse = localize("$$$/JavaScripts/ExportLayersToFiles/Browse=Browse...");
var strAlertSpecifyTemplateFile = localize("$$$/JavaScripts/ExportLayersToFiles/SpecifyTemplateFile=Please specify a template file.");
var strAlertTemplateFileNotExist = localize("$$$/JavaScripts/ExportLayersToFiles/TemplateFileDoesNotExist=Template file does not exist.");
var strAlertSpecifyInputFolder = localize("$$$/JavaScripts/ExportLayersToFiles/SpecifyInputFolder=Please specify an input folder.");
var strAlertInputFolderNotExist = localize("$$$/JavaScripts/ExportLayersToFiles/InputFolderDoesNotExist=Input folder does not exist.");
var strAlertSpecifyDestination = localize("$$$/JavaScripts/ExportLayersToFiles/SpecifyDestination=Please specify an output folder.");
var strAlertDestinationNotExist = localize("$$$/JavaScripts/ExportLayersToFiles/DestionationDoesNotExist=Output folder does not exist.");

var exportInfo = new Object();
initExportInfo(exportInfo);										// ??????
	
// define the dialog	
// [left, top, right, bottom]
function createDialog(){

	// Create an empty dialog window near the upper left of the screen
	var dlg = new Window('dialog', 'MICollage');
	dlg.frameLocation = [78, 100];

	// Add a panel to hold title and 'message text' strings
	dlg.msgPn0 = dlg.add('panel', undefined, 'Template File');
	dlg.msgPn0.orientation = "column";
	dlg.msgPn0.alignChildren = 'Right';
	// Add a panel to hold title and 'message text' strings
	dlg.msgPn0.TemplateFile = dlg.msgPn0.add('group');
	dlg.msgPn0.TemplateFile.orientation = "row";
	dlg.msgPn0.etTemplateFile = dlg.msgPn0.add("edittext", undefined, exportInfo.destination.toString());
	dlg.msgPn0.etTemplateFile.preferredSize.width = 550;
	dlg.msgPn0.etTemplateFile.helpTip = "Choose a collage template to populate.";

	dlg.msgPn0.btnSelect = dlg.msgPn0.add("button", undefined, strButtonSelect);
	dlg.msgPn0.btnSelect.helpTip = "Select a collage template to populate.";
	dlg.msgPn0.btnSelect.onClick = function() {
		var dir = Folder(dlg.msgPn0.etTemplateFile.text.substr(0, dlg.msgPn0.etTemplateFile.text.lastIndexOf("\\")+1));
		if (!dir.exists) var dir =  Folder(templateFolder);		
		dlg.selTemplateFile = dir.openDlg(dlg.msgPn0.etTemplateFile.text , "Select:*.psd;*.psb");
		if ( dlg.selTemplateFile != null ) {
	        dlg.msgPn0.etTemplateFile.text = dlg.selTemplateFile.fsName;
	    }
		//dlg.msgPn0.defaultElement.active = true;
	}

	// Add a panel to hold title and 'message text' strings
	dlg.msgPn2 = dlg.add('panel', undefined, 'Input Folder');
	dlg.msgPn2.orientation = "column";
	dlg.msgPn2.alignChildren = 'Right';

	dlg.msgPn2.InputFolder = dlg.msgPn2.add('group');
	dlg.msgPn2.InputFolder.orientation = "row";
	dlg.msgPn2.etInputFolder = dlg.msgPn2.add("edittext", undefined, exportInfo.destination.toString());
	dlg.msgPn2.etInputFolder.preferredSize.width = 550;
	dlg.msgPn2.etInputFolder.helpTip = "Choose a folder of images to process.";

	dlg.msgPn2.btnBrowse = dlg.msgPn2.add("button", undefined, strButtonBrowse);
	dlg.msgPn2.btnBrowse.helpTip = "Select a folder of images to process.";
	dlg.msgPn2.btnBrowse.onClick = function() {
		var defaultFolder = dlg.msgPn2.etInputFolder.text;
		var testFolder = new Folder(dlg.msgPn2.etInputFolder.text);
		if (!testFolder.exists) {
//			defaultFolder = "~";
			defaultFolder = imagePath;
		}
		// var selFolder = Folder.selectDialog(dlg.msgPn2.etInputFolder.text, defaultFolder);
		dlg.selInputFolder = Folder.selectDialog(dlg.msgPn2.etInputFolder.text, defaultFolder);
		if ( dlg.selInputFolder != null ) {
	        dlg.msgPn2.etInputFolder.text = dlg.selInputFolder.fsName;
	    }
		//dlg.msgPn2.defaultElement.active = true;
	}

	// Add a panel to hold title and 'message text' strings
	dlg.msgPn3 = dlg.add('panel', undefined, 'Output Folder');
	dlg.msgPn3.orientation = "column";
	dlg.msgPn3.alignChildren = 'Right';

	dlg.msgPn3.Destination = dlg.msgPn3.add('group');
	dlg.msgPn3.Destination.orientation = "row";
	dlg.msgPn3.etDestination = dlg.msgPn3.add("edittext", undefined, exportInfo.destination.toString());
	dlg.msgPn3.etDestination.preferredSize.width = 550;
	dlg.msgPn3.etDestination.helpTip = "Choose a folder to export your collages to.";

	dlg.msgPn3.btnBrowse = dlg.msgPn3.add("button", undefined, strButtonBrowse);
	dlg.msgPn3.btnBrowse.helpTip = "Select a folder to export your collages to.";
	dlg.msgPn3.btnBrowse.onClick = function() {
		var defaultFolder = dlg.msgPn3.etDestination.text;
		var testFolder = new Folder(dlg.msgPn3.etDestination.text);
		if (!testFolder.exists) {
			defaultFolder = "~";
		}
		dlg.selOutputFolder = Folder.selectDialog(dlg.msgPn3.etDestination.text, defaultFolder);
		if ( dlg.selOutputFolder != null ) {
	        dlg.msgPn3.etDestination.text = dlg.selOutputFolder.fsName;
	    }
		//dlg.msgPn3.defaultElement.active = true;
	}

	// Add a panel to hold title and 'message text' strings
	dlg.msgPnl = dlg.add('panel', undefined, 'Options');
	dlg.msgPnl.orientation = "column";
	dlg.msgPnl.alignChildren = 'right';

	//dlg.msgPnl.StampFilename = dlg.msgPnl.add('group');
	//dlg.msgPnl.StampFilename.orientation = "row";
	//dlg.msgPnl.StampFilename.alignment='left';
	//dlg.msgPnl.StampFilename.st = dlg.msgPnl.StampFilename.add('checkbox', undefined, 'Stamp File Name on Collage   OR');
	//dlg.msgPnl.StampFilename.helpTip = "Stamp Filename on Collage.";

	dlg.msgPnl.StampImage = dlg.msgPnl.add('group');
	dlg.msgPnl.StampImage.orientation = "row";
	dlg.msgPnl.StampImage.alignment='left';
	dlg.msgPnl.StampImage.st = dlg.msgPnl.StampImage.add('checkbox', undefined, 'Stamp Filename on Image');
	dlg.msgPnl.StampImage.helpTip = "Stamp Filename on Image.";

	dlg.msgPnl.grp5a =dlg.msgPnl.add('group');
	dlg.msgPnl.grp5a.orientation='row';
	dlg.msgPnl.grp5a.alignment='fill';
	dlg.msgPnl.grp5a.st1 = dlg.msgPnl.grp5a.add('statictext',undefined,'Name Stamp Text  Location:');
	var position =['Top Left','Top Center','Top Right','Center Left','Center','Center Right','Bottom Left','Bottom Center','Bottom Right'];
	dlg.msgPnl.grp5a.dd1 = dlg.msgPnl.grp5a.add('dropdownlist',undefined,position);
	dlg.msgPnl.grp5a.dd1.selection=textLocationDefault;

	dlg.msgPnl.grp6a =dlg.msgPnl.add('group');
	dlg.msgPnl.grp6a.orientation='row';
	dlg.msgPnl.grp6a.alignment='fill';
	dlg.msgPnl.grp6a.st1 = dlg.msgPnl.grp6a.add('statictext',undefined,'Font');
	fontlist = new Array();
	psfontlist = new Array();
	for (var i=0,len=app.fonts.length;i<len;i++) {
		//fontlist[i] =  app.fonts[i].name;
		try { 
			if ( app.fonts[i].name!=app.fonts[i+1].name &&  app.fonts[i].name.indexOf("Acumin") == -1) {
				fontlist.push(app.fonts[i].name);
				psfontlist.push(app.fonts[i].postScriptName);
				}
			}
		catch(e) { 
			if ( app.fonts[i].name.indexOf("Acumin") == -1) {}
				fontlist.push(app.fonts[i].name);
				psfontlist.push(app.fonts[i].postScriptName);
			}
		}
	dlg.msgPnl.grp6a.dd1 = dlg.msgPnl.grp6a.add('dropdownlist',undefined,fontlist);
	dlg.msgPnl.grp6a.dd1.selection=1;

	dlg.msgPnl.grp7a =dlg.msgPnl.add('group');
	dlg.msgPnl.grp7a.orientation='row';
	dlg.msgPnl.grp7a.alignment='fill';
	dlg.msgPnl.grp7a.st1 = dlg.msgPnl.grp7a.add('statictext',undefined,'Text Layer Style:  ');
	dlg.msgPnl.grp7a.dd1 = dlg.msgPnl.grp7a.add('dropdownlist',undefined,textStyleList);
	dlg.msgPnl.grp7a.dd1.preferredSize.width = 160;
	dlg.msgPnl.grp7a.dd1.selection=textStyleDefault;

	dlg.msgPnl.grp8a =dlg.msgPnl.add('group');
	dlg.msgPnl.grp8a.orientation='row';
	dlg.msgPnl.grp8a.alignment='fill';
	dlg.msgPnl.grp8a.st1 = dlg.msgPnl.grp8a.add('statictext',undefined,'Image Layer Style:');
	dlg.msgPnl.grp8a.dd1 = dlg.msgPnl.grp8a.add('dropdownlist',undefined,imageStyleList);
	dlg.msgPnl.grp8a.dd1.preferredSize.width = 160;
	dlg.msgPnl.grp8a.dd1.selection=imageStyleDefault;

	dlg.msgPnl.SavePDFfile = dlg.msgPnl.add('group');
	dlg.msgPnl.SavePDFfile.orientation = "row";
	dlg.msgPnl.SavePDFfile.alignment='left';
	dlg.msgPnl.SavePDFfile.st = dlg.msgPnl.SavePDFfile.add('checkbox', undefined, 'Save PDF file');
	dlg.msgPnl.SavePDFfile.helpTip = "Save a PDF file instead of a PSD file.";

	dlg.msgPnl.SaveJPGfile = dlg.msgPnl.add('group');
	dlg.msgPnl.SaveJPGfile.orientation = "row";
	dlg.msgPnl.SaveJPGfile.alignment='left';
	dlg.msgPnl.SaveJPGfile.st = dlg.msgPnl.SaveJPGfile.add('checkbox', undefined, 'Save JPG file');
	dlg.msgPnl.SaveJPGfile.helpTip = "Save a flat Jpeg file as well.";

	// Add a panel with buttons to test parameters and
	dlg.buttonPanel = dlg.add('panel', undefined);
	dlg.buttonPanel.orientation = "row";
	dlg.buttonPanel.cancelBtn = dlg.buttonPanel.add ('button', undefined,'Cancel');
	dlg.buttonPanel.helpBtn = dlg.buttonPanel.add ('button', undefined,'Help');
	dlg.buttonPanel.runBtn = dlg.buttonPanel.add ('button', undefined,'Create Collages');

	return dlg;
	}

	var params = new Array();
	params['TemplateFile'] = "";
	params['InputFolder'] = "";
	params['OutputFolder'] = "";
	params['TextLocationNumber'] = textLocationDefault;
	params['FontNumber'] = "1";
	params['FontStyleNumber'] = textStyleDefault;
	params['ImageStyleNumber'] = imageStyleDefault;
	params['SavePDF'] = "";

	LoadParamsFromDisk( GetDefaultParamsFile(), params );

        function initializeDialog (MICollage){
		with(MICollage) {

		msgPn0.etTemplateFile.text = params['TemplateFile'];
		msgPn2.etInputFolder.text = params['InputFolder'];
		msgPn3.etDestination.text = params['OutputFolder'];
		msgPnl.grp5a.dd1.selection = params['TextLocationNumber'];
		msgPnl.grp6a.dd1.selection = params['FontNumber'];
		msgPnl.grp7a.dd1.selection = params['FontStyleNumber'];
		msgPnl.grp8a.dd1.selection = params['ImageStyleNumber'];

		// MICollage
		// checking for valid settings
		buttonPanel.runBtn.onClick = function() {

			// check if the template setting is proper
			var tmpltfld = MICollage.msgPn0.etTemplateFile.text;
			if (tmpltfld.length == 0) {
				alert(strAlertSpecifyTemplateFile);
				return;
			}
			var testFile = new File(tmpltfld);
			if (!testFile.exists) {
				alert(strAlertTemplateFileNotExist);
				return;
			}

			var inptfld = MICollage.msgPn2.etInputFolder.text;
			if (inptfld.length == 0) {
				alert(strAlertSpecifyInputFolder);
				return;
			}
			var testFolder = new Folder(inptfld);
			if (!testFolder.exists) {
				alert(strAlertInputFolderNotExist);
				return;
			}

			// check if the output folder setting is proper
			var destination = MICollage.msgPn3.etDestination.text;
			if (destination.length == 0) {
				alert(strAlertSpecifyDestination);
				return;
			}
			var testFolder = new Folder(destination);
			if (!testFolder.exists) {
				alert(strAlertDestinationNotExist);
				return;
			}

			// See if the input folder and the output folder are the same
			if (MICollage.msgPn3.etDestination.text == MICollage.msgPn2.etInputFolder.text) {
				var result = confirm("Are you sure you want your output folder to be the same as your input folder");
				if (result) {
				} else {
					return;
				}
			}

  	close( 1 ); // Close dialog window and process
	}

	buttonPanel.helpBtn.onClick = function() {help();}

	buttonPanel.cancelBtn.onClick = function() {close( 2 );}
	}
} // end createDialog

function runDialog(MICollage){
	// Warn the user if they have an open document and exit the script with return
	//if (documents.length > 0){
	//	alert ("This script requires that there are no open documents to run.");
	//return;
	//}		
	MICollage.onShow = function() {
		var ww = MICollage.bounds.width;  
		var hh = MICollage.bounds.height;  
		MICollage.bounds.x  = 78;  
		MICollage.bounds.y  = 100;  
		MICollage.bounds.width  = ww;  
		MICollage.bounds.height  = hh;  
		}
	return MICollage.show()
}

//=====================Start=====================================================
		
var MICollage = createDialog()	
initializeDialog(MICollage)

if (runDialog(MICollage) == 1){
	// transfer values from the dialog to my internal params
	params['TemplateFile'] = MICollage.msgPn0.etTemplateFile.text;
	params['InputFolder'] = MICollage.msgPn2.etInputFolder.text;
	params['OutputFolder'] = MICollage.msgPn3.etDestination.text;
	params['TextLocationNumber'] = MICollage.msgPnl.grp5a.dd1.selection;
	params['FontNumber'] = MICollage.msgPnl.grp6a.dd1.selection;
	params['FontStyleNumber'] = MICollage.msgPnl.grp7a.dd1.selection;
	params['ImageStyleNumber'] = MICollage.msgPnl.grp8a.dd1.selection;

	// Save the params from the above
	SaveParamsToDisk( GetDefaultParamsFile(), params );
	
	// Gets the template file from the UI
	var templateFile = MICollage.msgPn0.etTemplateFile.text;
	//alert(templateFile);

	// Gets the input folder from the UI
	var inputFolder = MICollage.msgPn2.etInputFolder.text;
	//alert(inputFolder);
	var inputFolder = new Folder(inputFolder);

	// Gets the output folder from the UI
	var outputFolder = MICollage.msgPn3.etDestination.text;
	//alert(outputFolder);
	var outputFolder = new Folder(outputFolder);

	//alert('Template="' + templateFile + '"\nImages from "' + inputFolder + '"\nSaved to "' + outputFolder +'"');

	var fontNumber = Number(MICollage.msgPnl.grp6a.dd1.selection.index);
    //    ChosenFontName = app.fonts[Math.round(fontNumber)].name;
    //    ChosenFontPostScriptName = app.fonts[Math.round(fontNumber)].postScriptName;
	//textFont = ChosenFontPostScriptName
	textFont = psfontlist[fontNumber];
	//alert("ChosenFontName = " + ChosenFontName + "\nChosenFontPostScriptName = " + ChosenFontPostScriptName  );

	var textStyle = textStyleList[Number(MICollage.msgPnl.grp7a.dd1.selection.index)];
	var imageStyle = imageStyleList[Number(MICollage.msgPnl.grp8a.dd1.selection.index)];
	//alert("textStyle = "  +  textStyle + " imageStyle = " + imageStyle );

	open(File(templateFile));
	var doc = activeDocument;
	var Name='';
	var saveFile ='';
	var templateName = activeDocument.name.replace(/\.[^\.]+$/, '');

	var layers = activeDocument.layers;
	activeDocument.activeLayer = layers[layers.length-1];						// Target Bottom Layer
	if ( !activeDocument.activeLayer.isBackgroundLayer ) {
		alert("Selected Template file does not have the Required Photoshop Background Layer");
	} else { 											// Has Background
		var abort = false;
		// ======Load Image 1 Selection===============================
		var idsetd = charIDToTypeID( "setd" );
		    var desc2 = new ActionDescriptor();
		    var idnull = charIDToTypeID( "null" );
		        var ref1 = new ActionReference();
	        var idChnl = charIDToTypeID( "Chnl" );
		        var idfsel = charIDToTypeID( "fsel" );
		        ref1.putProperty( idChnl, idfsel );
		    desc2.putReference( idnull, ref1 );
		    var idT = charIDToTypeID( "T   " );
	        var ref2 = new ActionReference();
		        var idChnl = charIDToTypeID( "Chnl" );
		        ref2.putName( idChnl, "Image 1" );
		    desc2.putReference( idT, ref2 );
		try{
			executeAction( idsetd, desc2, DialogModes.NO );
		}catch(e){
			alert("Selected Template file does not have the Required Image 1 Alpha Channel");
			var abort = true
		}

		var collageNumber = 1;
		var imageNumber = 1;
		var numberOfImages = getAlphaImageChannels()
		prefixlist = new Array();
		WorkOnDupe("Collage " + collageNumber +" " + templateName);						// Work on dupe
		var doc = activeDocument;
		//alert("numberOfImages = " + numberOfImages );

		if (!abort) { 										// Create Collages
			activeDocument.selection.deselect();

			var docWidth =  app.activeDocument.width;
			var docHeight = app.activeDocument.height;
			var docResolution = app.activeDocument.resolution;

			// Loop Image File Start
			var fileList = inputFolder.getFiles(/\.(nef|cr2|crw|dcs|raf|arw|orf|dng|jpg|jpe|jpeg|tif|tiff|psd|eps|png|bmp)$/i);
            
//////////////////////////////////////////////////////////////

             // Enforce Alpha-numeric Sort - ADDED BY STEPHEN A. MARSH 2019
             fileList.sort();
             
////////////////////////////////////////////////////////////// 
            
			// Loop through files
			for (var i = 0; i < fileList.length; i++) {
				// Only process the returned file objects
				// The filter 'should' have missed out any folder objects
				//  get next image file
				if (fileList[i] instanceof File) {
					//alert(fileList[i]);
					var layers = activeDocument.layers;
					activeDocument.activeLayer = layers[layers.length-1-imageNumber+1];	 // Target Background Layer or last placed image

					placeImage(fileList[i]);  					 // Place in Image

					// resize smart object layer to just cover canvas area aspect ratio and size
					// Get Smart Object current width and height
					var LB = activeDocument.activeLayer.bounds;
					var LWidth = (LB[2].value) - (LB[0].value);
					var LHeight = (LB[3].value) - (LB[1].value);	

					// Get Alpha Channel's width and height Selection Bounds did not work???
					makeLayer();						// Make Temp Work Layer
					loadAlpha("Image " + imageNumber );			// Load Image Alpha Channel
					fillBlack();							
					activeDocument.selection.invert();			// Inverse
					// If image size equals canvas size no pixels neill be selected clear will fail
					try{
						activeDocument.selection.clear();		// One clear did not work
						activeDocument.selection.clear();		// Two did the trick
					}catch(e){}
					activeDocument.selection.deselect();			// Deselect
					var SB = activeDocument.activeLayer.bounds;		// Get the bounds of the work layer
					var SWidth = (SB[2].value) - (SB[0].value);		// Area width
					var SHeight = (SB[3].value) - (SB[1].value);		// Area height
					activeDocument.activeLayer.remove();			// Remove Work layer

					var userResampleMethod = app.preferences.interpolation;	// Save interpolation settings
					app.preferences.interpolation = ResampleMethod.BICUBIC;	// resample interpolation bicubic	

					if (LWidth/LHeight<SWidth/SHeight) { // Smart Object layer Aspect Ratio less the Canvas area Aspect Ratio 
						var percentageChange = ((SWidth/LWidth)*100);  // Resize to canvas area width		
						activeDocument.activeLayer.resize(percentageChange,percentageChange,AnchorPosition.MIDDLECENTER);
						}
					else { 
						var percentageChange = ((SHeight/LHeight)*100); // resize to canvas area height			
						activeDocument.activeLayer.resize(percentageChange,percentageChange,AnchorPosition.MIDDLECENTER);
						}

					app.preferences.interpolation = userResampleMethod;	// Reset interpolation setting

					// Load Alpha Channel as a selection and align image to it
					loadAlpha("Image " + imageNumber);
					//align('AdTp');
					//align('AdLf');
					align('AdCV');
					align('AdCH');
					// Add Layer mask using Alpha channel Image1
					layerMask();							// Add un linked Layer Mask	
					// Add Photo Collage Layer Style to image layer
					addStyle(imageStyle);	
	
					// Isolate Image name
					var Name =  decodeURI(fileList[i]).replace(/\.[^\.]+$/, '');	// strip the extension off
					var imagePath = "";
					while (Name.indexOf("/") != -1 ) {				// Strip Path
                                                imagePath= imagePath + Name.substr(0, Name.indexOf("/") + 1);
						Name = Name.substr(Name.indexOf("/") + 1 ,);		
					}
					if (Name.indexOf("#") != -1 ) {					// Strip any prefix sequence number off	
						prefixlist[imageNumber - 1] = Name.substr(0,Name.indexOf("#") );
						Name = Name.substr(Name.indexOf("#") + 1 ,);		
					}

					// Add Filename Text if called for
					if ( MICollage.msgPnl.StampImage.st.value) {
						stampFilename(textFont,textSizeFactor,textColor,Name);

						loadAlpha("Image " + imageNumber);
							

						//var Position = 5;
						var Position = Number(MICollage.msgPnl.grp5a.dd1.selection.index) + 1;
						switch (Position){
						case 1 : align('AdLf'); align('AdTp'); break;
						case 2 : align('AdCH'); align('AdTp'); break;
						case 3 : align('AdRg'); align('AdTp'); break;
						case 4 : align('AdLf'); align('AdCV'); break;
						case 5 : align('AdCH'); align('AdCV'); activeDocument.selection.deselect(); activeDocument.activeLayer.rotate(textAngle); break;
						case 6 : align('AdRg'); align('AdCV'); break;
						case 7 : align('AdLf'); align('AdBt'); break;
						case 8 : align('AdCH'); align('AdBt'); break;
						case 9 : align('AdRg'); align('AdBt'); break;
						default : break;
						}

						// could add code to do something with the image prefix info if it exists in prefixlist
						if ( prefixlist[imageNumber -1] != undefined ) {}

						activeDocument.selection.deselect();
	
						// Add text Layer's layer style
						addStyle(textStyle);
					}

					if ( imageNumber == numberOfImages ) {

						// Before Saving the Collage I could add some embellishment to the collage here
						// Like I could use the File name prefix area before a "#" to have more information have a file naming convention like
						// Microsoft file name can be 255 characters long and not contain <>:"/\|?* So I could do something like
						// Sequence number,Collage Title,Image annotation#Image Name
						for (var n = 0; n < imageNumber; n++ ) { // alpha channel "Image " + (n +1) for thyis prrefix entry
							if ( prefixlist[n] != undefined ) {
								//alert(prefixlist[n] );
							}
						}	
                    
//////////////////////////////////////////////////////////////   

                           // Layer Name from Top Layer with Digits Removed - ADDED BY STEPHEN A. MARSH 2019
                           var doc = app.activeDocument;
                           doc.activeLayer = doc.layers[doc.layers.length = 0]; // Select the top layer
                           var layerName = doc.activeLayer.name.replace(/[a-z]+$/ig, ''); // Regex to remove single or multiple consecutive case insensitive alphabetical characters from the end of the layer name when used in the filename
                           // doc.activeDocument.backgroundLayer.remove(); // Remove the Background layer
                           doc.activeLayer = doc.layers[doc.layers.length-1]; // Select the back layer
                           doc.activeLayer.remove(); // Remove the active layer
                           doc.channels.removeAll(); // delete alphas  
                           
////////////////////////////////////////////////////////////// 

                           // Play Action - ADDED BY STEPHEN A. MARSH 2019
                           //app.doAction("MyAction", "MyActionSet.atn"); // Change the action and action set as required
                           
                           // Or add additional code to do something else to the layered sequence stack before saving...
                           
//////////////////////////////////////////////////////////////  

                           //Save output file - MODIFIED BY STEPHEN A. MARSH 2019
						outputFile = outputFolder + "/" + layerName + " Final";
                        
//////////////////////////////////////////////////////////////  

						//alert("outputFile = " + outputFile );
						if ( MICollage.msgPnl.SavePDFfile.st.value) { SaveAsPDF( outputFile);}
						else { SaveAsPSD( outputFile, true ); }
						if ( MICollage.msgPnl.SaveJPGfile.st.value) { SaveAsJPEG( outputFile , 10 );}				
/*
						// Remove Filename text layers if added
						if ( MICollage.msgPnl.StampImage.st.value) {
							for (var n = 1; n < numberOfImages + 1; n++) { activeDocument.activeLayer.remove();}
						} 					
						// Remove Placed image Smart Object Layer so template is un populated
						for (var n = 1; n < numberOfImages + 1; n++) {
							var layers = activeDocument.layers;
							activeDocument.activeLayer = layers[layers.length-2];
							activeDocument.activeLayer.remove();
						}
  */
						var collageNumber = collageNumber + 1;							// Next Collage number
						var imageNumber = 1;											// Reset Image Counter
						prefixlist = new Array();										// Reset prefixlist
						activeDocument.close(SaveOptions.DONOTSAVECHANGES);    			// Close the just save populated Collage 
						WorkOnDupe("Collage " + collageNumber +" " + templateName);		// Work on dupe
	                    var doc = activeDocument;
	
					}
					else { imageNumber = imageNumber + 1; }
				} // Image
			} // Loop Image File End
		} // end create collages
	} // end has Background

	if ( imageNumber != 1 ) {
		//WorkOnDupe("Collage " + collageNumber +" " + templateName);					// Work on dupe
		// Selec previous Document the selected Template
		var idslct = charIDToTypeID( "slct" );
		var desc3 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
      	var ref2 = new ActionReference();
     	var idDcmn = charIDToTypeID( "Dcmn" );
    	ref2.putOffset( idDcmn, -1 );
		desc3.putReference( idnull, ref2 );
		executeAction( idslct, desc3, DialogModes.NO );
		activeDocument.close(SaveOptions.DONOTSAVECHANGES);								// Close No Save the Template
		alert("Collage " + collageNumber + " incomplete out of images");				// Inform User
	}		
	else {
		activeDocument.close(SaveOptions.DONOTSAVECHANGES);								// Close No Save the next collage
		activeDocument.close(SaveOptions.DONOTSAVECHANGES);								// Close No Save the Template
		alert( collageNumber -1 + ", " + templateName + " Collages were saved in " + MICollage.msgPn3.etDestination.text );	// Inform User
	}
} // end if (runDialog(MICollage) == 1)

// Return the app preferences
app.preferences.rulerUnits = startRulerUnits;
app.preferences.typeUnits = startTypeUnits;
app.displayDialogs = saveDialogMode;

//////////////////////////////////////////////////////////////////////////////////
//				The end						//
//////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////
//			Helper Functions					//
//////////////////////////////////////////////////////////////////////////////////

function placeImage(file) {
	/*
        // Insure Photoshop Preference is not resize paste place
	var idsetd = charIDToTypeID( "setd" );
	    var desc7 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
	        var ref4 = new ActionReference();
	        var idPrpr = charIDToTypeID( "Prpr" );
	        var idGnrP = charIDToTypeID( "GnrP" );
	        ref4.putProperty( idPrpr, idGnrP );
	        var idcapp = charIDToTypeID( "capp" );
	        var idOrdn = charIDToTypeID( "Ordn" );
	        var idTrgt = charIDToTypeID( "Trgt" );
	        ref4.putEnumerated( idcapp, idOrdn, idTrgt );
	    desc7.putReference( idnull, ref4 );
	    var idT = charIDToTypeID( "T   " );
	        var desc8 = new ActionDescriptor();
	        var idresizePastePlace = stringIDToTypeID( "resizePastePlace" );
	        desc8.putBoolean( idresizePastePlace, false );
	    var idGnrP = charIDToTypeID( "GnrP" );
	    desc7.putObject( idT, idGnrP, desc8 );
	executeAction( idsetd, desc7, DialogModes.NO );
	*/
	// =======avoid bug in cs2 and maybe CS4 ==================================
	var idslct = charIDToTypeID( "slct" );
	    var desc5 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
	        var ref3 = new ActionReference();
	        var idChnl = charIDToTypeID( "Chnl" );
	        var idChnl = charIDToTypeID( "Chnl" );
	        var idRGB = charIDToTypeID( "RGB " );
	        ref3.putEnumerated( idChnl, idChnl, idRGB );
	    desc5.putReference( idnull, ref3 );
	    var idMkVs = charIDToTypeID( "MkVs" );
	    desc5.putBoolean( idMkVs, false );
	executeAction( idslct, desc5, DialogModes.NO );

	// Place in the file
	var idPlc = charIDToTypeID( "Plc " );
	    var desc5 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
	    desc5.putPath( idnull, new File( file ) );
	    var idFTcs = charIDToTypeID( "FTcs" );
	    var idQCSt = charIDToTypeID( "QCSt" );
	    var idQcsa = charIDToTypeID( "Qcsa" );
	    desc5.putEnumerated( idFTcs, idQCSt, idQcsa );
	    var idOfst = charIDToTypeID( "Ofst" );
	        var desc6 = new ActionDescriptor();
	        var idHrzn = charIDToTypeID( "Hrzn" );
	        var idPxl = charIDToTypeID( "#Pxl" );
	        desc6.putUnitDouble( idHrzn, idPxl, 0.000000 );
	        var idVrtc = charIDToTypeID( "Vrtc" );
	        var idPxl = charIDToTypeID( "#Pxl" );
	        desc6.putUnitDouble( idVrtc, idPxl, 0.000000 );
	    var idOfst = charIDToTypeID( "Ofst" );
	    desc5.putObject( idOfst, idOfst, desc6 );
	executeAction( idPlc, desc5, DialogModes.NO );

	// because can't get the scale of a smart object, reset to 100%
	activeDocument.activeLayer.resize(100 ,100,AnchorPosition.MIDDLECENTER);

	return app.activeDocument.activeLayer;
}

function stampFilename(textFont,sizeFactor,textColor,Name) {
        /* textX and TextY positions text placement 0 and 0 Top Left corner of image in pixels	*/
	var textX = 0;									
	var textY = 0;	
	/* END Variables hard coded */

	var txtWidth =  app.activeDocument.width * .90 ;				// 90% of Doc with
	var txtHeight = app.activeDocument.height * .90 ;				// 90% of doc height

	activeDocument.selection.deselect();						// make sure no active selection

	text_layer = activeDocument.artLayers.add();					// Add a Layer
	text_layer.name = Name ;							// Name Layer
	text_layer.kind = LayerKind.TEXT;						// Make Layer a Text Layer
	text_layer.textItem.color = textColor;						// set text layer color

	/* Do not set TextType to Pargarph so the layer can be aligned
 	text_layer.textItem.kind = TextType.PARAGRAPHTEXT;				// Set text layers text type
 	*/

	text_layer.textItem.font = textFont;						// set text font
	text_layer.blendMode = BlendMode.NORMAL						// blend mode
	text_layer.textItem.fauxBold = false;						// Bold
	text_layer.textItem.fauxItalic = false;						// Italic
	text_layer.textItem.underline = UnderlineType.UNDERLINEOFF;			// Underlibn
	text_layer.textItem.capitalization = TextCase.NORMAL;				// Case
	text_layer.textItem.antiAliasMethod = AntiAlias.SHARP;				// antiAlias

	/* Calulate font size to use for keep size same for landscape and portrait base on text area size */
	if (txtWidth >= txtHeight) {var fontSize = Math.round(txtHeight / (30 * sizeFactor));}
	else {var fontSize = Math.round(txtWidth / (30 * sizeFactor));}
	if (fontSize<10){fontSize=10};							// don't use Font size smaller then 10
	text_layer.textItem.size = fontSize;						// set text font Size

	text_layer.textItem.position = Array(textX, (textY + fontSize ));		// set text layers position in and down for Stamp add in fontsize

	// Do not set Text Area so so the layer can be aligned

	text_layer.textItem.contents = Name ;
}

function addStyle(Style){
	var idASty = charIDToTypeID( "ASty" );
	    var desc20 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
	        var ref3 = new ActionReference();
	        var idStyl = charIDToTypeID( "Styl" );
	        ref3.putName( idStyl, Style );
	    desc20.putReference( idnull, ref3 );
	    var idT = charIDToTypeID( "T   " );
	        var ref4 = new ActionReference();
	        var idLyr = charIDToTypeID( "Lyr " );
	        var idOrdn = charIDToTypeID( "Ordn" );
	        var idTrgt = charIDToTypeID( "Trgt" );
	        ref4.putEnumerated( idLyr, idOrdn, idTrgt );
	    desc20.putReference( idT, ref4 );
	try{
		executeAction( idASty, desc20, DialogModes.NO);
	}catch(e){}
}

function SaveAsJPEG(saveFile, jpegQuality){
	var doc = activeDocument;
	if (doc.bitsPerChannel != BitsPerChannelType.EIGHT) doc.bitsPerChannel = BitsPerChannelType.EIGHT;
	jpgSaveOptions = new JPEGSaveOptions();
	jpgSaveOptions.embedColorProfile = true;
	jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
	jpgSaveOptions.matte = MatteType.NONE;
	jpgSaveOptions.quality = jpegQuality;
	activeDocument.saveAs(File(saveFile+".jpg"), jpgSaveOptions, true,Extension.LOWERCASE);
}

function SaveAsPSD( inFileName, inEmbedICC ) {
	var psdSaveOptions = new PhotoshopSaveOptions();
	psdSaveOptions.embedColorProfile = inEmbedICC;
	app.activeDocument.saveAs( File( inFileName + ".psd" ), psdSaveOptions );
}

function SaveAsPDF( saveFile ) {
	var idsave = charIDToTypeID( "save" );
	    var desc2 = new ActionDescriptor();
	    var idAs = charIDToTypeID( "As  " );
	        var desc3 = new ActionDescriptor();
	        var idpdfPresetFilename = stringIDToTypeID( "pdfPresetFilename" );
	        desc3.putString( idpdfPresetFilename, "High Quality Print" );
	        var idpdfCompatibilityLevel = stringIDToTypeID( "pdfCompatibilityLevel" );
	        var idpdfCompatibilityLevel = stringIDToTypeID( "pdfCompatibilityLevel" );
	        var idpdfoneeight = stringIDToTypeID( "pdf18" );
	        desc3.putEnumerated( idpdfCompatibilityLevel, idpdfCompatibilityLevel, idpdfoneeight );
	        var idpdfCompressionType = stringIDToTypeID( "pdfCompressionType" );
	        desc3.putInteger( idpdfCompressionType, 7 );
	    var idPhtP = charIDToTypeID( "PhtP" );
	    desc2.putObject( idAs, idPhtP, desc3 );
	    var idIn = charIDToTypeID( "In  " );
	    desc2.putPath( idIn, new File( saveFile + ".pdf" ) );
	executeAction( idsave, desc2, DialogModes.NO );
}

function align(method) {
	var desc = new ActionDescriptor();
	var ref = new ActionReference();
	ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
	desc.putReference( charIDToTypeID( "null" ), ref );
	desc.putEnumerated( charIDToTypeID( "Usng" ), charIDToTypeID( "ADSt" ), charIDToTypeID( method ) );
	try{
		executeAction( charIDToTypeID( "Algn" ), desc, DialogModes.NO );
	}catch(e){}
}

function getAlphaImageChannels() {
	for (var n = 1; n < 999; n++) {
		// ======Load Image n Selection===============================
		var idsetd = charIDToTypeID( "setd" );
		    var desc2 = new ActionDescriptor();
		    var idnull = charIDToTypeID( "null" );
		        var ref1 = new ActionReference();
	        var idChnl = charIDToTypeID( "Chnl" );
		        var idfsel = charIDToTypeID( "fsel" );
		        ref1.putProperty( idChnl, idfsel );
		    desc2.putReference( idnull, ref1 );
		    var idT = charIDToTypeID( "T   " );
	        var ref2 = new ActionReference();
		        var idChnl = charIDToTypeID( "Chnl" );
		        ref2.putName( idChnl, "Image " + n );
		    desc2.putReference( idT, ref2 );
		try{
			executeAction( idsetd, desc2, DialogModes.NO );
		}catch(e){
			//alert ("n = " + n);
			return n - 1;
		}
	}
}


// ======Load Alpha Channel Selection===============================
function loadAlpha(channel) {
	var idsetd = charIDToTypeID( "setd" );
	    var desc2 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
	        var ref1 = new ActionReference();
	        var idChnl = charIDToTypeID( "Chnl" );
	        var idfsel = charIDToTypeID( "fsel" );
	        ref1.putProperty( idChnl, idfsel );
	    desc2.putReference( idnull, ref1 );
	    var idT = charIDToTypeID( "T   " );
	        var ref2 = new ActionReference();
	        var idChnl = charIDToTypeID( "Chnl" );
	        ref2.putName( idChnl, channel );
	    desc2.putReference( idT, ref2 );
	executeAction( idsetd, desc2, DialogModes.NO );
}

// =======Un linked layer Mask========================================
function layerMask() {
	var idMk = charIDToTypeID( "Mk  " );
	    var desc3 = new ActionDescriptor();
	    var idNw = charIDToTypeID( "Nw  " );
	    var idChnl = charIDToTypeID( "Chnl" );
	    desc3.putClass( idNw, idChnl );
	    var idAt = charIDToTypeID( "At  " );
	        var ref3 = new ActionReference();
	        var idChnl = charIDToTypeID( "Chnl" );
	        var idChnl = charIDToTypeID( "Chnl" );
	        var idMsk = charIDToTypeID( "Msk " );
	        ref3.putEnumerated( idChnl, idChnl, idMsk );
	    desc3.putReference( idAt, ref3 );
	    var idUsng = charIDToTypeID( "Usng" );
	    var idUsrM = charIDToTypeID( "UsrM" );
	    var idRvlS = charIDToTypeID( "RvlS" );
	    desc3.putEnumerated( idUsng, idUsrM, idRvlS );
	executeAction( idMk, desc3, DialogModes.NO );
	// =======================================================
	var idsetd = charIDToTypeID( "setd" );
	    var desc2 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
	        var ref1 = new ActionReference();
	        var idLyr = charIDToTypeID( "Lyr " );
	        var idOrdn = charIDToTypeID( "Ordn" );
	        var idTrgt = charIDToTypeID( "Trgt" );
	        ref1.putEnumerated( idLyr, idOrdn, idTrgt );
	    desc2.putReference( idnull, ref1 );
	    var idT = charIDToTypeID( "T   " );
	        var desc3 = new ActionDescriptor();
	        var idUsrs = charIDToTypeID( "Usrs" );
	        desc3.putBoolean( idUsrs, false );
	    var idLyr = charIDToTypeID( "Lyr " );
	    desc2.putObject( idT, idLyr, desc3 );
	executeAction( idsetd, desc2, DialogModes.NO );
}

function WorkOnDupe(dupeName) {
	var idDplc = charIDToTypeID( "Dplc" );
	    var desc2 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
	        var ref1 = new ActionReference();
	        var idDcmn = charIDToTypeID( "Dcmn" );
 	       var idOrdn = charIDToTypeID( "Ordn" );
	        var idFrst = charIDToTypeID( "Frst" );
	        ref1.putEnumerated( idDcmn, idOrdn, idFrst );
 	   desc2.putReference( idnull, ref1 );
	   var idNm = charIDToTypeID( "Nm  " );
	    desc2.putString( idNm, dupeName );
	executeAction( idDplc, desc2, DialogModes.NO );
/*
	var idslct = charIDToTypeID( "slct" );
 	   var desc3 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
      	  var ref2 = new ActionReference();
     	   var idDcmn = charIDToTypeID( "Dcmn" );
    	    ref2.putOffset( idDcmn, -1 );
  	  desc3.putReference( idnull, ref2 );
	executeAction( idslct, desc3, DialogModes.NO );
 
	activeDocument.close(SaveOptions.DONOTSAVECHANGES);
 */
	
}

function makeLayer(){
	var idMk = charIDToTypeID( "Mk  " );
	    var desc4 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
	        var ref3 = new ActionReference();
	        var idLyr = charIDToTypeID( "Lyr " );
	        ref3.putClass( idLyr );
	    desc4.putReference( idnull, ref3 );
	executeAction( idMk, desc4, DialogModes.NO );
}

function fillBlack(){
// ============Fill with Black==========================================
	var idFl = charIDToTypeID( "Fl  " );
 	   var desc11 = new ActionDescriptor();
	    var idUsng = charIDToTypeID( "Usng" );
	    var idFlCn = charIDToTypeID( "FlCn" );
  	  var idBlck = charIDToTypeID( "Blck" );
 	   desc11.putEnumerated( idUsng, idFlCn, idBlck );
	    var idOpct = charIDToTypeID( "Opct" );
	    var idPrc = charIDToTypeID( "#Prc" );
	    desc11.putUnitDouble( idOpct, idPrc, 100.000000 );
	    var idMd = charIDToTypeID( "Md  " );
	    var idBlnM = charIDToTypeID( "BlnM" );
	    var idNrml = charIDToTypeID( "Nrml" );
	    desc11.putEnumerated( idMd, idBlnM, idNrml );
	executeAction( idFl, desc11, DialogModes.NO );
}

function help() {
	try{
		var URL = new File(Folder.temp + "/PhotoCollageToolkit.html");
		URL.open("w");
		URL.writeln('<html><HEAD><meta HTTP-EQUIV="REFRESH" content="0; url=http://www.mouseprints.net/old/dpr/PhotoCollageToolkit.html"></HEAD></HTML>');
		URL.close();
		URL.execute();
	}catch(e){
		alert("Error, Can Not Open.");
	};
}

///////////////////////////////////////////////////////////////////////////////
// Function: initExportInfo
// Usage: create our default parameters
// Input: a new Object
// Return: a new object with params set to default
///////////////////////////////////////////////////////////////////////////////
function initExportInfo(exportInfo) {
    exportInfo.destination = new String("");
    exportInfo.fileNamePrefix = new String("untitled_");
    exportInfo.visibleOnly = false;
//    exportInfo.fileType = psdIndex;
    exportInfo.icc = true;
    exportInfo.jpegQuality = 8;
    exportInfo.psdMaxComp = true;
    exportInfo.tiffCompression = TIFFEncoding.NONE;
    exportInfo.tiffJpegQuality = 8;
    exportInfo.pdfEncoding = PDFEncoding.JPEG;
    exportInfo.pdfJpegQuality = 8;
    exportInfo.targaDepth = TargaBitsPerPixels.TWENTYFOUR;
    exportInfo.bmpDepth = BMPDepthType.TWENTYFOUR;

    try {
         exportInfo.destination = Folder(app.activeDocument.fullName.parent).fsName; // destination folder
        var tmp = app.activeDocument.fullName.name;
        exportInfo.fileNamePrefix = decodeURI(tmp.substring(0, tmp.indexOf("."))); // filename body part
    } catch(someError) {
        exportInfo.destination = new String("");
//        exportInfo.fileNamePrefix = app.activeDocument.name; // filename body part
    }
}

// Find the location where this script resides
function findScript() {
	var where = "";
	try {
		FORCEERROR = FORCERRROR;
	}
	catch(err) {
		// alert(err.fileName);
		// alert(File(err.fileName).exists);
		where = File(err.fileName);
	}
	return where;
}

// Function for returning current date and time

    function getDateTime() {
        var date = new Date();
        var dateTime = "";
        if ((date.getMonth() + 1) < 10) {
            dateTime += "0" + (date.getMonth() + 1) + "/";
        } else {
            dateTime += (date.getMonth() + 1) + "/";
        }
        if (date.getDate() < 10) {
            dateTime += "0" + date.getDate() + "/";
        } else {
            dateTime += date.getDate() + "/";
        }
        dateTime += date.getFullYear() + ", ";
        if (date.getHours() < 10) {
            dateTime += "0" + date.getHours() + ":";
        } else {
            dateTime += date.getHours() + ":";
        }
        if (date.getMinutes() < 10) {
            dateTime += "0" + date.getMinutes() + ":";
        } else {
            dateTime += date.getMinutes() + ":";
        }
        if (date.getSeconds() < 10) {
            dateTime += "0" + date.getSeconds();
        } else {
            dateTime += date.getSeconds();
        }
        return dateTime;
    }

// resetPrefs function for resetting the preferences
	function resetPrefs() {
		preferences.rulerUnits = startRulerUnits;
		preferences.typeUnits = startTypeUnits;
		displayDialogs = startDisplayDialogs;
	}

// CheckVersion
function CheckVersion() {
	var numberArray = version.split(".");
	if ( numberArray[0] < 9 ) {
		alert( "You must use Photoshop CS2 or later to run this script!" );
		throw( "You must use Photoshop CS2 or later to run this script!" );
	}
}

// load my params from the xml file on disk if it exists
// gParams["myoptionname"] = myoptionvalue
// I wrote a very simple xml parser, I'm sure it needs work
function LoadParamsFromDisk ( loadFile, params ) {
	// var params = new Array();
	if ( loadFile.exists ) {
		loadFile.open( "r" );
		var projectSpace = ReadHeader( loadFile );
		if ( projectSpace == GetScriptNameForXML() ) {
			while ( ! loadFile.eof ) {
				var starter = ReadHeader( loadFile );
				var data = ReadData( loadFile );
				var ender = ReadHeader( loadFile );
				if ( ( "/" + starter ) == ender ) {
					params[starter] = data;
				}
				// force boolean values to boolean types
				if ( data == "true" || data == "false" ) {
					params[starter] = data == "true";
				}
			}
		}
		loadFile.close();
		if ( params["version"] != gVersion ) {
			// do something here to fix version conflicts
			// this should do it
			params["version"] = gVersion;
		}
	}
	return params;
}

// save out my params, this is much easier
function SaveParamsToDisk ( saveFile, params ) {
	saveFile.encoding = "UTF8";
	saveFile.open( "w", "TEXT", "????" );
	// unicode signature, this is UTF16 but will convert to UTF8 "EF BB BF"
	saveFile.write("\uFEFF");
	var scriptNameForXML = GetScriptNameForXML();
	saveFile.writeln( "<" + scriptNameForXML + ">" );
	for ( var p in params ) {
		saveFile.writeln( "\t<" + p + ">" + params[p] + "</" + p + ">" );
	}
	saveFile.writeln( "</" + scriptNameForXML + ">" );
	saveFile.close();
}

// you can't save certain characters in xml, strip them here
// this list is not complete
function GetScriptNameForXML () {
	var scriptNameForXML = new String( gScriptName );
	var charsToStrip = Array( " ", "'", "." );
	for (var a = 0; a < charsToStrip.length; a++ )  {
		var nameArray = scriptNameForXML.split( charsToStrip[a] );
		scriptNameForXML = "";
		for ( var b = 0; b < nameArray.length; b++ ) {
			scriptNameForXML += nameArray[b];
		}
	}
	return scriptNameForXML;
}

// figure out what I call my params file
function GetDefaultParamsFile() {
	//var paramsFolder = new Folder( path + "/Presets/" + gScriptName );
	//var paramsFolder = new Folder( Folder.temp + "/JJMack's Scripts/" + gScriptName );
	var paramsFolder = new Folder( "~/Application Data/JJMack's Scripts/" + gScriptName );
	//alert("paramsFolder = " + paramsFolder );
	paramsFolder.create();
	return ( new File( paramsFolder + "/" + gScriptName + ".xml" ) );
}

// a very crude xml parser, this reads the "Tag" of the <Tag>Data</Tag>
function ReadHeader( inFile ) {
	var returnValue = "";
	if ( ! inFile.eof ) {
		var c = "";
		while ( c != "<" && ! inFile.eof ) {
			c = inFile.read( 1 );
		}
		while ( c != ">" && ! inFile.eof ) {
			c = inFile.read( 1 );
			if ( c != ">" ) {
				returnValue += c;
			}
		}
	} else {
		returnValue = "end of file";
	}
	return returnValue;
}

// very crude xml parser, this reads the "Data" of the <Tag>Data</Tag>
function ReadData( inFile ) {
	var returnValue = "";
	if ( ! inFile.eof ) {
		var c = "";
		while ( c != "<" && ! inFile.eof ) {
			c = inFile.read( 1 );
			if ( c != "<" ) {
				returnValue += c;
			}
		}
		inFile.seek( -1, 1 );
	}
	return returnValue;
}
