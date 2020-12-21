// --------------------------------------------------------------------------------------------------
// "displayHeader.js" is called from "index.js"
// --------------------------------------------------------------------------------------------------

var fs         = require('fs');
var shell      = require('shelljs/global');
var dateFormat = require("dateformat");

function displayHeader(experimentName, authors, port)
{
   var hostname = "http://";
   if (exec('curl -s http://instance-data.ec2.internal/latest/meta-data/public-hostname -o ./hostname.txt >/dev/null 2>&1').code == 0)
   {
     hostname += fs.readFileSync('./hostname.txt').toString();
     rm('-rf', './hostname.txt');
   }

   if(hostname == "http://") { hostname += "localhost"; }

   console.reset = function () { return process.stdout.write('\033c'); }
  //  console.reset();
   console.log("-----------------------------------------------------------------")
   console.log("Nodus Ponens: High-level cognitive science experiments in Node.js\n")
   console.log("   Designed by Sangeet Khemlani")
   console.log("   Copyright (C) 2019 Naval Research Laboratory")
   console.log("   Navy Center of Applied Research in Artificial Intelligence")
   console.log("   https://www.nrl.navy.mil/itd/aic/\n")
   console.log("   Experiment: " + experimentName);
   console.log("      Authors: " + authors);
   console.log("     Hostname: " + hostname + ":" + port + "\n");
   console.log("-----------------------------------------------------------------")
   console.log("Timestamp                  Participant trace")
   console.log("------------------------   --------------------------------------")
   console.log(dateFormat(new Date()) + "   Experiment initialized and running.")
}

module.exports = displayHeader;