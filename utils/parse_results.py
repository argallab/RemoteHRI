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
import pickle as pkl

# currently using hardcoded placeholders;
# TODO: ascertain these by reading them from top rows of parser's target json
num_train_blocks = 1
num_train_trials = 12
num_test_blocks=1
num_test_trials = 12

# current .json format (03/10/2021):
# ['ExperimentInformationHeader', 'ParticipantID', 'Age', 'Sex', 'Hand',
#  'Race', 'StartTime', 'CurrentStimulus', 'Stimuli', 'ExperimentName',
#  'EndTime'] x [N_trials]
dpath = '../server/data/data-Grid World Experiment (Continuous)-P1-2021-05-26.json' # '../server/data/data-Grid World Experiment (Continuous)-P1-2021-01-17.json'

# this returns an over-arching dataframe (details within trials are omitted)
#df = pd.read_json(dpath, orient='records')
#print(df)
#print(df.columns)

# export the dataframe to a csv
#df.to_csv('parsed_data/demo_parse.csv')

#print(df.info)

#print(df[df.keys()])

#df1 = json.loads(dpath)

#print(df1)


# this returns a complete dict; needs to be restructured for ease of use
with open(dpath, "r") as read_json:
    df2 = json.load(read_json)

master_dict = collections.OrderedDict()
print(master_dict)
#df1_formatted = json.dumps(df1)
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

# make different scopes of .json into easily callable objects
participant = df2['ParticipantID']
numroundstop = df2['CurrentStimulus']
starttime = df2['StartTime']
phase = df2['Stimuli'][0]['blockType']
stimtype = df2['Stimuli'][0]['stimulusType']
fps = df2['Stimuli'][0]['fps']

worldw = df2['Stimuli'][0]['worldWidth']
worldh = df2['Stimuli'][0]['worldHeight']
userspecs = df2['Stimuli'][0]['humanAgent']
goalw = df2['Stimuli'][0]['goalWidth']
goalh = df2['Stimuli'][0]['goalHeight']
goaltheta = df2['Stimuli'][0]['goalLocationAngle']
goallocx = df2['Stimuli'][0]['goalLocationX']
goallocy = df2['Stimuli'][0]['goalLocationY']
#roundtype = df2['Stimuli'][0]['TrialHeader']


df2stim = df2['Stimuli']#[0]['trialIndex']
#print(df2stim)
trialidx = []

#print(participant)

## initial experiment header to be added at top of master_dict
master_dict = {'participantID' : participant,
                   'startTime' : starttime,
                   'stimuli' : {}
                   #'blockType' : phase,
                   #'fps' : fps,
                   #'worldWidth' : worldw,
                   #'worldHeight' : worldh,
                   #'userSpecs' : userspecs
                }
print(master_dict)

#master_dict['participantID'] = participant
#master_dict['currentStimulus'] = numroundstop
#master_dict['startTime'] = starttime
#master_dict['blockType'] = phase
#master_dict['stimulusType'] = stimtype
#aster_dict['fps'] = fps

#master_dict['worldWidth'] = worldw
#master_dict['worldHeight'] = worldh
#master_dict['userSpecs'] = user_specs
#master_dict['goalW'] = goalw
#master_dict['goalH'] = goalh
#master_dict['goalTheta'] = goaltheta
#master_dict['goalLocX'] = goallocx
#master_dict['goalLocY'] = goallocy

#master_dict['df2Stim'] = df2stim

#print(master_dict)

#str_check = json.dumps(master_dict)
#print(str_check)

#print(len(df2stim))
#print(len(df2stim[25]))
#print(len(df2stim[25].keys()))


