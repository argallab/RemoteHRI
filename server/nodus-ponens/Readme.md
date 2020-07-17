# nodus-ponens

A light, full-stack framework for running high-level reasoning and cognitive science experiments in Node.js.

## Bug fixes

* Added ability to save incomplete data
* Added compatibility for Windows line-endings (caught by J. Korman)
* Added new fn, hideProblem(), in showStimuli
* Fixed checkbox bugs (caught by J. Korman)
* Fixed logging errors (caught by J. Korman)
* Eliminated references to external image files
* Fixed slider value error (caught by J. Korman)
* Fixed errors in documentation specification (caught by Z. Horne)
* Created hanging indentation for radio- and choice-tasks

## Preliminary Setup

```bash
$ sudo npm install -g shelljs       # nodus-ponens requires global installation of "shelljs"
```

## Quick Start Guide
nodus-ponens is a full-stack framework for running high-level cognitive science experiments. It comes bundled with a fully-functional experiment template. To set the experiment up, run as follows:

```bash
$ mkdir temp
$ cd temp
$ npm install nodus-ponens
$ npm explore nodus-ponens -- npm run-script create-template
$ node main.js
```

The framework will launch a server-side monitoring console (in the terminal), and the experiment can then be viewed at `http://localhost:55151`.

## Usage

```js
var path             = require("path");
var fs               = require('fs');
var staticDirectory  = path.resolve("static");              // Set directory of static HTML+CSS files
var dataDirectory    = path.resolve("data");              // Set directory where data will be written
var participantIndex = 0;                            // Start participant numbering at this value + 1

var np               = require("nodus-ponens")(participantIndex, staticDirectory, dataDirectory);
np.authors           = "Authors";
np.experimentName    = "Template1";
np.port              = 55151;

// Note: The user has to define the function np.loadStimuli() that is intended to take a
// participant's ID number (an integer) as input and return an array of objects representing the
// stimuli catered to that participant. The function allows users to define stimuli directly, read
// stimuli from an external file, or pull stimuli from other resources. In the template file included
// with the experiment (see Quick Start Guide above), the function "setupStimuli" serves this purpose
// by importing experimental stimuli from a CSV file. Supposing that the user successfully defines
// this function, the nodus-ponens setup proceeds as follows:

function setupStimuli(PID)          // Takes integer input and returns stimuli as set of JSON objects
{
   /* Write appropriate stimuli generation code here ... */
   return stimuli;             // To randomize the order of the stimuli, return np.randomize(stimuli)
}

np.loadStimuli = setupStimuli;
np.launchStudy();
```
## License

(c) 2019 Sangeet Khemlani, http://www.khemlani.net/, Creative Commons License.