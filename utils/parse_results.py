#!/usr/bin/env python
# -*- coding: utf-8 -*-
import collections
import json
import argparse
import os
import itertools
import random
import requests
import numpy as np
import pandas as pd

# currently using hardcoded placeholders;
# TODO: ascertain these by reading them from top rows of parser's target json
num_train_blocks = 0
num_train_trials = 8
num_test_blocks=1
num_test_trials = 8

# current .json format (03/10/2021):
# ['ExperimentInformationHeader', 'ParticipantID', 'Age', 'Sex', 'Hand',
#  'Race', 'StartTime', 'CurrentStimulus', 'Stimuli', 'ExperimentName',
#  'EndTime'] x [N_trials]
dpath = '../server/data/data-Grid World Experiment (Continuous)-P2-2021-03-11.json' # '../server/data/data-Grid World Experiment (Continuous)-P1-2021-01-17.json'

# this returns an over-arching dataframe (details within trials are omitted)
#df = pd.read_json(dpath, orient='records')
#print(df)
#print(df.columns)

# export the dataframe to a csv
#df.to_csv('parsed_data/demo_parse.csv')

#print(df.info)

#print(df[df.keys()])



# this returns a complete dict; needs to be restructured for ease of use
with open(dpath, "r") as read_json:
    df2 = json.load(read_json)

master_dict = collections.OrderedDict()

#print(df2)
#print(df2['ExperimentInformationHeader']) # where does this get assigned (?)


#print(df2['Age']) # from initial questionnaire
#print(df2['Sex']) # from initial questionnaire
#print(df2['Hand']) # from initial questionnaire
#print(df2['Race']) # from initial questionnaire
#print(df2['StartTime']) # YYYY-MM-DDT##:##:##.###Z
#print(df2['CurrentStimulus']) # returns a number corresponding to motion primitive/trial number (?)
#print(df2['Stimuli']) # all control information (timeseries)
#print(df2['ExperimentName']) # Grid World Experiment (Continuous)

#print(df2)

#df3 = pd.DataFrame.from_dict(df2)
#print(df3)

#print(df2['Stimuli']['stimulusType'])


participant = df2['ParticipantID']
numroundstop = df2['CurrentStimulus']
stimtype = df2['Stimuli'][0]['stimulusType']

worldw = df2['Stimuli'][0]['worldWidth']
worldh = df2['Stimuli'][0]['worldHeight']
user_specs = df2['Stimuli'][0]['humanAgent']
goalw = df2['Stimuli'][0]['goalWidth']
goalh = df2['Stimuli'][0]['goalHeight']
goaltheta = df2['Stimuli'][0]['goalLocationAngle']
goallocx = df2['Stimuli'][0]['goalLocationX']
goallocy = df2['Stimuli'][0]['goalLocationY']
roundtype = df2['Stimuli'][0]['TrialHeader']

df2stim = df2['Stimuli']#[0]['trialIndex']
print(df2stim)
trialidx = []

for n in range(0, len(df2stim)):
    for key in df2stim[n].keys():
        trialidx.append(df2stim[n]['trialIndex'])
        
#trialidx = df2['Stimuli'][:]['trialIndex']
#answer = df2['Stimuli'][0]['Answer'] # ['start', 'keypresses', 'end']

print(df2['ParticipantID']) # where does this get assigned (?)
#print(trialidx)
print(trialidx)
#print()
#print(answer)
