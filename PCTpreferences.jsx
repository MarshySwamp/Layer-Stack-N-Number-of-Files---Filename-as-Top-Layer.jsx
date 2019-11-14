//* ==========================================================
// 2013  John J. McAssey (JJMack)
// ======================================================= */

// This script is supplied as is. It is provided as freeware.
// The author accepts no liability for any problems arising from its use.

// Image files and Template Alpha Channel "Image 1" should have the same orientation matching Aspect
// ratio is even better.  This script will try to transform the placed Images to match the Image 1 Alpha channel as
// best as it can and even try to handle orientation miss matches.

/* Help Category note tag menu can be used to place script in automate menu
<javascriptresource>
<about>$$$/JavaScripts/PCTpreferences/About=JJMack's Photo Collage Toolkit.^r^rCopyright 2013 Mouseprints.^r^rPreferences</about>
<category>JJMack's Collage Script</category>
</javascriptresource>
*/

// enable double-clicking from Mac Finder or Windows Explorer
#target photoshop // this command only works in Photoshop CS2 and higher

// bring application forward for double-click events
app.bringToFront();

///////////////////////////
//       SET-UP
///////////////////////////

/////////////////////////////////////////////////////////////////////////////////
///////////////////////CUSTOMIZE Here////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
// Some Hard Coded variables that some day I may put into the dialog options area

var imageStyleList = ['Default Style (None)','Photo Collage Style 1','Photo Collage Style 2','Photo Collage Style 3','Photo Collage Style 4','Photo Collage Style 5','Photo Collage Style 6','Photo Collage Style 7','Photo Collage Style 8','Photo Collage Style 9','Photo Collage Style 10','Photo Collage Style 11'];
var imageStyleDefault = 0;			// imageStyleList index number

var textSizeFactor = 4;				// > 1 scales down text size
var textFont = "ArialMT";			// Photoshop internal font name
var textAngle = -10;				// center text angle
var textColor = new SolidColor;			// text color		
    textColor.rgb.red = 255;
    textColor.rgb.green = 255;
    textColor.rgb.blue = 255;
var textStyleList = ['Default Style (None)','Shiny Metal','Shiney Metal No Stroke','Strong Metal','Strong Metal No Stroke','Clear Emboss - Inner Bevel','Clear Emboss - Outer Bevel','JJMack Overlay'];
var textStyleDefault = 0;                       // textStyleList index number
var textLocationDefault = 7;                    // text Location Default Bottom Center	

var templateFolder = "C:/Program Files/Adobe/Adobe Photoshop Templates/";
//var templateFolder = "E:/Public Files/Pictures/Adobe Photoshop Templates/";
//var imagePath = "~/My Documents/My Pictures/";	// Windows XP 
var imagePath = "~/Pictures/";			// Windows 7 
//var imagePath = "E:/My Files/Pictures/";

// End hard coded variables
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
