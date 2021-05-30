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
#num_train_blocks = 1
#num_train_trials = 12
#num_test_blocks= 1
#num_test_trials = 12

# current .json format (03/10/2021):
# ['ExperimentInformationHeader', 'ParticipantID', 'Age', 'Sex', 'Hand',
#  'Race', 'StartTime', 'CurrentStimulus', 'Stimuli', 'ExperimentName',
#  'EndTime'] x [N_trials]
#dpath = '../server/data/complete_new/'#data-Grid World Experiment (Continuous)-P1-2021-05-26.json' # '../server/data/data-Grid World Experiment (Continuous)-P1-2021-01-17.json'
#fp_list = []
#for root, directories, files in os.walk(dpath):
#    for filename in files:
#        fp_tmp = os.path.join(root, filename)
#        fp_list.append(fp_tmp)

#print(fp_list)

class master_dict:
    def __init__(self):
        self.md = collections.OrderedDict()
        self.dpath = dpath = '../server/data/working_dir/'
    # method for generating a list of filepaths for json files in the data storage directory # -------------------------------------------------------------------------------------------------------------------------------
    def list_fnames(self):
        fp_list = []
        for root, directories, files in os.walk(self.dpath):
            for filename in files:
                fp_tmp = os.path.join(root, filename)
                fp_list.append(fp_tmp)
        return fp_list
    # method for reading in json files # -------------------------------------------------------------------------------------------------------------------------------
    def open_json_read(self, fpath):
        with open(fpath, "r") as read_json:
            self.current_data = json.load(read_json)
    # method for outputting data back to json format for checking # -------------------------------------------------------------------------------------------------------------------------------
    def open_json_write(self, fpath): 
        with open(fpath, "w") as write_json:
            json.dump(self.md, write_json)
    # method for loading a single participant's experimental data into the master dictionary # -------------------------------------------------------------------------------------------------------------------------------
    def load_one_experiment(self):
        
        # [a] participant ID # -------------------------------------------------------------------------------------------------------------------------------
        participantID = self.current_data['ParticipantID']
        if not participantID in self.md.keys():
            self.md['participantID'] = {participantID : {}}
        
        # [b] experimental date # -------------------------------------------------------------------------------------------------------------------------------
        date = self.current_data['StartTime']
        if not date in self.md['participantID'][participantID].keys():
            self.md['participantID'][participantID]['date'] = {date : {}}
        # [c] experimental information # -------------------------------------------------------------------------------------------------------------------------------

        # [c1] user specs (humanAgent) # -------------------------------------------------------------------------------------------------------------------------------
        userspecs = {'x' : self.current_data['Stimuli'][0]['humanAgent']['x'], 
                     'y' : self.current_data['Stimuli'][0]['humanAgent']['y'], 
                     'angle' : self.current_data['Stimuli'][0]['humanAgent']['angle'], 
                     'xv' : self.current_data['Stimuli'][0]['humanAgent']['xv'], 
                     'yv' : self.current_data['Stimuli'][0]['humanAgent']['yv'], 
                     'lv' : self.current_data['Stimuli'][0]['humanAgent']['lv'], 
                     'angularVelocity' : self.current_data['Stimuli'][0]['humanAgent']['angularVelocity'], 
                     'maxLinearVelocity' : self.current_data['Stimuli'][0]['humanAgent']['maxLinearVelocity'],
                     'maxAngularVelocity' : self.current_data['Stimuli'][0]['humanAgent']['maxAngularVelocity'], 
                     'linearAcceleration' : self.current_data['Stimuli'][0]['humanAgent']['linearAcceleration'], 
                     'angularAcceleration' : self.current_data['Stimuli'][0]['humanAgent']['angularAcceleration'], 
                     'width' : self.current_data['Stimuli'][0]['humanAgent']['width'], 
                     'height' : self.current_data['Stimuli'][0]['humanAgent']['height'],
                     'linearMu' : self.current_data['Stimuli'][0]['humanAgent']['linearMu'], 
                     'rotationMu' : self.current_data['Stimuli'][0]['humanAgent']['rotationMu']}
        self.md['participantID'][participantID]['date'][date]['userspecs'] = userspecs #userspecs
        
        # [c2] world specs # -------------------------------------------------------------------------------------------------------------------------------
        worldspecs = {'fps' : self.current_data['Stimuli'][0]['fps'],
                      'gridApproximation' : self.current_data['Stimuli'][0]['gridApproximation'], 
                      'stimulusType' : self.current_data['Stimuli'][0]['stimulusType'], 
                      'worldWidth' : self.current_data['Stimuli'][0]['worldWidth'], 
                      'worldHeight' : self.current_data['Stimuli'][0]['worldHeight']}
        self.md['participantID'][participantID]['date'][date]['worldspecs'] = worldspecs

        # [d] phase(s) # -------------------------------------------------------------------------------------------------------------------------------
        # beginning of per-trial data formatting loop; everything above is experiment-wide #
        for keyidx1 in range(0, len(self.current_data['Stimuli'])):
            #print(self.md)
            # first, we branch off the training and test phases from the date #;
            # afterwards, the training and test phases are set as keys to lists; these lists contain all the block numbers within those phases
            print('\tkeyidx : ' + str(keyidx1))
            blockName = self.current_data['Stimuli'][keyidx1]['blockName']
            print('\t\t\t--> ' + blockName)
            first_word = blockName.split()[0]
            print('\t\t\t--> ' + first_word)
            #self.md['participantID'][participantID]['date'][date][first_word] = {blockName : {}}
            if not first_word in self.md['participantID'][participantID]['date'][date].keys():
                print('\t\t' + str(first_word) + ' not yet added! ')
                #self.md['participantID'][participantID]['date'][date][first_word] = {first_word : []}
                self.md['participantID'][participantID]['date'][date][first_word] = []
                if len(self.md['participantID'][participantID]['date'][date][first_word]) == 0:
                    self.md['participantID'][participantID]['date'][date][first_word].append({blockName : {}})
                elif not blockName in self.md['participantID'][participantID]['date'][date][first_word][0].keys():
                    #self.md['participantID'][participantID]['date'][date][first_word].append({blockName : {}})# = {blockName : {}}
                    self.md['participantID'][participantID]['date'][date][first_word][0][blockName] = {}#{blockName : {}})
                else:
                    continue
            else:
                print('\t\t' + str(first_word) + ' already added! ')
                #self.md['participantID'][participantID]['date'][date][first_word].update({blockName : {}})
                #self.md['participantID'][participantID]['date'][date][first_word] = {first_word : []}
                #self.md['participantID'][participantID]['date'][date][first_word] = []
                if not blockName in self.md['participantID'][participantID]['date'][date][first_word][0].keys():
                    print('not in')
                    #self.md['participantID'][participantID]['date'][date][first_word].append({blockName : {}})# = {blockName : {}}
                    self.md['participantID'][participantID]['date'][date][first_word][0][blockName] = {}
                else:
                    continue

        print(self.md)
           # for keyidx2 in range(0, len(self.current_data['Stimuli'])):
            #print(len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][0]))
            #print(len(self.current_data['Stimuli'][keyidx1]['Answer']))

        print('\n\t\t~ NOTE: ~ safe up to this point [5/29/2021]\n')



        # the subsequent script logs block-dependent trial information (most notably the contents to 'Answers' in the .json file)
        print('\tbeginning to populate block-dependent information...')
        #kp_count_list = {} # outer list; inner list

        #stimlen = len(self.current_data['Stimuli'])
        #answerlen = len(self.current_data['Stimuli'][keyidx1]['Answer'])
        #kplen = len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'])
        #print('\t--> stimulus length:' + str(stimlen))
        #print('\t--> answer length: ' + str(answerlen))
        #print()

        # keyidx1 is the index over all total trials #
        for keyidx1 in range(0, len(self.current_data['Stimuli'])): # TODO: if trial is empty (or answer is <3) then remove block from stimuli
            
                print('\n')
                stimlen = len(self.current_data['Stimuli'])
                answerlen = len(self.current_data['Stimuli'][keyidx1]['Answer'])
                print('\t--> stimulus length: ' + str(keyidx1+1) + " | " + str(stimlen))
                print('\t--> answer length: ' + str(answerlen))                
                try:
                    
                    kplistlen = len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'])
                    print('\t--> keypress list length: ' + str(kplistlen) + '   (hello!)')
                except:
                    print('\t--> keypress list length: ' + str(0) + ' <------------------------ [WARNING: EMPTY SET]')
                
                
                #print('answers return: ' + str(self.current_data['Stimuli'][keyidx1]['Answer']))
                
                try:
                    # keyidx2 is the index over all keypress lists (broken up in .json for bandwidth purposes, afaik) #
                    kplist_flag = 0
                    for keyidx2 in range(0, len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'])):
                        kp_count = 0
                        humlen = len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2])
                        print('\t\t--> human length:' + str(humlen) + str('   (hello2!)'))
                        
                        # keyidx3 is the index over all keypresses across keypress lists (101 keypresses per list)
                        for keyidx3 in range(0, len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2])):                            
                            #print(keyidx3)
                            a = 0
                            #kplen = len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3])
                            #print(kplen)
                            kp_count += 1
                            if kp_count >= 101:
                                print('\t\t\t--> note: kp_count has hit 101')
                                kp_count = 0
                                kplist_flag += 1
                                print('\t\t\t--> note: kplist_flag : ' + str(kplist_flag))
                            else:
                                continue
                    #print(kplist_flag)
                    #print(kp_count)
                    kplen = kplist_flag*101 + kp_count
                    print('\t--> keypress length: ' + str(kplen))

                except:
                    continue
            #kp_count_list[keyidx1] = {keyidx1 : keyidx2}

            #blockName = self.current_data['Stimuli'][keyidx1]['blockName']
            #self.md['participantID'][participantID]['date'][date][first_word]

        #print(kp_count_list)
        
        return
        '''
            print('\n')
            stimflag = 0 # TODO: might have to change the scope on this flag
            for keyidx2 in range(0, len(self.current_data['Stimuli'][keyidx1]['Answer'])):
                #keyidx3 = 0
                for keyidx3 in range(0, len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2])):
                #print('\tupper bound keyidx3: ' + str(len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2])))
                #while keyidx3 in range(0, len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2])):    
                    print('\t\tkeyidx2: ' + str(keyidx2) + '; keyidx3: ' + str(keyidx3))
                    trial_type = self.current_data['Stimuli'][0]['trial_type']

                    #print(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human'])#['tv']])
                if stimflag != 1:
                    trialspecs = {trial_type : {'goalWidth' : self.current_data['Stimuli'][keyidx1]['goalWidth'],
                                                                                                                'goalHeight' : self.current_data['Stimuli'][keyidx1]['goalHeight'], 
                                                                                                                'goalLocationAngle' : self.current_data['Stimuli'][keyidx1]['goalLocationAngle'], 
                                                                                                                'goalLocationX' : self.current_data['Stimuli'][keyidx1]['goalLocationX'], 
                                                                                                                'goalLocationY' : self.current_data['Stimuli'][keyidx1]['goalLocationY'],
                                                                                                                'boundary' : self.current_data['Stimuli'][keyidx1]['boundary'],
                                                                                                                'goal_img' : self.current_data['Stimuli'][keyidx1]['goal_img'], 
                                                                                                                'ClockTime' : self.current_data['Stimuli'][keyidx1]['ClockTime'], 

                                                                                                                'responses' : {'x' : [self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['x']],
                                                                                                                            'y' : [self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['y']],
                                                                                                                            'angle' : [self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['angle']],
                                                                                                                            'xv' : [self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['xv']],
                                                                                                                            'yv' : [self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['yv']],
                                                                                                                            'tv' : [self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['tv']],
                                                                                                                            'lv' : [self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['lv']],
                                                                                                                            'time' : [self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['time']]}}}
                    print(trialspecs)
                    print(self.md)
                    self.md['participantID'][participantID]['date'][date][first_word][blockName] = trialspecs
                    stimflag = 1
                else:
                    temp_ref = self.md['participantID'][participantID]['date'][date][first_word][blockName][trial_type]
                    temp_ref['responses']['x'].append(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['x'])
                    temp_ref['responses']['y'].append(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['x'])
                    temp_ref['responses']['angle'].append(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['x'])
                    temp_ref['responses']['xv'].append(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['x'])
                    temp_ref['responses']['yv'].append(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['x'])
                    temp_ref['responses']['tv'].append(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['x'])
                    temp_ref['responses']['lv'].append(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['x'])
                    temp_ref['responses']['time'].append(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]['human']['x'])
                    
                    
                    #if keyidx3 < len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2]):
                    #    keyidx3 += 1
                    #else:
                    #    keyidx3 = keyidx3
            #print(str(self.md['participantID'][participantID]['date'][date][first_word][blockName]))
            #print(str(self.md['participantID'][participantID]['date'][date][first_word][blockName].keys()))
            
            #if not keyidx1 in self.md['participantID'][participantID]['date'][date][first_word][blockName].keys():
            #    print('\t\t' + str(keyidx1) + ' not yet added! ')
            #    self.md['participantID'][participantID]['date'][date][first_word][blockName] = {self.current_data['Stimuli'][keyidx1]['TrialNumber'] : {}}
            #else:
            #    print('\t\t' + str(keyidx1) + ' already added! ')
            #    self.md['participantID'][participantID]['date'][date][first_word][blockName].update({self.current_data['Stimuli'][keyidx1]['TrialNumber'] : {}})
            #print(str(self.md['participantID'][participantID]['date'][date][first_word][blockName]))
            #print(str(self.md['participantID'][participantID]['date'][date][first_word][blockName].keys()))
            #for keyidx2 in range(0, len(self.current_data['Stimuli'][keyidx1]['TrialNumber'])):
                



        # [d1] trial information (#, block name, motion primitive type) #

        # [d2] answer (keypressed + timestamps) #
        '''

        '''
        "goalWidth": 50,
        "goalHeight": 50,
        "goalLocationAngle": 270,
        "goalLocationX": 400,
        "goalLocationY": 775,
        "trial_type": "fw",
        "boundary": "png/fw.png",
        "goal_img": "png/goal_icon_v2_fwbw.png",
        "ClockTime": "2021-03-11T22:16:11.816Z",
        "blockName": "Testing Block 0",
        "TrialHeader": "Trial",
        "trialIndex": 1,
        "Answer": {
        "start": 1615500966346,
        "keypresses": [
        '''

        keypresses = {'x' : [], 'y' : [], 'theta' : [], 'xv' : [], 'yv' : [], 'lv' : [], 'angularVelocity' : [], 'maxLinearVelocity' : [],
                     'maxAngularVelocity' : [], 'linearAcceleration' : [], 'angularAcceleration' : [], 'width' : [], 'height' : [],
                     'linearMu' : [], 'rotationMu' : []}


def main():
    md = master_dict()

    print('\t[1] parsing directory for filepaths...')
    fp_list = md.list_fnames()
    print('\t  ---> filepaths added to fp_list...')
    #print(fp_list)
    print('\t  ---> # of files to add to master dictionary: '  + str(len(fp_list)))

    print('\n\t[2] opening entry ' + str(fp_list[0]) + ' in fp_list for read access...')
    md.open_json_read(fp_list[0])
    print('\t  ---> file opened with read access.')

    print('\n\t[3] beginning load process for file: [ ' + str(fp_list[0]) + ' ]')
    md.load_one_experiment()
    #md.open_json_write('/parsed_data') # TODO: fix this

    print('\n' + str(md.md))

    return


## initialize master_dict;
# participantID --> experimental data & time --> phase --> block --> stimuli
'''
master_dict = {'participantID' : 
                {df2['ParticipantID'] :
                    {'startTime' :
                        {df2['StartTime'] :
                            {'test' : , 'train' : }
                                {'stimuli' : {}}
                                                                                           }
                                                         }
                                 }     
              }
print(master_dict)
'''





if __name__ == "__main__":
    main()