// --------------------------------------------------------------------------------------------------
// nodusponens-jQ-API.js is called from "showStimuli.html" 
// --------------------------------------------------------------------------------------------------
// Contents
// 1. Setup document showStimuli.html
// 2. Server interaction
// 3. Functions for displaying and resetting problem and task
// 4. Functions for collecting task responses and setting task information
// 5. Utilities
// --------------------------------------------------------------------------------------------------

var trialNumber = 0; // Keeps track of number of trials completed
var startTime;
var endTime;

// --------------------------------------------------------------------------------------------------
// 1. Setup document showStimuli.html
// --------------------------------------------------------------------------------------------------

$(document).ready(function()              // Sets up slider and button functionality, calls server to
    {                                                                        // get initial stimulus.
        var handle = $("#slider-handle");
        $("#slider").slider({
            value: 50,
            create: function() {
                handle.text($(this).slider("value") + "%");
            },
            slide: function(event, ui) {
                handle.text(ui.value + "%");
            }
        });
        $("input[type=submit], a, button").button().click(function(event) {
            event.preventDefault();
        });
        callServer(false);           // Calls server to get first stimulus as soon as the page loads;
    });                              // argument false ensures that the backend JS won't log anything

// --------------------------------------------------------------------------------------------------
// 2. Server interaction
// --------------------------------------------------------------------------------------------------

function callServer(answer)                                   // Calls server to get stimulus objects
{
    var latency = (endTime - startTime) / 1000;                     // Calculates latency client-side
    if (latency < latencyMinimum)
	{                                  // Create a "modal dialog" in jQuery, built from "message" div
        $("#message").dialog({
            modal: true,
            dialogClass: 'no-close success-dialog',
            buttons: { Okay: function() { $(this).dialog("close"); }}});
    }
	else
	{
        trialNumber++;
		hideProblem();                                  // hideProblem is defined in showStimuli.html
		
        var url = "./getNextStimulus";         // Add real info as queries if response = something... 
        if (answer || typeof(answer)=="number") {
            url += "?answer=" + answer + "&latency=" + latency +
                "&clockTime=" + new Date().toISOString();
        }
		else {  url += "?dumpQuery=dumpThisInformation"; }           //...but if not, send dummy info
        $.getJSON(url, function(data) {
            if (data.Data == "Done") {
                window.location = "terminateDebrief.html";
            }
			else { displayProblem(data); }           // displayProblem is defined in showStimuli.html
        });
    }
}

// --------------------------------------------------------------------------------------------------
// 3. Functions for displaying and resetting problem and task
// --------------------------------------------------------------------------------------------------

function showProblemInfo(seconds) {
	setTimeout(function(){ $('#problem-info').fadeIn(fadeTime*1000);
                           $('#fixation-cross').hide(); },
	           seconds*1000);
}

function showTask(seconds) {
	setTimeout(function(){ $('#' + task).fadeIn(fadeTime*1000);
	    		           startTime = $.now(); },
	           seconds*1000);
}

function resetTask(task) {
    switch (task) {
        case "YN-task":
            if (Math.random(1.0) > 0.5) {
                setAFC('#YN-option1', "Yes");
                setAFC('#YN-option2', "No");
            } else {
                setAFC('#YN-option1', "No");
                setAFC('#YN-option2', "Yes");
            }
            break;
        case "2AFC-task":
            setAFC('#2AFC-option1', "option-1-reset");
            setAFC('#2AFC-option2', "option-2-reset");
            break;
        case "3AFC-task":
            setAFC('#3AFC-option1', "option-1-reset");
            setAFC('#3AFC-option2', "option-2-reset");
            setAFC('#3AFC-option3', "option-3-reset");
            break;
        case "slider-task":
            setSlider(50);
            break;
        case "radio-task":
            $('input[name="radio-task-buttons"]').attr('checked', false);
            setRadio("#radio-1", "radio-value-1-reset");
            setRadio("#radio-2", "radio-value-2-reset");
            setRadio("#radio-3", "radio-value-3-reset");
            break;
        case "checkbox-task":
            $('input[name="checkbox-task-buttons"]').attr('checked', false);
            setCheck("#checkbox-1", "check-value-1-reset");
            setCheck("#checkbox-2", "check-value-2-reset");
            setCheck("#checkbox-3", "check-value-3-reset");
            setCheck("#checkbox-4", "check-value-4-reset");
            setCheck("#checkbox-5", "check-value-5-reset");
            break;
        case "freeresponse-task":
            setFreeResponse("");
            break;
        case "sentencecompletion-task":
            setSentenceCompletion("");
            break;
    }
}

// --------------------------------------------------------------------------------------------------
// 4. Functions for collecting task responses and setting task information
// --------------------------------------------------------------------------------------------------

function respondAFC(option) {
    endTime = $.now();
    callServer($(option).val());
}

function setAFC(option, value) {
    $(option).html(value);
    $(option).val(value);
}

function respondSlider(option) {
    endTime = $.now();
    callServer($("#slider").slider("value"));
}

function setSlider(value) {
    $("#slider").slider("value", value);
    $("#slider-handle").text(value + "%");
}

function respondRadio() {
    endTime = $.now();
    var selected = $("#radio-task input[type='radio']:checked");
    callServer($("label[for='" + selected.attr("id") + "']").text());
}

function setRadio(option, value) {
    $("label[for='" + $(option).attr("id") + "']").text(value);
}

function respondCheck() {
    endTime = $.now();
    var selected = $("#checkbox-task input[type='checkbox']:checked");
    var selectedText = "";
    if(selected.length > 0)
    {
        for(var i = 0; i < selected.length; i++)
        {
            selectedText += $("label[for='" + selected[i]["id"] + "']").text() + "|";
        }
        callServer(selectedText);
    }
    else
    {
         $("#message").dialog({ modal: true, dialogClass: 'no-close success-dialog',
                             buttons: { Okay: function() { $( this ).dialog( "close" ); }}});
    }
}

function setCheck(option, value) {
    $("label[for='" + $(option).attr("id") + "']").text(value);
}

function respondFreeResponse() {
    endTime = $.now();
    callServer($("#freeresponse").val());
}

function setFreeResponse(value) {
    $("#freeresponse").val(value);
}

function respondSentenceCompletion() {
    endTime = $.now();
    callServer($("#completion").val());
}

function setSentenceCompletion(value) {
    $("#completion").val(value);
}

// --------------------------------------------------------------------------------------------------
// 5. Utilities
// --------------------------------------------------------------------------------------------------

function randomize(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;
    while (0 !== currentIndex) {                         // While there remain elements to shuffle...
        randomIndex = Math.floor(Math.random() * currentIndex);        // Pick a remaining element...
        currentIndex -= 1;
        temporaryValue = array[currentIndex];             // ...and swap it with the current element.
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}