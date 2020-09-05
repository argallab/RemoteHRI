# Code Documentation

The backend is written on top of [Nodus-Ponens](https://www.npmjs.com/package/nodus-ponens) which helps to handle the experimental flow of the application.  However, the package has been updated and therefore is included inside the server code - **NOT** as an npm module.

The server runs off of two main files - the [server](server.js) file and a modified Nodus-Ponens [index.js](nodus-ponens/index.js).

## [Server](server.js)

See source code for further documentation.

### setupStimuli

The setupStimuli function takes in a participant ID (handled by Nodus-Ponens) and reads in an experiment file specifying stimulus to present to the subject and creates a 1D list of stimulus to serve to the subject.

First, the function checks if shuffling of higher level blocks is necessary, and if so, shuffles the blocks.

Then the function checks each block to see if shuffling of the lower level trials is necessary, and if so, shuffles the trials inside of the blocks.

Finally the function takes the preExperiment trials as well as each of the blocks' preTrials, trials, and postTrials stimulus and flattens it into a single list of trials.

Calling the extendJSON function and the assignContents function serves to just add some overhead bookkeeping to the trial data and can be extended to include more meta-level data inside the trial data that is sent to the subject.

# Running the project

To run the server, run 

`npm install nodus-ponens`
`node server.js`

# Deploying the project

Deploying the RemoteHRI server can be done using any server hosting website, or by hosting the server on a organization-owned machine.

One option is to use AWS EC2.  Here are some links to help with this.
[https://ourcodeworld.com/articles/read/977/how-to-deploy-a-node-js-application-on-aws-ec2-server](https://ourcodeworld.com/articles/read/977/how-to-deploy-a-node-js-application-on-aws-ec2-server)
[https://aws.amazon.com/getting-started/hands-on/deploy-nodejs-web-app/](https://aws.amazon.com/getting-started/hands-on/deploy-nodejs-web-app/)

IMPORTANT NOTE: Some changes may need to be made to the ReactJs client in order to correctly send requests to the hosted server, in terms of domain/routes called.  Currently, the ReactJs client is set up to call the localhost server, which will not work in production.  Also, CORS issues may arise, which can be solved by setting the correct request/response headers.

# Data schemas

An example of an experiment schema can be found in [Experiment.json](Experiment.json)

## Experiment (to be read by setupStimuli)

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
shuffleBlocks | boolean | true, false | Indicates whether to shuffle blocks
preExperiment | Array(Stimulus) | N/A | An array of stimulus objects to render at the beginning of the experiment
blocks | Array(Block) | N/A | An array of block objects to render during the experiment

## Block

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
blockName | string | N/A | Name of the block
shuffleTrials | boolean | true, false | Indicates whether to shuffle trials inside the block
preTrials | Array(Stimulus) | N/A | Stimuli to display before the experimental trials (ie, instruction display)
trials | Array(Stimulus) | N/A | Stimuli to display as the experimental trials
postTrials | Array(Stimulus) | N/A | Stimuli to display after the experimental trials (ie, surveys)

## Stimulus

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
stimulusType | string | text-display, continuous-world, grid-world, video, survey, robot-arm | Specifies which type of stimulus this object is

### Text Display (extends Stimulus)

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
text | string | HTML string | An inline-styled HTML string to display.  Quotation marks must be escaped

### Grid World (extends Stimulus)

Note that a coordinate of (0,0) is the top left of the grid.

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
width | int | N/A | Number of cells in a row of the grid
height | int | N/A | Number of rows in the grid
goalLocationX | int | [0, width) | X-coordinate of the goal (0-indexed)
goalLocationY | int | [0, height) | Y-coordinate of the goal (0-indexed)
obstacles | Array(Obstacle) | N/A | Array of obstacles to render in grid world
humanAgent | Robot | N/A | Object specifying starting location of human robot - OPTIONAL (one or both of humanAgent and autonomousAgent must be specified)
autonomousAgent | Robot | N/A | Object specifying starting location of autonomous robot - OPTIONAL (one or both of humanAgent and autonomousAgent must be specified)
tickTime | int | [0, infinity] | Number of milliseconds between updates for autonomous agent and obstacles
visualizeGridLines | boolean | true, false | Controls whether grid lines are visible on the grid world.  Not implemented
instructions | string | N/A | Instructions (displayed in a paragraph HTML tag) for the grid world
postText | string | N/A | Text to display after reaching the goal (displayed in a paragraph HTML tag)


### Video (extends Stimulus)

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
videoLink | string | any URL | Url of video to display
instructions | string | N/A | Instructions for the trial
questions | Array(Question) | N/A | Array of questions to display after the video

### Survey (extends Stimulus)

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
instructions | string | N/A | Main instructions to display for the survey
questions | Array(Question) | N/A | Array of questions to display in the survey

### Continuous World (extends Stimulus)

*Note: this could be extended to have a fixed width/height of the world displayed on the screen, but support a variable coordinate system (ie, 500x500 instead of 750x750) using percentages.*

Locations are given in position of bottom-left corner (closest to (0,0)) - this is different than the Grid World coordinate system.

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
fps | int | N/A | Number of frames to run per second (recommend 60fps)
gridApproximation | int | [1, 3] | Reduction factor of the grid for planning - smaller numbers = more accuracy but larger compute time, default/recommended value is 2
humanAgent | Robot | N/A | Object specifying human robot - OPTIONAL (one or both of humanAgent and autonomousAgent must be specified)
autonomousAgent | Robot | N/A | Object specifying autonomous agent - OPTIONAL (one or both of humanAgent and autonomousAgent must be specified)
obstacles | Array(Obstacle) | N/A | Obstacles to render in the world
goalLocationX | int | [0,750] | X-coordinate of the goal location (bottom-left corner)
goalLocationY | int | [0,750] | Y-coordinate of the goal location (bottom-left corner)
goalWidth | int | [0,750] | Width of the goal
goalHeight | int | [0,750] | Height of the goal
instructions | string | N/A | Instructions (displayed in a paragraph HTML tag) for the continuous world
postText | string | N/A | Text to display after reaching the goal (displayed in a paragraph HTML tag)

### Robotic Arm World (extends Stimulus)

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
links | Array(Link) | N/A | Array specifying characteristics of each link
jointAgularVelocity | float | N/A | Specifies how many radians to rotate joints per frame (NOT per second), recommended value is 0.03
handVelocity | int | N/A | Specifes how many units to move the hand per frame (NOT per second), recommended value is 5
winPositionThreshold | float | [0, 1] | Specifes what percentage of the hand must be inside of the goal for a winning condition, recommended lowest value is 0.95
wallWidth | int | N/A | Specifes how large the walls are
linkHeight | int | N/A | Height of links
linkWidth | int | N/A | Width of links
linkRadius | int | N/A | Corner radius of links
constraintsVisible | bool | true, false | Whether or not to visualize supports, recommended value is false
robotA | int | N/A | Height/width dimension of robot hand
handColor | string | any valid color | Color to render the robot hand
goal | RobotArmGoal | N/A | Object specifying goal characteristics

### Link

Note: eventually, linkHeight, linkWidth, and linkRadius can be moved to this object to allow for variable specification of links, rather than the same for all links as is currently implemented.

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
color | string | any valid color | Color to render the link


### RobotArmGoal

Allows for two ways of specifying location of the goal.  If percent is chosen, x and y represent the percentage location of the goal.  For example a value of x: 80 would mean the goal is placed 80% of the way across the world.  A value of y: 50 would mean the goal is placed 50% of the way down the world.  Regardless of unit, (0,0) is the top left of the world.

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
x | int | N/A | X-coordinate for location of the goal, or percentage location for horizontal placement of the goal
y | int | N/A | Y-coordinate for location of the goal, or percentage location for vertical placement of the goal
theta | int | N/A | Angle of the goal in radians
unit | string | percent, pixel | Determines whether the x and y specifications are in units of percentages or pixels

### Question

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
text | string | N/A | Text of the question to ask
type | string | text, select, slider | Indicates the type of response expected

### Obstacle

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
name (optional) | string | N/A | Name of the obstacle (currently not necessary)
locationX | int | [0, width) | X-coordinate of obstacle (0-indexed) (bottom-left corner)
locationY | int | [0, height) | Y-coordinate of obstacle (0-indexed) (bottom-left corner)
width | int | [0,750] | Width of the obstacle, *only for ContinuousWorld*
height | int | [0,750] | Height of the obstacle, *only for ContinuousWorld*
deltaX | int | N/A | Horizontal velocity of the obstacle (how the x-coordinate should change each iteration) - OPTIONAL
deltaY | int | N/A | Vertical velocity of the obstacle (how the x-coordinate should change each iteration) - OPTIONAL


### Robot

Field Name | Type | Values | Description
---------- | ---- | ------ | -----------
x | int | [0, width) | X-coordinate of the starting robot location (0-indexed)
y | int | [0, height) | Y-coordinate of the starting robot location (0-indexed)
angle | int | N/A | Starting angle of the robot, measured in degrees, positive is clockwise *only for ContinuousWorld*
velocity | int | N/A | Number of units the robot travels in one second *only for ContinuousWorld*
angularVelocity | int | N/A | Number of degrees the robot rotates in one second *only for ContinuousWorld*
width | int | [0, 750] | Width of the robot *only for ContinuousWorld*
height | int | width | Height of the robot, must be square (equal to width) *only for ContinuousWorld*