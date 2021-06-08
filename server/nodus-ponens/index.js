// --------------------------------------------------------------------------------------------------
// Nodus Ponens: A Node.js package for rapid-prototyping high-level cognitive science and reasoning
// experiments.
// --------------------------------------------------------------------------------------------------
// Designed by Sangeet Khemlani
// Copyright (C) 2019 Naval Research Laboratory
// Navy Center of Applied Research in Artificial Intelligence
// https://www.nrl.navy.mil/itd/aic/
// --------------------------------------------------------------------------------------------------
// Contents:
// 0. Setting up the main experiment object, np, and creating a server instance
// 1. Initializing experiment (http://localhost/startExperiment)
// 2. Monitoring experiment session data (http://localhost/showSessionData)
// 3. Returning stimulus information (http://localhost/getNextStimulus)
// 4. Writing participant data to file (http://localhost/endExperiment)
// --------------------------------------------------------------------------------------------------

// import all necessary JS libraries. 
var dateFormat = require("dateformat");
var express = require('express');
var session = require('express-session');
var errorHandler = require('errorhandler')();
var json2csv = require('json2csv');      // This library will turn the JSON stimuli object into a CSV
var fs = require('fs');
var bodyParser = require('body-parser');

function shuffle(array) {
   // Shuffle fn for Javascript
   // Retrieved from: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
   var currentIndex = array.length, temporaryValue, randomIndex;
   // While there remain elements to shuffle...
   while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
   }

   return array;
}

function logData(dataDirectory, sessionData) {
   var experimentData = JSON.parse(JSON.stringify(sessionData));

   var fileName = dataDirectory + "/data-" + experimentData.ExperimentName + "-" + experimentData.ParticipantID
      + "-" + new Date().toISOString().slice(0, 10) + ".json";

   // Write out experiment header information
   fs.writeFileSync(fileName, JSON.stringify(experimentData, null, 2));
}


