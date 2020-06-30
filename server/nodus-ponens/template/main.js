// --------------------------------------------------------------------------------------------------
// Template Experiment 1
// --------------------------------------------------------------------------------------------------
// Participants: <Indicate participant pool information here>
//         Date: <Indicate experiment dates here>
//       Design: <Indicate names of people who created experimental design>
//         Code: <Indicate names of people who wrote the code>
// --------------------------------------------------------------------------------------------------
// Quickstart. To create nodus-ponens experiment:
//     i) Use the terminal to navigate to the folder that stores this file
//    ii) Type node main.js in the terminal
// The terminal will display experiment information, including a link to whether the experiment can
// be taken and a status of any participants who take the study.
// --------------------------------------------------------------------------------------------------
// Contents
// 1. Setup nodus-ponens framework
// 2. Setup stimuli
// 3. Launch experiment
// --------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------
// 1. Setup nodus-ponens framework
// --------------------------------------------------------------------------------------------------

var path             = require("path");
var fs               = require('fs');
var staticDirectory  = path.resolve("static");              // Set directory of static HTML+CSS files
var dataDirectory    = path.resolve("data");              // Set directory where data will be written
var participantIndex = 0;                            // Start participant numbering at this value + 1

var np               = require("nodus-ponens")(participantIndex, staticDirectory, dataDirectory);
np.authors           = "Authors";
np.experimentName    = "Template1";
np.port              = 55152;

// --------------------------------------------------------------------------------------------------
// 2. Setup stimuli
// --------------------------------------------------------------------------------------------------
// Note: nodus-ponens has a special function called "loadStimuli" that is intended to take a
// participant's ID number (an integer) as input and return an array of objects representing the
// stimuli catered to that participant. In the code below, "setupStimuli" serves that purpose, and
// it calls a bunch of helper functions to do its job, e.g., "CSVtoJSON" and "assignContents". Hence
// after defining "setupStimuli", "CSVtoJSON", and "assignContents", the code sets np.loadStimuli to
// "setupStimuli".

function setupStimuli(PID)
{
   var text    = fs.readFileSync('./Design.csv').toString();           // read design into CSV string
   var design  = CSVtoJSON(text, PID);                    // CSVtoJSON returns stimuli as JSON object
   var stimuli = assignContents(design);   // assign contents to the different problems in the design
   return stimuli;             // To randomize the order of the stimuli, return np.randomize(stimuli)
}

function CSVtoJSON(text, PID)               // This fn imports any CSV "Design" file as a JSON object
{                                                             // and adds some columns for R analyses
   var results       = [];
   var lines         = text.split(/\r\n|\r|\n/g);
   var header        = true;
   var headerColumns = ["ParticipantID", "ClockTime", "TrialHeader"];
   var trialColumn   = ["P" + PID, new Date().toISOString(), "Trial"];

   lines.forEach(function(line) {
      if(header)
      {
         headerColumns = headerColumns.concat(line.split(','));
         header = false;
      }
	  else if(line == '') {  }
      else
      {
         var columnInfo = trialColumn.concat(line.split(','));
         var newStimulus = {};
         for(var i = 0; i < headerColumns.length; i++)
            newStimulus[headerColumns[i]] = columnInfo[i];
         results.push(newStimulus);
      }
   });
   return results;
}

function assignContents(design)            // This assigns contents to schematic versions of problems
{
   for(i = 0; i < design.length; i++)
   {
      design[i]["Supposition"]  = "Consider the following:";
      design[i]["QuestionTask"] = "What, if anything, follows?";
   }
   return design;
}

// --------------------------------------------------------------------------------------------------
// 3. Launch experiment
// --------------------------------------------------------------------------------------------------

np.loadStimuli = setupStimuli;
np.launchStudy();