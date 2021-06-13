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
        self.dpath = '../../RemoteHRI_support/rhri_data'
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
   
    def load_participantIDs_test(self):
        # [a] participant ID # -------------------------------------------------------------------------------------------------------------------------------
        participantID = self.current_data['ParticipantID']
        print(participantID)
        if not participantID in self.md['participantID'].keys():
            self.md['participantID'] = {participantID : {}}

    # method for loading a single participant's experimental data into the master dictionary # -------------------------------------------------------------------------------------------------------------------------------
    def load_one_experiment(self):
        
        # [a] participant ID # -------------------------------------------------------------------------------------------------------------------------------
        participantID = self.current_data['ParticipantID']
        #return
        if not 'participantID' in self.md.keys():
            print('\t[NOTE] adding iniital \'participantID\' to master dictionary.')
            self.md = {'participantID' : {}}
            #self.md['participantID'][participantID] = {participantID : {}}
            #self.md['participantID'] = participantID #{participantID : {}}
            self.md['participantID'][participantID] = {}
            #print(self.md)
        elif not participantID in self.md['participantID'].keys():
            #self.md['participantID'] = {'participantID' : {participantID : {}}}
            #self.md['participantID'][participantID] = {participantID : {}}
            #self.md['participantID'] = participantID #{participantID : {}}
            self.md['participantID'][participantID] = {}
            #print(self.md)
        
        #return

        ##print()

        if not 'age' in self.md['participantID'][participantID].keys():
            try:
                self.md['participantID'][participantID]['age'] =  self.current_data['Age']
            except:
                ##print('\t-> note: \'Age\' not obtained for participant.')
                pass
        if not 'sex' in self.md['participantID'][participantID].keys():
            try:
                self.md['participantID'][participantID]['sex'] =  self.current_data['Sex']
            except:
                ##print('\t-> note: \'Sex\' not obtained for participant.')
                pass
        if not 'hand' in self.md['participantID'][participantID].keys():
            try:
                self.md['participantID'][participantID]['hand'] =  self.current_data['Hand']
            except:
                ##print('\t-> note: \'Hand\' not obtained for participant.')
                pass        
        if not 'race' in self.md['participantID'][participantID].keys():
            try:
                self.md['participantID'][participantID]['race'] =  self.current_data['Race']
            except:
                ###print('\t-> note: \'Race\' not obtained for participant.')
                pass
        else:
            pass

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
            ##print(self.md)
            # first, we branch off the training and test phases from the date #;
            # afterwards, the training and test phases are set as keys to lists; these lists contain all the block numbers within those phases
            #print('\tkeyidx : ' + str(keyidx1))
            blockName = self.current_data['Stimuli'][keyidx1]['blockName']
            #print('\t\t\t--> ' + blockName)
            first_word = blockName.split()[0]
            #print('\t\t\t--> ' + first_word)
            #self.md['participantID'][participantID]['date'][date][first_word] = {blockName : {}}
            if not first_word in self.md['participantID'][participantID]['date'][date].keys():
                #print('\t\t' + str(first_word) + ' not yet added! ')
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
                #print('\t\t' + str(first_word) + ' already added! ')
                #self.md['participantID'][participantID]['date'][date][first_word].update({blockName : {}})
                #self.md['participantID'][participantID]['date'][date][first_word] = {first_word : []}
                #self.md['participantID'][participantID]['date'][date][first_word] = []
                if not blockName in self.md['participantID'][participantID]['date'][date][first_word][0].keys():
                    #print('not in')
                    #self.md['participantID'][participantID]['date'][date][first_word].append({blockName : {}})# = {blockName : {}}
                    self.md['participantID'][participantID]['date'][date][first_word][0][blockName] = {}
                else:
                    continue

        #print(self.md)
           # for keyidx2 in range(0, len(self.current_data['Stimuli'])):
            ##print(len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][0]))
            ##print(len(self.current_data['Stimuli'][keyidx1]['Answer']))

        #print('\n\t\t~ NOTE: ~ safe up to this point [5/29/2021]\n')



        # the subsequent script logs block-dependent trial information (most notably the contents to 'Answers' in the .json file)
        #print('\tbeginning to populate block-dependent information...')

        ##print('\t--> stimulus length:' + str(stimlen))
        ##print('\t--> answer length: ' + str(answerlen))

        block_count = 0

        # keyidx1 is the index over all total trials #
        for keyidx1 in range(0, len(self.current_data['Stimuli'])): # TODO: if trial is empty (or answer is <3) then remove block from stimuli

            #print('\n')
            stimlen = len(self.current_data['Stimuli'])
            answerlen = len(self.current_data['Stimuli'][keyidx1]['Answer'])
            #print('\t--> stimulus length: ' + str(keyidx1+1) + " | " + str(stimlen))
            #print('\t--> answer length: ' + str(answerlen))

            # if keyidx1+1 == (len(self.current_data['Stimuli'])):
                

            try: # NOTE: re-added try/except clause 06/06/21               
                kplistlen = len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'])
                #print('\t--> keypress list length: ' + str(kplistlen) + '   (hello!)')
            except:
                #print('\t--> keypress list length: ' + str(0) + ' <------------------------ [WARNING: EMPTY SET]')
                block_count += 1

                if keyidx1 == (len(self.current_data['Stimuli'])-1):
                    # TODO: recover post-experiment questionnaire data here
                    self.md['participantID'][participantID]['date'][date]['Questionnaire'] = self.current_data['Stimuli'][keyidx1]["Answer"]
                    #print("\t--> [NOTE] post-experiment question parsing reached.")
            
            try:
                #print('made into try/except for trials')
                # keyidx2 is the index over all keypress lists (broken up in .json for bandwidth purposes, afaik) #
                kplist_flag = 0
                for keyidx2 in range(0, len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'])):
                    #print('made into try/except trial for loop 1 (keyidx2)')
                    kp_count = 0
                    humlen = len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2])
                    #print('\t\t--> human length:' + str(humlen) + str('   (hello2!)'))
                    
                    # keyidx3 is the index over all keypresses across keypress lists (101 keypresses per list)
                    for keyidx3 in range(0, len(self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2])): 
                        #print('made into try/except trial for loop 2 (keyidx3)')            
                        a = 0
                        # recovers blockName and first_word when checking what to populate in master dictionary
                        blockName = self.current_data['Stimuli'][keyidx1]['blockName']
                        first_word = blockName.split()[0]
                        #print('made before trial_number call')
                        trial_number = (self.current_data['Stimuli'][keyidx1]['TrialHeader']) + ' ' + str(self.current_data['Stimuli'][keyidx1]['trialIndex'])
                        #print('made past trial_number call')
                        #print(trial_number)
                        #print(self.md['participantID'][participantID]['date'][date][first_word][0][blockName].keys())
                        if not trial_number in self.md['participantID'][participantID]['date'][date][first_word][0][blockName].keys():
                            #print('adding ' + str(trial_number))
                            self.md['participantID'][participantID]['date'][date][first_word][0][blockName] = {trial_number: {}}
                        # this is where the subject trial responses are stored; the timestep associated with each response is treated as a key
                        # that in turn links to two keys: 'human' and 'time'. The former is associated with the control and state information,
                        # whereas the latter is associated with the # of system time counts during the trial
                        #self.md['participantID'][participantID]['date'][date][first_word][0][blockName][keyidx3+(kplist_flag*101)] = self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]
                        self.md['participantID'][participantID]['date'][date][first_word][0][blockName][trial_number][keyidx3+(kplist_flag*101)] = self.current_data['Stimuli'][keyidx1]['Answer']['keypresses'][keyidx2][keyidx3]
                        #print('made before kp_count')
                        ##print('\t\t\t--> note: this is current key index for timesteps: ' + str(keyidx3+(kplist_flag*101)))
                        kp_count += 1
                        if kp_count >= 101:
                            #print('\t\t\t--> note: kp_count has hit 101')
                            kp_count = 0
                            kplist_flag += 1
                            #print('\t\t\t--> note: kplist_flag : ' + str(kplist_flag))
                        else:
                            continue
                ##print(kplist_flag)
                ##print(kp_count)
                kplen = kplist_flag*101 + kp_count
                #print('\t--> keypress length: ' + str(kplen))

            except:
                kplist_flag = 0
                #print('\t [WARNING] ~ exception encountered in keyidx2/keyidx3 loop')
                
                continue
            #kp_count_list[keyidx1] = {keyidx1 : keyidx2}
            
                    

            #blockName = self.current_data['Stimuli'][keyidx1]['blockName']
            #self.md['participantID'][participantID]['date'][date][first_word]

        ##print(kp_count_list)
        
        return
        
    # def load_all_experiments(self, fp_list):
    #     for 

    #     return