function setupNodusPonens(startingParticipantID, staticDirectory, dataDirectory) {
   // --------------------------------------------------------------------------------------------------
   // 0. Setting up the main experiment object, np, and creating a server instance
   // --------------------------------------------------------------------------------------------------
   var np = new Object();
   np["app"] = require('express')();
   np["http"] = require('http').Server(np.app);
   np["staticDirectory"] = staticDirectory;
   np["dataDirectory"] = dataDirectory;
   np["displayHeader"] = require("./displayHeader.js");
   np["authors"] = "Anonymous";
   np["experimentName"] = "XX0";
   np["port"] = 3000; //"31337";
   np["randomize"] = shuffle;
   np["launchStudy"] = function () {
      np.app.listen(np.port);
      np.displayHeader(np.experimentName, np.authors, np.port);
   }

   if (startingParticipantID === undefined) { startingParticipantID = 0; }

   // Set session information to allow for multiple people to take study
   np.app.use(session({ secret: "Hume_1748", resave: false, saveUninitialized: true }));
   // Serve up *.html files from "static" folder
   np.app.use('/', express.static(np.staticDirectory));
   np.app.use(function (err, req, res, next) {
      if (app.get('env') === 'development') { return errorHandler(err, req, res, next); }
      else { res.sendStatus(401); }
   });
   np.app.use(bodyParser.urlencoded({ extended: false }));
   np.app.use(bodyParser.json());
   
   np.participantID = startingParticipantID;
   np["updateParticipantID"] = function () { var pID = np.participantID; return np.participantID + 1; };
   np["loadStimuli"] = function () {
      return [{ "Experiment": np.experimentName, "DummyStimulus1": "DummyStimulusData1" },
      { "Experiment": np.experimentName, "DummyStimulus2": "DummyStimulusData2" },
      { "Experiment": np.experimentName, "DummyStimulus3": "DummyStimulusData3" }];
   }

   // --------------------------------------------------------------------------------------------------
   // 1. Initializing experiment
   // --------------------------------------------------------------------------------------------------

   np.app.get("/startExperiment", function (req, res) {
      req.session.sessdata = {};
      Object.keys(require.cache).forEach(function (key) { delete require.cache[key] })
      var sess = req.session;
      sess.sessdata.ExperimentInformationHeader = "ExperimentInformation";
      np.participantID = np.updateParticipantID();
      sess.sessdata.ParticipantID = "P" + np.participantID;
      

      if (req.query.a !== "") { sess.sessdata.Age = req.query.a; }           // Set experiment variables a for age, s- sex, h-hand, r-race
      if (req.query.s !== "") { sess.sessdata.Sex = req.query.s; }
      if (req.query.h !== "") { sess.sessdata.Hand = req.query.h; }
      if (req.query.r !== "") { sess.sessdata.Race = req.query.r; }

      var today = new Date();
      sess.sessdata.StartTime = today.toISOString();
      sess.sessdata.CurrentStimulus = 0;
      sess.sessdata.Stimuli           = np.loadStimuli(np.participantID); // this calls the setUpStimuli in index.js, sess.sessdata.Stimuli is a flattened list containing all the trials (confirm this)? 
      sess.sessdata.ExperimentName = np.experimentName; // loadStimuli will update the experimentName field. 

      req.session = sess;
      console.log(dateFormat(today) + "   Set up experiment for " + sess.sessdata.ParticipantID + "...");
      res.json({ "Data": "Experiment session initialized", "Experiment": np.experimentName, "Time": today.toISOString() });
   });

   // --------------------------------------------------------------------------------------------------
   // 2. Monitoring data
   // --------------------------------------------------------------------------------------------------

   np.app.get("/showSessionData", function (req, res) {
      res.json(req.session.sessdata);
   });

   // --------------------------------------------------------------------------------------------------
   // 3. Returning stimulus information
   // --------------------------------------------------------------------------------------------------

   np.app.post("/getNextStimulus", function (req, res) {
      var sess = req.session;
      var nextStimulus = {};
      var progress = false
   
      if (req.body === undefined)
      {
         res.status(400).json({"message": "Invalid request - no body."})
      } else {
         if (req.body.dumpQuery || !req.body.answer)     // If received signal to dump info or no info,
         {
            if (!req.body.answer) progress = true
            if (req.body.dumpQuery) {
               var currentStimulus = sess.sessdata.CurrentStimulus;
               if (currentStimulus >= 0 && currentStimulus < sess.sessdata.Stimuli.length // if currentStimulus within expected # of stimuli
                  && req.body.answer !== undefined) {

                     if (!sess.sessdata.Stimuli[currentStimulus]["Answer"]) {
                        sess.sessdata.Stimuli[currentStimulus]["Answer"] = {}
                        sess.sessdata.Stimuli[currentStimulus]["Answer"].keypresses = []
                     }
                     sess.sessdata.Stimuli[currentStimulus]["Answer"].keypresses.push(req.body.answer)
                     logData(np.dataDirectory + "/incomplete", sess.sessdata)
               }
            }
            
            //console.log(sess.sessdata.CurrentStimulus)
            //if (sess.sessdata.CurrentStimulus == sess.sessdata.Stimuli.length) // awt [06/03/2021]
            //   nextStimulus = {"Data" : "postExperimentQuestionnaire"}
            if (sess.sessdata.CurrentStimulus >= sess.sessdata.Stimuli.length ) // awt [06/03/2021]
               nextStimulus = { "Data": "Done" };
            else
               nextStimulus = sess.sessdata.Stimuli[sess.sessdata.CurrentStimulus];
         }
         else                                           // Else, if participant provided answer to problem, 
         {
            progress = true     
            var currentStimulus = sess.sessdata.CurrentStimulus;
            if (currentStimulus >= 0 && currentStimulus < sess.sessdata.Stimuli.length
               && req.body.clockTime !== undefined && req.body.answer !== undefined && req.body.latency !== undefined) {
               sess.sessdata.Stimuli[currentStimulus]["ClockTime"] = req.body.clockTime;
               var oldKeypresses
               if (sess.sessdata.Stimuli[currentStimulus]["Answer"] && sess.sessdata.Stimuli[currentStimulus]["Answer"].keypresses && sess.sessdata.Stimuli[currentStimulus]["Answer"].keypresses.length > 0) {
                  oldKeypresses = [...sess.sessdata.Stimuli[currentStimulus]["Answer"].keypresses];
               }

               sess.sessdata.Stimuli[currentStimulus]["Answer"] = req.body.answer;

               if (oldKeypresses) {
                  sess.sessdata.Stimuli[currentStimulus]["Answer"].keypresses = oldKeypresses;
               }


               sess.sessdata.Stimuli[currentStimulus]["Latency"] = req.body.latency;
               sess.sessdata.Stimuli[currentStimulus]["TrialNumber"] = currentStimulus + 1;
               logData(np.dataDirectory + "/incomplete", sess.sessdata);
            }
            sess.sessdata.CurrentStimulus++;
            /* if (currentStimulus + 1 == sess.sessdata.Stimuli.length) // awt [06/03/2021]
               nextStimulus = {"Data" : "postExperimentQuestionnaire"} */
            if (currentStimulus + 1 >= sess.sessdata.Stimuli.length) // awt [06/03/2021] 
               nextStimulus = { "Data": "Done" };
            else
               nextStimulus = sess.sessdata.Stimuli[currentStimulus + 1];
         }
         req.session = sess;
         var returnVal = {
            data: nextStimulus,
            progress: progress
         }
         res.json(returnVal);
      }
   });

   np.app.get("/dumpLogs", function (req, res) {
      // read in data from JSON file
      
      var experimentData = JSON.parse(JSON.stringify(sessionData));

      var fileName = dataDirectory + "/data-" + experimentData.ExperimentName + "-" + experimentData.ParticipantID
         + "-" + new Date().toISOString().slice(0, 10) + ".json";
      
      var existingInformation = JSON.parse(fs.readFileSync(fileName))
      if (existingInformation.Stimuli) {
         if (existingInformation.Stimuli.length === req.session.sessdata.CurrentStimulus) {
            existingInformation.Stimuli.push({})
         }
         if (!existingInformation.Stimuli.Answer.keypresses) {
            existingInformation.Stimuli["Answer"]
         }
      }

      // Write out experiment header information
      fs.writeFileSync(fileName, JSON.stringify(experimentData, null, 2));
   })

   // --------------------------------------------------------------------------------------------------
   // 4. Post-experiment Questionnaire
   // --------------------------------------------------------------------------------------------------

   
/*    np.app.get("/postExperiment", function (req, res) {
      var sess = req.session;
      var today = new Date();

      sess.sessdata.ParticipantID = "P" + np.participantID;
      

      if (req.query.td1 !== "") { sess.sessdata.taskDifficulty1 = req.query.td1; }           // Set experiment variables
      if (req.query.td2 !== "") { sess.sessdata.taskDifficulty1 = req.query.td2; }
      if (req.query.iwr1 !== "") { sess.sessdata.interactionWithRobot1 = req.query.iwr1; }
      if (req.query.iwr2 !== "") { sess.sessdata.interactionWithRobot2 = req.query.iwr2; }
      if (req.query.iwr3 !== "") { sess.sessdata.interactionWithRobot3 = req.query.iwr3; }
      if (req.query.iwr4 !== "") { sess.sessdata.interactionWithRobot4 = req.query.iwr4; }

      var today = new Date();
      //sess.sessdata.StartTime = today.toISOString();
      //sess.sessdata.CurrentStimulus = 0;
      sess.sessdata.Stimuli           = np.loadStimuli(np.participantID); // this calls the setUpStimuli in index.js, sess.sessdata.Stimuli is a flattened list containing all the trials (confirm this)? 
      sess.sessdata.ExperimentName = np.experimentName; // loadStimuli will update the experimentName field. 

      req.session = sess;
      console.log(dateFormat(today) + "   Set up experiment for " + sess.sessdata.ParticipantID + "...");
      res.json({ "Data": "Post-experiment questionnaire completed", "Experiment": np.experimentName, "Time": today.toISOString() });
      
      // Write out experiment header information
      //fs.writeFileSync(fileName, JSON.stringify(experimentData, null, 2));
   });

   np.app.get("/dumpLogs", function (req, res) {
      // read in data from JSON file
      
      var experimentData = JSON.parse(JSON.stringify(sessionData));

      var fileName = dataDirectory + "/data-" + experimentData.ExperimentName + "-" + experimentData.ParticipantID
         + "-" + new Date().toISOString().slice(0, 10) + ".json";
      
      var existingInformation = JSON.parse(fs.readFileSync(fileName))
      if (existingInformation.Stimuli) {
         if (existingInformation.Stimuli.length === req.session.sessdata.CurrentStimulus) {
            existingInformation.Stimuli.push({})
         }
         if (!existingInformation.Stimuli.Answer.keypresses) {
            existingInformation.Stimuli["Answer"]
         }
      }

      // Write out experiment header information
      fs.writeFileSync(fileName, JSON.stringify(experimentData, null, 2));
   }) */
   

   

   // --------------------------------------------------------------------------------------------------
   // 5. Writing participant data to file
   // --------------------------------------------------------------------------------------------------

   np.app.get("/endExperiment", function (req, res) {
      var sess = req.session;
      var today = new Date();
      if (sess.sessdata)                                                  // Write session data to file,
      {                                                                        // then destroy session.
         sess.sessdata.EndTime = today.toISOString();
         logData(np.dataDirectory, sess.sessdata);
         console.log(dateFormat(today) + "       ...completed experiment for "
            + sess.sessdata.ParticipantID + ".");
         var fileName = np.dataDirectory + "/incomplete/data-" + sess.sessdata.ExperimentName + "-" + sess.sessdata.ParticipantID
            + "-" + new Date().toISOString().slice(0, 10) + ".csv";
         rm("-Rf", fileName);
         sess.destroy();                                                       // Destroy session data
      }
      res.json({ "Data": "Experiment session terminated", "Experiment": np.experimentName, "Time": today.toISOString() });
   });

   return np;
}

module.exports = setupNodusPonens;