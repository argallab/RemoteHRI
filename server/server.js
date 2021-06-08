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

// var supnp               = require("./nodus-ponens");//(participantIndex, staticDirectory, dataDirectory);
// np = new supnp(participantIndex, staticDirectory, dataDirectory);
var np               = require("./nodus-ponens")(participantIndex, staticDirectory, dataDirectory); //this line is a concise way of invoking the constructor (commented out lines in line 32 and 33 shows the long way)
np.authors           = "Authors";
np.experimentName    = "Test Experiment";
np.port              = 3003;

// run command node server.js FILENAME
const args = process.argv.slice(2) // slice out the first words in the command line string
exp_json_file = args[0]
console.log('Experiment JSON FILENAME - ', exp_json_file)

// --------------------------------------------------------------------------------------------------
// 2. Setup stimuli
// --------------------------------------------------------------------------------------------------
// Note: nodus-ponens has a special function called "loadStimuli" that is intended to take a
// participant's ID number (an integer) as input and return an array of objects representing the
// stimuli catered to that participant. In the code below, "setupStimuli" serves that purpose, and
// it calls a bunch of helper functions to do its job, e.g., "CSVtoJSON" and "assignContents". Hence
// after defining "setupStimuli", "CSVtoJSON", and "assignContents", the code sets np.loadStimuli to
// "setupStimuli".

function setupStimuli(PID) // PID refers to ParticipantID
{
   var res    = JSON.parse(fs.readFileSync(exp_json_file).toString());           // read the experiment design into CSV string
   // shuffle stimuli, if neccessary
   if (res.experimentName)
      np.experimentName = res.experimentName // how to add checks for whether the field exists

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
   if (res.preExperiment) {
      for (var i = 0; i < res.preExperiment.length; i++)
      {
         stimuliList.push(res.preExperiment[i])
      }
   }


   if (res.blocks) {
      for (var i = 0; i < res.blocks.length; i++)
      {
         var obj = {}
         if (res.blocks[i].preTrials){
            for (var l = 0; l < res.blocks[i].preTrials.length; l++)
            {
               obj = res.blocks[i].preTrials[l]
               obj["blockName"] = res.blocks[i].blockName
               stimuliList.push(obj)
            }
         }
 
   
         for (var j = 0; j < res.blocks[i].trials.length; j++)
         {
            obj = res.blocks[i].trials[j]
            obj["blockName"] = res.blocks[i].blockName
            stimuliList.push(obj)
         }
   
         if (res.blocks[i].postTrials) {
            for (var k = 0; k < res.blocks[i].postTrials.length; k++)
            {
               obj = res.blocks[i].postTrials[k]
               obj["blockName"] = res.blocks[i].blockName
               stimuliList.push(obj)
            }
         }

      }
   }
  

   var design  = extendJSON(stimuliList, PID);                    // add fields to each stimuli object
   var stimuli = assignContents(design);   // assign contents to the different problems in the design
   
   return stimuli;             // To randomize the order of the stimuli, return np.randomize(stimuli)
}

function extendJSON(obj, PID)               // This fn imports any CSV "Design" file as a JSON object
{                                                             // and adds some columns for R analyses
   var results = obj;
   for (var i = 0; i < results.length; i++) // for each element in the stimuli list add PID, clocktime and trial header. 
   {
      results[i]["ParticipantID"] = "P" + PID;
      results[i]["ClockTime"] = new Date().toISOString();
      results[i]["TrialHeader"] = "Trial";
      // results[i]["trialIndex"] = i // I think if we do this write here, then we can avoid assignContents(design) function call.
   }

   return results;
}

function assignContents(design)            // This assigns contents to schematic versions of problems
{
   for(i = 0; i < design.length; i++)
   {
      design[i]["trialIndex"]  = i
   }
   
   return design;
}


// --------------------------------------------------------------------------------------------------
// 3. Extra routes
// --------------------------------------------------------------------------------------------------

var corsOptions = {
   origin: "http://andrew-reactjs-test.s3-website.us-east-2.amazonaws.com/" //"http://localhost:3001" // TODO: s3 link (?)
}
np.app.use(cors(corsOptions))

np.app.get("/getExperimentName", (req, res) => {
   res.json({"name": np.experimentName}) // potentially need to update the experiment name from experiment.json
})




// --------------------------------------------------------------------------------------------------
// 4. Launch experiment
// --------------------------------------------------------------------------------------------------

np.loadStimuli = setupStimuli;
np.launchStudy();