def main():
    md = master_dict()

    print('\t[1] parsing directory for filepaths...')
    fp_list = md.list_fnames()
    print('\t  ---> filepaths added to fp_list...')
    #print(fp_list)
    print('\t  ---> # of files to add to master dictionary: '  + str(len(fp_list)))

    print(fp_list)

    # return

    
    for json_idx in range(0, len(fp_list)):
        print('\n\n\t[2] opening entry ' + str(fp_list[json_idx]) + ' in fp_list for read access...')
        if fp_list[json_idx] == '../../RemoteHRI_support/rhri_data/master_dict.json':
            print('\t |')
            print('\t[3] file is masterdict.json; pass')
            pass
        else:
            md.open_json_read(fp_list[json_idx])
            print('\t |')
            print('\t[3] beginning load process for file: [ ' + str(fp_list[json_idx]) + ' ]')
            print('\t |')
            print('\t  ---> file ' + str(fp_list[json_idx]) + ' opened with read access.')
            
            md.load_one_experiment()
            #md.load_participantIDs_test()
    md.open_json_write('../../RemoteHRI_support/rhri_data/master_dict.json')
    
    #print('\n' + str(md.md))

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


keypresses = {'x' : [], 'y' : [], 'theta' : [], 'xv' : [], 'yv' : [], 'lv' : [], 'angularVelocity' : [], 'maxLinearVelocity' : [],
            'maxAngularVelocity' : [], 'linearAcceleration' : [], 'angularAcceleration' : [], 'width' : [], 'height' : [],
            'linearMu' : [], 'rotationMu' : []}
'''



if __name__ == "__main__":
    main()