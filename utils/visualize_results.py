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
import matplotlib.pyplot as plt


class visualizer:
    def __init__(self):
        self.dpath = '/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/master_dict.json'
     
    def load_dict(self):
        with open(self.dpath, "r") as read_json:
            self.md = json.load(read_json)
        return

 ################################################################################################################################################### [ PARTICIPANT ID & DATE ]   
   
    def get_pid(self, participantID):
        pid = 'P' + str(participantID)
        pid_from_dict = self.md['participantID'][pid]

        #self.test_json = pid_from_dict ###########################

        return pid_from_dict

    # def get_date(self):
    #     return

    def get_date_auto(self, participantID):
        pid = 'P' + str(participantID)
        key = str(next(iter(self.md['participantID'][pid]['date'])))
        date_from_dict = self.md['participantID'][pid]['date'][key]

        return date_from_dict, key

################################################################################################################################################### [ USER INFO ]

    def get_userspecs(self, participantID, date=0):
        pid = 'P' + str(participantID)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        userspecs = self.md['participantID'][pid]['date'][date_key]['userspecs']

        return userspecs

    def get_worldspecs(self, participantID, date=0):
        pid = 'P' + str(participantID)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        worldspecs = self.md['participantID'][pid]['date'][date_key]['worldspecs']

        return worldspecs

    # def get_demographic_response(self): 

    #     return

    def get_questionnaire_response(self, participantID, date=0): # TODO: check
        pid = 'P' + str(participantID)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        questionnaire = self.md['participantID'][pid]['date'][date_key]['Questionnaire']

        return questionnaire

################################################################################################################################################### [ ACCESS TRIAL BLOCKS ]

    def get_train_blockset(self, participantID, date=0):
        pid = 'P' + str(participantID)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        train_blockset = self.md['participantID'][pid]['date'][date_key]['Training']

        return train_blockset

    def get_test_blockset(self, participantID, date=0):
        pid = 'P' + str(participantID)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        test_blockset = self.md['participantID'][pid]['date'][date_key]['Testing']

        return test_blockset

    def get_block(self, participantID, test_or_train, block_num, date=0):
        pid = 'P' + str(participantID)
        block2get = test_or_train + ' Block ' + str(block_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        block_from_dict = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get]

        return block_from_dict

################################################################################################################################################### [ ACCESS TRIAL INFORMATION ]
 
    # return entire trial
    def get_trial(self, participantID, test_or_train, block_num, trial_num, date=0):
        pid = 'P' + str(participantID)
        block2get = test_or_train + ' Block ' + str(block_num)
        trial2get = 'Trial ' + str(trial_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        trial_from_dict = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get][trial2get]

        return trial_from_dict

    # return start
    def get_start(self, participantID, test_or_train, block_num, trial_num, date=0):
        pid = 'P' + str(participantID)
        block2get = test_or_train + ' Block ' + str(block_num)
        trial2get = 'Trial ' + str(trial_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        timestep_from_dict = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get][trial2get]['response']['start']

        return timestep_from_dict

    # return end
    def get_end(self, participantID, test_or_train, block_num, trial_num, date=0):
        pid = 'P' + str(participantID)
        block2get = test_or_train + ' Block ' + str(block_num)
        trial2get = 'Trial ' + str(trial_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        timestep_from_dict = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get][trial2get]['response']['end']

        return timestep_from_dict

    ## return timestep
    def get_timestep(self, participantID, test_or_train, block_num, trial_num, timestep_idx, date=0):
        pid = 'P' + str(participantID)
        block2get = test_or_train + ' Block ' + str(block_num)
        trial2get = 'Trial ' + str(trial_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        timestep_from_dict = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get][trial2get]['response']['keypresses'][timestep_idx]

        return timestep_from_dict

