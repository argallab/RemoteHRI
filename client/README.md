# Code Documentation

## Overall Structure

The entry point to the application is [App.js](src/App.js).  All this component does is render the [Content component](src/Content.js), which takes care of all the experimental flow logic.  The Content component uses components that are placed in the src/components directory.  These components mostly represent individually stimuli, or small sections of stimuli.  The components for each stimuli are organized into the ActiveStimulus and PassiveStimulus folders.  The PreExperimentForm component and LoadingScreen component are used regardless of what stimuli are present in the experiment.  The Responses components are used for soliciting form responses from the subjects.

## [Content.js](src/Content.js)

This component can be considered the "motherboard" of the application.  It is the central point that communicates with the server to get trials, and then forwards data to child components to render individual stimuli, and finally receives subject data from the child components to send back to the server to save the experimental data.

On mount, Content requests the server for the name of the experiment.  This serves the purpose of establishing a connection with the server as well as getting the name to show on the PreExperimentForm page.

Content also contains a function API for the server, including startExperiment, endExperiment, checkSessionData, and getNextStimulus.  Each of these functions directly relates to a [Nodus-Ponens](https://www.npmjs.com/package/nodus-ponens) function that deals with the corresponding experimental flow actions.  After calling these server routes, Content takes the returned data and saves it in state.  **Note that currently, there is no handling of server error codes.  For example, if the server responds with 404 or 500, the user will see no change on the screen and will be stuck on the LoadingScreen component forever.**

In Content's state, there are various boolean flags indicating the progress of the experiment's loading from the server in order to render the correct components during the various stages.  The use of the flags can be found in Content's render method.

Content determines what component to render based on the stimulusType property in the trial json data sent from the server.

## Adding new stimuli

Adding a new stimulus type to the application is simple.  Create a React component for the stimulus inside of src/components.  In addition to any functions necessary for the rendering/managment of the stimulus, implement componentDidMount and an onSubmit function.

The componentDidMount function should take in a prop called data, and set corresponding values of this prop in state for the new stimulus component to manage.  Also, initialize start - a timestamp marking the start of displaying the stimulus to the user which is used for timing purposes.

The onSubmit function compiles a dictionary variable that contains three fields - start, answers, and end.  The start field should just be the start timestamp inintialized in componentDidMount.  The answers field can contain any data needed/collected by the stimulus.  The end field should be a new timestamp marking the end of displaying the stimulus to the user, which is also used for timing purposes in conjunction with start.  Then call this.props.submit(YOUR_VARIABLE).

Then import the component inside of Content, and add another else-if condition to the switch statement for this component.  Then pass the trialIndex in as a key so that the component will take in the correct trialData object, then pass the trialData object in state for as the data prop, and this.getNextTrial for the submit prop.

See the [Survey stimulus](src/components/PassiveStimulus/Survey/index.js) for a simple implementation of a stimulus component.

# Running the project

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

