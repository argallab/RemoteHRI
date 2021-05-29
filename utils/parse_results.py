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
        self.dpath = dpath = '../server/data/complete_new/'
    # method for generating a list of filepaths for json files in the data storage directory #
    def list_fnames(self):
        fp_list = []
        for root, directories, files in os.walk(self.dpath):
            for filename in files:
                fp_tmp = os.path.join(root, filename)
                fp_list.append(fp_tmp)
        return fp_list
    # method for reading in json files #
    def open_json_read(self, fpath):
        with open(fpath, "r") as read_json:
            self.current_data = json.load(read_json)
    # method for outputting data back to json format for checking #
    def open_json_write(self, fpath): 
        with open(fpath, "w") as write_json:
            json.dump(self.md, write_json)
    # method for loading a single participant's experimental data into the master dictionary #
    def load_one_experiment(self):
        # [a] participant ID #
        participantID = self.current_data['ParticipantID']
        if not participantID in self.md.keys():
            self.md['participantID'] = {participantID : {}}
        # [b] experimental date #
        date = self.current_data['StartTime']
        if not date in self.md['participantID'][participantID].keys():
            self.md['participantID'][participantID]['date'] = date
        # [c] experimental information #

        # [c1] user specs (humanAgent) #
        userspecs = {'x' : 0, 'y' : 0, 'theta' : 0, 'xv' : 0, 'yv' : 0, 'lv' : 0, 'angularVelocity' : 0, 'maxLinearVelocity' : 0,
                     'maxAngularVelocity' : 0, 'linearAcceleration' : 0, 'angularAcceleration' : 0, 'width' : 0, 'height' : 0,
                     'linearMu' : 0, 'rotationMu' : 0}
        self.md['participantID'][participantID]['date'][userspecs] = userspecs
        # [c2] world specs #
        worldspecs = {'fps' : 0, 'gridApproximation' : 0, 'stimulusType' : 0, 'worldWidth' : 0, 'worldHeight' : 0}

        # [c3] phase #

        # [d1] trial information (#, block name, motion primitive type) #

        # [d2] answer (keypressed + timestamps) #

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

    print(md.md)

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