###################################################################################################################################################

    def get_trial_array(self, participantID, test_or_train, block_num, trial_num, date=0):
        pid = 'P' + str(participantID)
        block2get = test_or_train + ' Block ' + str(block_num)
        trial2get = 'Trial ' + str(trial_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        num_timesteps = len(self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get][trial2get]['response']['keypresses'])

        trial_array = np.array([[np.nan, np.nan, np.nan, np.nan, np.nan, np.nan, np.nan, np.nan, np.nan]])
        
        print(num_timesteps)

        for ts_idx in range(0, num_timesteps):
            #print(ts_idx)
            temp_ts = self.get_timestep(participantID, test_or_train, block_num, trial_num, ts_idx)
            ts = ts_idx
            x = temp_ts['human']['x']
            y = temp_ts['human']['y']
            angle = temp_ts['human']['angle']
            xv = temp_ts['human']['xv']
            yv = temp_ts['human']['yv']
            tv = temp_ts['human']['tv']
            lv = temp_ts['human']['lv']            
            time = temp_ts['time']

            ts_slice = np.array([[ts, x, y, angle, xv, yv, tv, lv, time]])

            trial_array = np.append(trial_array, ts_slice, axis=0)

        
        print(trial_array[0])
        print('\n')
        print(trial_array[1])
        print('\n')
        print(trial_array[0:2])
        print('\n')
        print(trial_array[:][:])
        print('\n')
        print(trial_array[:][1])
        print('\n')
        print(np.shape(trial_array))
        print('\n')
        print(np.ndim(trial_array))
        print('\n')
        print(np.size(trial_array))
        #print(trial_array[:][1])
        #print('\n')
        #print(trial_array[:][2])
        #print('\n')
        plt.plot(0,0, '*c')
        #plt.xlim = (-450, 450)
        #plt.ylim = (-450, 450)
        plt.plot(trial_array[:][1], trial_array[:][2], 'ok')
        plt.show()

        return trial_array


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
    pid_test = vmd.get_pid(11)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/single_pid_test.json', "w") as write_json:
        json.dump(pid_test, write_json)

    ############ USER INFORMATION ###########################################################################################

    # retrieve w/ arg for PID, assuming participant has completed experiment once (automatically retrieves single 'date' key)
    auto_date_test = vmd.get_date_auto(11)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/single_date_test.json', "w") as write_json:
        json.dump(auto_date_test, write_json)

    # userspecs
    userspecs_test = vmd.get_userspecs(11)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/userspecs_test.json', "w") as write_json:
        json.dump(userspecs_test, write_json)

    # worldspecs
    worldspecs_test = vmd.get_worldspecs(11)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/worldspecs_test.json', "w") as write_json:
        json.dump(worldspecs_test, write_json)

    ############ TRAINING INFORMATION #######################################################################################

    # training block set
    train_blockset_test = vmd.get_train_blockset(11)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/train_blockset_test.json', "w") as write_json:
        json.dump(train_blockset_test, write_json)

    # training block
    train_block_test = vmd.get_block(11, 'Training', 1)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/train_block_test.json', "w") as write_json:
        json.dump(train_block_test, write_json)
    
    # training trial (participantID, 'Testing'/'Training', block#, trial#)
    train_trial_test = vmd.get_trial(11, 'Training', 1, 1)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/train_trial_test.json', "w") as write_json:
        json.dump(train_trial_test, write_json)

    # training timestep
    train_timestep_test = vmd.get_timestep(11, 'Training', 1, 1, 10)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/train_timestep_test.json', "w") as write_json:
        json.dump(train_timestep_test, write_json)


    ############ TESTING INFORMATION ########################################################################################

    # testing block set
    test_blockset_test = vmd.get_test_blockset(11)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/test_blockset_test.json', "w") as write_json:
        json.dump(test_blockset_test, write_json)

    # testing block
    test_block_test = vmd.get_block(11, 'Testing', 1)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/test_block_test.json', "w") as write_json:
        json.dump(test_block_test, write_json)

    # testing trial (participantID, 'Testing'/'Training', block#, trial#)
    test_trial_test = vmd.get_trial(11, 'Testing', 1, 26)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/test_trial_test.json', "w") as write_json:
        json.dump(test_trial_test, write_json)

    # testing timestep
    test_timestep_test = vmd.get_timestep(11, 'Testing', 1, 26, 10)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/test_timestep_test.json', "w") as write_json:
        json.dump(test_timestep_test, write_json)


    ############ MULTI-TIMESTEP INFORMATION #################################################################################

    trial_array_test = vmd.get_trial_array(11, 'Testing', 1, 26)
    trial_array_test.tofile('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/trial_array_test.csv', sep = ',')
    #print(trial_array_test)




    return

    # training block branch
    train_block_set_test = vmd.get_train_blocks(auto_date_test, 'train')
    train_block_test = vmd.get_block(train_block_set_test)
    train_trial_test = vmd.get_trial(train_block_test, 9)
    train_timestep_test = vmd.get_timestep(train_trial_test, 12)

    # print(train_trial_test)
    # print('\n')
    # print(train_timestep_test)
    # print('\n')

    # testing block branch
    test_block_set_test = vmd.get_test_blocks(auto_date_test)
    test_block_test = vmd.get_block(test_block_set_test, 'test')
    test_trial_test = vmd.get_trial(test_block_test, 9)
    test_timestep_test = vmd.get_timestep(test_trial_test, 12)

    # print(test_block_test)
    # print('\n')
    # print(test_timestep_test)
    # print('\n')









    return

if __name__ == "__main__":
    main()