for n in range(0, len(df2stim)):
    print('\n')
    for key in df2stim[n].keys():
        #print(n)
        print('>>>>' + str(key))
        #print(df2stim[n][key])
        if key != 'Answer' and key != 'humanAgent':
            master_dict['stimuli'][key] = df2stim[n][key]
        else:
            print('\n')
            for anskey in df2stim[n][key].keys():
                print('>>>\t\t' + str(anskey)+ '\n')
                if anskey == 'keypresses':
                    print('>>\t\t\t\t' + str(anskey))
                    #for kpkey in df2stim[n][key][anskey].keys():
                    #    print('>\t\t\t\t\t\t' + str(kpkey))
                    #    if kpkey == 'keypresses':
                    #        master_dict['stimuli'][key][anskey][kpkey] = df2stim[n][key][kpkey]
                    #    else:
                    #        master_dict['stimuli'][key] = df2stim[n][key][anskey]
                    print('look out! ' + str(df2stim[n][key][anskey]))
                    kp_size1 = len(df2stim[n][key][anskey])
                    print('\t\t\t\t\t\tlength of keypresses list outer: ' + str(kp_size1))

                    kpk2_count_array = {}
                    kpk2_count_total = 0
                    for kpk2_count in range(0, kp_size1):
                        kpk2_count_array[kpk2_count] = len(df2stim[n][key][anskey][kpk2_count])
                        kpk2_count_total += kpk2_count_array[kpk2_count]
                    #print(kpk2_count_array)
                    kp_size2 = len(df2stim[n][key][anskey][0]) # make kp_size2 more robust to spillover in final kp_size1 bracket # TODO: are these brackets meaningful or just based on data packet limits?
                    print('\t\t\t\t\t\tlength of keypresses list inner: ' + str(kpk2_count_array))
                    #master_dict['stimuli'][key][anskey] = {'state' : np.zeros(kpk2_count_total), 'time' : np.zeros(kpk2_count_total)} #df2stim[n][key][anskey]
                    master_dict['stimuli'][key][anskey] = {'state' : {'x' : [], 'y': [], 'theta': [], 'xv' : [], 'yv' : [], 'tv' : [], 'lv' : []},
                                                           'time' : []} #df2stim[n][key][anskey]

                    #print('\t\t\t\t\t\t' + str(master_dict['stimuli'][key][anskey]))
                    kpkey_iter = 0
                    for kpkey1 in range(0, kp_size1):#df2stim[n][key][anskey][0]:
                        kp_size2 = kpk2_count_array[kpkey1]                        
                        for kpkey2 in range(0, kp_size2):
                            #if kpkey1 == kp_size1 - 1:
                            #    kpkey2_last = kpk2_count_array[kp_size1]
                                # last bracket case w/ spillover keypresses


                            #else:
                            
                            print('\t\t\t\t\t\t> kpk1: ' + str(kpkey1) + '; kpk2: ' + str(kpkey2))
                            #print(df2stim[n][key][anskey][0][kpkey])
                            # TODO: fix the use of kpkey below
                            
                            #print(df2stim[n][key][anskey])#[kpkey2])#['human'])
                            #print(df2stim[n][key][anskey])#[kpkey2])#['time'])
                            #print(df2stim[n][key][anskey]['state'])#[kpkey1])#[kpkey2])#['human'])
                            #print(df2stim[n][key][anskey]['time'])#[kpkey1])#[kpkey2])#['time'])
                            
                            print('look out! ' + str(df2stim[n][key][anskey]))
                            #print(df2stim[n][key][anskey][kpkey1][kpkey2])

                            if not kpkey_iter in master_dict['stimuli'][key][anskey]['state'].keys():
                                master_dict['stimuli'][key][anskey]['state'][kpkey_iter] = {}
                            #if not kpkey_iter in master_dict['stimuli'][key][anskey]['time'].keys():
                            #    master_dict['stimuli'][key][anskey]['state'][kpkey_iter] = {}
                            master_dict['stimuli'][key][anskey]['state'][kpkey_iter] = df2stim[n][key][anskey][kpkey1][kpkey2]['human']
                            master_dict['stimuli'][key][anskey]['time'][kpkey_iter] = df2stim[n][key][anskey][kpkey1][kpkey2]['time']
                            print(master_dict['stimuli'][key][anskey]['state'][kpkey_iter])
                            print(master_dict['stimuli'][key][anskey]['time'][kpkey_iter])
                            kpkey_iter += 1




                   # for kpkey in range(0, kp_size2):#df2stim[n][key][anskey][0]:
                   #     print('\t\t\t\t\t\t>' + str(kpkey))
                   #     print(df2stim[n][key][anskey][0][kpkey])
                        
                   #    master_dict['stimuli'][key][anskey][kpkey]['state'] = df2stim[n][key][anskey][0][kpkey]['human']
                   #    master_dict['stimuli'][key][anskey][kpkey]['time'] = df2stim[n][key][anskey][0][kpkey]['time'] 


                else:
                    master_dict['stimuli'][key] = df2stim[n][key]
                #master_dict[key][anskey] = df2stim[n][key][anskey]
                #master_dict[key]['keyPresses'] = df2stim[n]['keypresses']
            #print(df2stim[n])
        #print(df2stim[n]['trialIndex']) # this equals n (?)
        #trialidx.append(df2stim[n]['trialIndex'])

#print(master_dict)

for n in range(0, len(df2stim)):
    for key in df2stim[n].keys():
        #print(n)
        #print(key)
        #print(df2stim[n]['trialIndex']) # this equals n (?)
        trialidx.append(df2stim[n]['trialIndex'])

#print(trialidx)




'''
df = pd.DataFrame({'participantID' : participant,
                   'startTime' : starttime,
                   'blockType' : phase,
                   'fps' : fps,
                   'worldWidth' : worldw,
                   'worldHeight' : worldh,
                   'goalTheta' : goaltheta,
                   'goalLocX' : goallocx,
                   'goalLocY' : goallocy,
                   'userSpecs' : {'a' : 5, 'b' : 10},
                   'grumbleSpecs' : {'gr' : 6, 'grrr' : 11}



})

abc = df.head()
print(abc)
'''
#trialidx = df2['Stimuli'][:]['trialIndex']
#answer = df2['Stimuli'][0]['Answer'] # ['start', 'keypresses', 'end']

with open('parse_results.json', 'w') as json_file:
    json.dump(master_dict, json_file)




#print(df2['ParticipantID'])
#print(trialidx)
#print(trialidx)
#print()
#print(answer)
