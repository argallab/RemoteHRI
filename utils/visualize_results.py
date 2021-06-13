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


class visualizer:
    def __init__(self):
        self.dpath = '/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/master_dict.json'

    def load_dict(self):
        # self.dpath
        with open(self.dpath, "r") as read_json:
            self.md = json.load(read_json)
        return

    def get_pid(self, participantID):
        pid = 'P' + str(participantID)
        pid_from_dict = self.md['participantID'][pid]

        return pid_from_dict

    # def get_date(self):
    #     return

    def get_date_auto(self, pid):
        #date_list = [pid['date'].keys()]
        #date = pid['date'].items()#date_list[0]
        #print(date)
        date_from_dict = self.md['participantID'][str(pid['date'].items())]#self.md['participantID'][pid][date]
        #print(date_from_dict)
        return date_from_dict

    def get_userspecs(self, date):
        userspecs = date['userspecs']

        return userspecs

    def get_worldspecs(self, date):
        worldspecs = date['worldspecs']

        return worldspecs

    def get_train_blocks(self, date):
        train_blocks = date['Training']

        return train_blocks

    def get_trial_blocks(self, date):
        test_blocks = date['Testing']

        return test_blocks

    def get_block(self, blockset, blocknum, test_or_train):
        if test_or_train == 'test':
            blocknum = 'Testing Block ' + str(blocknum)
        elif test_or_train == 'train':
            blocknum = 'Training Block ' + str(blocknum)
        block_from_dict = blockset[0][str(blocknum)]

        return block_from_dict

    def get_trial(self, block, trial_num):
        trial_from_dict = block[str(trial_num)]
    
        return trial_from_dict

    def get_timestep(self, trial, timestep):
        timestep_from_dict = trial[timestep]

        return timestep_from_dict

    # def get_demographic_response(self): 

    #     return

    def get_questionnaire_response(self, date):
        questionnaire = date['Questionnaire']

        return questionnaire
    ##

    def get_multiple_participants(self, pidlist):

        return

    def get_multiple_blocks(self, blockset, blocklist):

        return

    def get_control_across_trials(self,):

        return

    def get_control_across_blocks():

        return

    def two_axis_plot(self, hdata, haxis, hrange, vdata, vaxis, vrange):#self, haxis, vaxis, title, hrange, vrange, hdata, vdata)
        
        # if vdata not supplied, creates a numpy array that indexes the hdata
        if vdata == 0:
            vdata = np.arange(len(hdata))



        
        return
        
    ##

def main():
    vmd = visualizer()
    vmd.load_dict()

    # retrieve single PID
    pid_test = vmd.get_pid(3)
    #print(pid_test)

    # automatically recover date string for participants with single experiment
    auto_date_test = vmd.get_date_auto(pid_test)
    
    # userspecs
    userspecs_test = vmd.get_userspecs(auto_date_test)

    # worldspecs
    worldspecs_test = vmd.get_block(auto_date_test)

    # training block branch
    train_block_set_test = vmd.get_train_blocks(auto_date_test, 'train')
    train_block_test = vmd.get_block(train_block_set_test)
    train_trial_test = vmd.get_trial(train_block_test, 9)
    train_timestep_test = vmd.get_timestep(train_trial_test, 12)

    print(train_trial_test)
    print(train_timestep_test)
    print('\n')

    # testing block branch
    test_block_set_test = vmd.get_test_blocks(auto_date_test)
    test_block_test = vmd.get_block(test_block_set_test, 'test')
    test_trial_test = vmd.get_trial(test_block_test, 9)
    test_timestep_test = vmd.get_timestep(test_trial_test, 12)

    print(test_block_test)
    print(test_timestep_test)
    print('\n')









    return

if __name__ == "__main__":
    main()

