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
var cors             = require('cors');
var staticDirectory  = path.resolve("static");              // Set directory of static HTML+CSS files
var dataDirectory    = path.resolve("data");              // Set directory where data will be written
var participantIndex = 0;                            // Start participant numbering at this value + 1

var np               = require("./nodus-ponens")(participantIndex, staticDirectory, dataDirectory);
np.authors           = "Authors";
np.experimentName    = "Test Experiment";
np.port              = 3003;

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
   var res    = JSON.parse(fs.readFileSync('./Experiment.json').toString());           // read design into CSV string
   
   // shuffle stimuli, if neccessary
   if (res.shuffleBlocks)
   {
      res.blocks = np.randomize(res.blocks)
   }

   for (var i = 0; i < res.blocks.length; i++)
   {
      if (res.blocks[i].shuffleTrials)
      {
         res.blocks[i].trials = np.randomize(res.blocks[i].trials)
      }
   }


   // flatten blocks into list of stimuli
   var stimuliList = []
   for (var i = 0; i < res.blocks.length; i++)
   {
      for (var j = 0; j < res.blocks[i].trials.length; j++)
      {
         stimuliList.push(res.blocks[i].trials[j])
      }

      for (var k = 0; k < res.blocks[i].postTrials.length; k++)
      {
         stimuliList.push(res.blocks[i].postTrials[k])
      }
   }

   var design  = extendJSON(stimuliList, PID);                    // add fields to each stimuli object

   var stimuli = assignContents(design);   // assign contents to the different problems in the design
   return stimuli;             // To randomize the order of the stimuli, return np.randomize(stimuli)
}

function extendJSON(obj, PID)               // This fn imports any CSV "Design" file as a JSON object
{                                                             // and adds some columns for R analyses
   var results = obj;
   for (var i = 0; i < results.length; i++)
   {
      results[i]["ParticipantID"] = "P" + PID;
      results[i]["ClockTime"] = new Date().toISOString();
      results[i]["TrialHeader"] = "Trial";
   }

   return results;
}

function assignContents(design)            // This assigns contents to schematic versions of problems
{
   /*
   for(i = 0; i < design.length; i++)
   {
      design[i]["Supposition"]  = "Consider the following:";
      design[i]["QuestionTask"] = "What, if anything, follows?";
   }
   */
   return design;
}


// --------------------------------------------------------------------------------------------------
// 3. Extra routes
// --------------------------------------------------------------------------------------------------

var corsOptions = {
   origin: "http://localhost:3001"
}
np.app.use(cors(corsOptions))

np.app.get("/hello", (req, res) => {
   res.json({"message": "hello"})
})


// --------------------------------------------------------------------------------------------------
// 4. Launch experiment
// --------------------------------------------------------------------------------------------------

np.loadStimuli = setupStimuli;
np.launchStudy();