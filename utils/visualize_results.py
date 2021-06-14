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
   
    def get_participantID_list(self):

        pid_list = list(self.md['participantID'].keys())
        #print(pid_list)

        return pid_list
        

    def get_pid(self, participantID):
        pid = 'P' + str(participantID)
        pid_from_dict = self.md['participantID'][pid]

        #self.test_json = pid_from_dict ###########################

        return pid_from_dict

    # def get_date(self):
    #     return

    def get_date_auto(self, participantID):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        key = str(next(iter(self.md['participantID'][pid]['date'])))
        date_from_dict = self.md['participantID'][pid]['date'][key]

        return date_from_dict, key

################################################################################################################################################### [ USER INFO ]

    def get_userspecs(self, participantID, date=0):
        pid = 'P' + str(participantID)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        userspecs = self.md['participantID'][pid]['date'][date_key]['userspecs']

        return userspecs

    def get_worldspecs(self, participantID, date=0):
        pid = 'P' + str(participantID)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        worldspecs = self.md['participantID'][pid]['date'][date_key]['worldspecs']

        return worldspecs

    # def get_demographic_response(self): 

    #     return

    def get_questionnaire_response(self, participantID, date=0): # TODO: check
        pid = 'P' + str(participantID)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        questionnaire = self.md['participantID'][pid]['date'][date_key]['Questionnaire']

        return questionnaire

################################################################################################################################################### [ ACCESS TRIAL BLOCKS ]

    def get_train_blockset(self, participantID, date=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        train_blockset = self.md['participantID'][pid]['date'][date_key]['Training']

        return train_blockset

    def get_test_blockset(self, participantID, date=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        test_blockset = self.md['participantID'][pid]['date'][date_key]['Testing']

        return test_blockset

    def get_block(self, participantID, test_or_train, block_num, date=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        block2get = test_or_train + ' Block ' + str(block_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        block_from_dict = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get]

        return block_from_dict

################################################################################################################################################### [ ACCESS TRIAL INFORMATION ]
 
    # return entire trial
    def get_trial(self, participantID, test_or_train, block_num, trial_num, date=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        block2get = test_or_train + ' Block ' + str(block_num)
        trial2get = 'Trial ' + str(trial_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        trial_from_dict = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get][trial2get]

        return trial_from_dict

    # return start
    def get_start(self, participantID, test_or_train, block_num, trial_num, date=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        block2get = test_or_train + ' Block ' + str(block_num)
        trial2get = 'Trial ' + str(trial_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        timestep_from_dict = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get][trial2get]['response']['start']

        return timestep_from_dict

    # return end
    def get_end(self, participantID, test_or_train, block_num, trial_num, date=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        block2get = test_or_train + ' Block ' + str(block_num)
        trial2get = 'Trial ' + str(trial_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        timestep_from_dict = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get][trial2get]['response']['end']

        return timestep_from_dict

    ## return timestep
    def get_timestep(self, participantID, test_or_train, block_num, trial_num, timestep_idx, date=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        if block_num == int:
            block2get = test_or_train + ' Block ' + str(block_num)
        else:
            block2get = block_num
        if trial_num == int:
            trial2get = 'Trial ' + str(trial_num)
        else:
            trial2get = trial_num
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        timestep_from_dict = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get][trial2get]['response']['keypresses'][timestep_idx]

        return timestep_from_dict

###################################################################################################################################################

    def get_moprim_dist(self, participantID='na', date=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID

        # collects motion primitive distribution for all participants
        if participantID == 'na':
            pid_list = self.get_participantID_list()
            moprim_list = collections.OrderedDict()
            moprim_dist = collections.OrderedDict()
            moprim_location = collections.OrderedDict()
            train_moprim_dist = collections.OrderedDict()
            train_moprim_location = collections.OrderedDict()
            test_moprim_dist = collections.OrderedDict()
            test_moprim_location = collections.OrderedDict()
            for pid in pid_list:
                if date == 0:
                    date_from_dict, date_key = self.get_date_auto(pid)
                else:
                    date_key = date

                train_blockset = self.get_train_blockset(pid, date_key)
                test_blockset = self.get_test_blockset(pid, date_key)

                num_train_blocks = len(train_blockset[0].keys())
                num_test_blocks = len(test_blockset[0].keys())

                #print(num_train_blocks)
                #print(num_test_blocks)

                num_train_trials = 12
                num_test_trials = 12

                moprim_list[pid] = ['fw', 'bw', 'fwr', 'bwr', 'bwl', 'fwl', 'cw', 'ccw', 'fwr_cw', 'bwr_ccw', 'bwl_cw', 'fwl_ccw']
                moprim_dist[pid] = {'fw' : 0, 'bw' : 0, 'fwr' : 0, 'bwr' : 0, 'bwl' : 0, 'fwl' : 0, 'cw' : 0, 'ccw' : 0, 'fwr_cw' : 0, 'bwr_ccw' : 0, 'bwl_cw' : 0, 'fwl_ccw' : 0}
                moprim_location[pid] = {'fw' : {'Training' : {}, 'Testing' : {}},
                                'bw' : {'Training' : {}, 'Testing' : {}}, 
                                'fwr' : {'Training' : {}, 'Testing' : {}}, 
                                'bwr' : {'Training' : {}, 'Testing' : {}}, 
                                'bwl' : {'Training' : {}, 'Testing' : {}}, 
                                'fwl' : {'Training' : {}, 'Testing' : {}}, 
                                'cw' : {'Training' : {}, 'Testing' : {}}, 
                                'ccw' : {'Training' : {}, 'Testing' : {}}, 
                                'fwr_cw' : {'Training' : {}, 'Testing' : {}}, 
                                'bwr_ccw' : {'Training' : {}, 'Testing' : {}}, 
                                'bwl_cw' : {'Training' : {}, 'Testing' : {}}, 
                                'fwl_ccw' : {'Training' : {}, 'Testing' : {}}}
                train_moprim_dist[pid] = {'fw' : 0, 'bw' : 0, 'fwr' : 0, 'bwr' : 0, 'bwl' : 0, 'fwl' : 0, 'cw' : 0, 'ccw' : 0, 'fwr_cw' : 0, 'bwr_ccw' : 0, 'bwl_cw' : 0, 'fwl_ccw' : 0}
                train_moprim_location[pid] = {'fw' : {'Training' : {}, 'Testing' : {}},
                                'bw' : {'Training' : {}, 'Testing' : {}}, 
                                'fwr' : {'Training' : {}, 'Testing' : {}}, 
                                'bwr' : {'Training' : {}, 'Testing' : {}}, 
                                'bwl' : {'Training' : {}, 'Testing' : {}}, 
                                'fwl' : {'Training' : {}, 'Testing' : {}}, 
                                'cw' : {'Training' : {}, 'Testing' : {}}, 
                                'ccw' : {'Training' : {}, 'Testing' : {}}, 
                                'fwr_cw' : {'Training' : {}, 'Testing' : {}}, 
                                'bwr_ccw' : {'Training' : {}, 'Testing' : {}}, 
                                'bwl_cw' : {'Training' : {}, 'Testing' : {}}, 
                                'fwl_ccw' : {'Training' : {}, 'Testing' : {}}}
                test_moprim_dist[pid] = {'fw' : 0, 'bw' : 0, 'fwr' : 0, 'bwr' : 0, 'bwl' : 0, 'fwl' : 0, 'cw' : 0, 'ccw' : 0, 'fwr_cw' : 0, 'bwr_ccw' : 0, 'bwl_cw' : 0, 'fwl_ccw' : 0}
                test_moprim_location[pid] = {'fw' : {'Training' : {}, 'Testing' : {}},
                                'bw' : {'Training' : {}, 'Testing' : {}}, 
                                'fwr' : {'Training' : {}, 'Testing' : {}}, 
                                'bwr' : {'Training' : {}, 'Testing' : {}}, 
                                'bwl' : {'Training' : {}, 'Testing' : {}}, 
                                'fwl' : {'Training' : {}, 'Testing' : {}}, 
                                'cw' : {'Training' : {}, 'Testing' : {}}, 
                                'ccw' : {'Training' : {}, 'Testing' : {}}, 
                                'fwr_cw' : {'Training' : {}, 'Testing' : {}}, 
                                'bwr_ccw' : {'Training' : {}, 'Testing' : {}}, 
                                'bwl_cw' : {'Training' : {}, 'Testing' : {}}, 
                                'fwl_ccw' : {'Training' : {}, 'Testing' : {}}}


                
                for train_block_idx in range(1, num_train_blocks+1):
                    for trial_num_idx in range(0, num_train_trials-1):
                        train_moprim_dist, train_moprim_location = self.get_moprims(pid, moprim_list, train_moprim_dist, train_moprim_location, 'Training', train_block_idx, trial_num_idx, date_key)
                        moprim_dist, moprim_location = self.get_moprims(pid, moprim_list, moprim_dist, moprim_location, 'Training', train_block_idx, trial_num_idx, date_key)

                for test_block_idx in range(1, num_test_blocks+1):
                    for trial_num_idx in range(0, num_test_trials-1):            
                        test_moprim_dist, test_moprim_location = self.get_moprims(pid, moprim_list, test_moprim_dist, test_moprim_location, 'Testing', test_block_idx, trial_num_idx, date_key)
                        moprim_dist, moprim_location = self.get_moprims(pid, moprim_list, moprim_dist, moprim_location, 'Testing', test_block_idx, trial_num_idx, date_key)

        else:

            if date == 0:
                date_from_dict, date_key = self.get_date_auto(participantID)
            else:
                date_key = date

            train_blockset = self.get_train_blockset(participantID, date_key)
            test_blockset = self.get_test_blockset(participantID, date_key)

            num_train_blocks = len(train_blockset[0].keys())
            num_test_blocks = len(test_blockset[0].keys())

            #print(num_train_blocks)
            #print(num_test_blocks)

            num_train_trials = 12
            num_test_trials = 12
            
            moprim_list = collections.OrderedDict()
            moprim_dist = collections.OrderedDict()
            moprim_location = collections.OrderedDict()
            train_moprim_dist = collections.OrderedDict()
            train_moprim_location = collections.OrderedDict()
            test_moprim_dist = collections.OrderedDict()
            test_moprim_location = collections.OrderedDict()

            moprim_list[pid] = ['fw', 'bw', 'fwr', 'bwr', 'bwl', 'fwl', 'cw', 'ccw', 'fwr_cw', 'bwr_ccw', 'bwl_cw', 'fwl_ccw']
            moprim_dist[pid] = {'fw' : 0, 'bw' : 0, 'fwr' : 0, 'bwr' : 0, 'bwl' : 0, 'fwl' : 0, 'cw' : 0, 'ccw' : 0, 'fwr_cw' : 0, 'bwr_ccw' : 0, 'bwl_cw' : 0, 'fwl_ccw' : 0}
            moprim_location[pid] = {'fw' : {'Training' : {}, 'Testing' : {}},
                            'bw' : {'Training' : {}, 'Testing' : {}}, 
                            'fwr' : {'Training' : {}, 'Testing' : {}}, 
                            'bwr' : {'Training' : {}, 'Testing' : {}}, 
                            'bwl' : {'Training' : {}, 'Testing' : {}}, 
                            'fwl' : {'Training' : {}, 'Testing' : {}}, 
                            'cw' : {'Training' : {}, 'Testing' : {}}, 
                            'ccw' : {'Training' : {}, 'Testing' : {}}, 
                            'fwr_cw' : {'Training' : {}, 'Testing' : {}}, 
                            'bwr_ccw' : {'Training' : {}, 'Testing' : {}}, 
                            'bwl_cw' : {'Training' : {}, 'Testing' : {}}, 
                            'fwl_ccw' : {'Training' : {}, 'Testing' : {}}}
            train_moprim_dist[pid] = {'fw' : 0, 'bw' : 0, 'fwr' : 0, 'bwr' : 0, 'bwl' : 0, 'fwl' : 0, 'cw' : 0, 'ccw' : 0, 'fwr_cw' : 0, 'bwr_ccw' : 0, 'bwl_cw' : 0, 'fwl_ccw' : 0}
            train_moprim_location[pid] = {'fw' : {'Training' : {}, 'Testing' : {}},
                            'bw' : {'Training' : {}, 'Testing' : {}}, 
                            'fwr' : {'Training' : {}, 'Testing' : {}}, 
                            'bwr' : {'Training' : {}, 'Testing' : {}}, 
                            'bwl' : {'Training' : {}, 'Testing' : {}}, 
                            'fwl' : {'Training' : {}, 'Testing' : {}}, 
                            'cw' : {'Training' : {}, 'Testing' : {}}, 
                            'ccw' : {'Training' : {}, 'Testing' : {}}, 
                            'fwr_cw' : {'Training' : {}, 'Testing' : {}}, 
                            'bwr_ccw' : {'Training' : {}, 'Testing' : {}}, 
                            'bwl_cw' : {'Training' : {}, 'Testing' : {}}, 
                            'fwl_ccw' : {'Training' : {}, 'Testing' : {}}}
            test_moprim_dist[pid] = {'fw' : 0, 'bw' : 0, 'fwr' : 0, 'bwr' : 0, 'bwl' : 0, 'fwl' : 0, 'cw' : 0, 'ccw' : 0, 'fwr_cw' : 0, 'bwr_ccw' : 0, 'bwl_cw' : 0, 'fwl_ccw' : 0}
            test_moprim_location[pid] = {'fw' : {'Training' : {}, 'Testing' : {}},
                            'bw' : {'Training' : {}, 'Testing' : {}}, 
                            'fwr' : {'Training' : {}, 'Testing' : {}}, 
                            'bwr' : {'Training' : {}, 'Testing' : {}}, 
                            'bwl' : {'Training' : {}, 'Testing' : {}}, 
                            'fwl' : {'Training' : {}, 'Testing' : {}}, 
                            'cw' : {'Training' : {}, 'Testing' : {}}, 
                            'ccw' : {'Training' : {}, 'Testing' : {}}, 
                            'fwr_cw' : {'Training' : {}, 'Testing' : {}}, 
                            'bwr_ccw' : {'Training' : {}, 'Testing' : {}}, 
                            'bwl_cw' : {'Training' : {}, 'Testing' : {}}, 
                            'fwl_ccw' : {'Training' : {}, 'Testing' : {}}}
            
            for train_block_idx in range(1, num_train_blocks+1):
                for trial_num_idx in range(0, num_train_trials-1):
                    train_moprim_dist, train_moprim_location = self.get_moprims(participantID, moprim_list, train_moprim_dist, train_moprim_location, 'Training', train_block_idx, trial_num_idx, date_key)
                    moprim_dist, moprim_location = self.get_moprims(participantID, moprim_list, moprim_dist, moprim_location, 'Training', train_block_idx, trial_num_idx, date_key)

            for test_block_idx in range(1, num_test_blocks+1):
                for trial_num_idx in range(0, num_test_trials-1):            
                    test_moprim_dist, test_moprim_location = self.get_moprims(participantID, moprim_list, test_moprim_dist, test_moprim_location, 'Testing', test_block_idx, trial_num_idx, date_key)
                    moprim_dist, moprim_location = self.get_moprims(participantID, moprim_list, moprim_dist, moprim_location, 'Testing', test_block_idx, trial_num_idx, date_key)

        return moprim_dist, moprim_location, moprim_list

    def get_moprims(self, participantID, moprim_list, mp_dist, mp_location, test_or_train=0, block_num=0, trial_num=0, date=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        block_key = test_or_train + ' Block ' + str(block_num)
        trial_key = 'Trial ' + str(trial_num)
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        if len(self.md['participantID'][pid]['date'][date_key][test_or_train][0][block_key][trial_key].keys()) != 0:
            moprim = self.md['participantID'][pid]['date'][date_key][test_or_train][0][block_key][trial_key]['response']['trial_type']
            mp_dist[pid][moprim] += 1
            mp_location[pid][moprim][test_or_train][block_key] = trial_key#{block_key : trial_key}

        return mp_dist, mp_location

    def get_trial_array(self, participantID, test_or_train, block_num, trial_num, date=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            #print('entered pid else statement')
            pid = participantID
        if type(block_num) == int:
            block2get = test_or_train + ' Block ' + str(block_num)
        else:
            block2get = block_num
        if type(trial_num) == int:
            trial2get = 'Trial ' + str(trial_num)
        else:
            trial2get = trial_num
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)

        num_timesteps = len(self.md['participantID'][pid]['date'][date_key][test_or_train][0][block2get][trial2get]['response']['keypresses'])

        trial_array = collections.OrderedDict
        trial_array = {'ts_idx':{}}

        for ts_idx in range(0, num_timesteps):
            temp_ts = self.get_timestep(pid, test_or_train, block2get, trial2get, ts_idx)
            ts = ts_idx
            x = temp_ts['human']['x']
            y = temp_ts['human']['y']
            angle = temp_ts['human']['angle']
            xv = temp_ts['human']['xv']
            yv = temp_ts['human']['yv']
            tv = temp_ts['human']['tv']
            lv = temp_ts['human']['lv']            
            time = temp_ts['time']

            ts_slice = [x, y, angle, xv, yv, tv, lv, time]

            trial_array['ts_idx'][ts] = ts_slice

        return trial_array

    # returns single motion primitive from a single participant
    def get_single_moprim_single_pid(self, participantID, mp_location, moprim, train_or_test=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID

        if train_or_test == 0:
            mp_overdict = collections.OrderedDict()
            dict_idx = 0
            for test_or_train_key in mp_location[pid][moprim].keys():
                for block_key in mp_location[pid][moprim][test_or_train_key].keys():
                    trial_key = mp_location[pid][moprim][test_or_train_key][block_key]
                    
                    dict_idx += 1
                    mp_overdict[dict_idx] = self.get_trial_array(pid, test_or_train_key, block_key, trial_key)

        else:
            mp_overdict = collections.OrderedDict()
            dict_idx = 0
            for block_key in mp_location[pid][moprim][train_or_test].keys():
                #for trial_key in mp_location[pid][moprim][train_or_test][block_key].values():
                trial_key = mp_location[pid][moprim][train_or_test][block_key]
                dict_idx += 1
                mp_overdict[dict_idx] = self.get_trial_array(pid, train_or_test, block_key, trial_key)

        return mp_overdict

    # returns all motion primitives from a single participant
    def get_all_moprim_single_pid(self, participantID, mp_location, mp_list, train_or_test=0):
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID

        if train_or_test == 0:
            mp_overdict = collections.OrderedDict()
            
            for moprim in mp_list[pid]:
                dict_idx = 0
                mp_overdict[moprim] = {dict_idx : {}}
                for test_or_train_key in mp_location[pid][moprim].keys():
                    for block_key in mp_location[pid][moprim][test_or_train_key].keys():
                        #for trial_key in mp_location[pid][moprim][test_or_train_key][block_key].values():
                        trial_key = mp_location[pid][moprim][test_or_train_key][block_key]
                        dict_idx += 1
                        #mp_overdict[moprim][dict_idx] = {dict_idx : {}}
                        mp_overdict[moprim][dict_idx] = self.get_trial_array(pid, test_or_train_key, block_key, trial_key)


        else:
            mp_overdict = collections.OrderedDict()
            dict_idx = 0
            for moprim in mp_list:
                for block_key in mp_location[pid][moprim][train_or_test].keys():
                    #for trial_key in mp_location[pid][moprim][train_or_test][block_key].values():
                    trial_key = mp_location[pid][moprim][train_or_test][block_key]
                    dict_idx += 1
                    mp_overdict[moprim] = self.get_trial_array(pid, train_or_test, block_key, trial_key)

        return mp_overdict

    # returns single motion primitive across all participants
    def get_single_moprim_all_pid(self, mp_location, moprim, train_or_test=0):
        
        pid_list = self.get_participantID_list()

        if train_or_test == 0:
            mp_overdict = collections.OrderedDict()
            mp_overdict['pid'] = {}
            for pid in pid_list:
                dict_idx = 0
                mp_overdict['pid'][pid] = {}                
                for test_or_train_key in mp_location[pid][moprim].keys():
                    for block_key in mp_location[pid][moprim][test_or_train_key].keys():
                        trial_key = mp_location[pid][moprim][test_or_train_key][block_key]
                        
                        dict_idx += 1
                        mp_overdict['pid'][pid][dict_idx] = self.get_trial_array(pid, test_or_train_key, block_key, trial_key)

        

        else:
            mp_overdict = collections.OrderedDict()
            mp_overdict['pid'] = {}
            dict_idx = 0
            for pid in pid_list:
                mp_overdict['pid'][pid] = {}
                for block_key in mp_location[pid][moprim][train_or_test].keys():
                    trial_key = mp_location[pid][moprim][train_or_test][block_key]
                    dict_idx += 1
                    mp_overdict['pid'][pid][dict_idx] = self.get_trial_array(pid, train_or_test, block_key, trial_key)

        return mp_overdict

    # plot all motion primitives across all participants
    def get_all_moprim_all_pid(self, mp_location, mp_list, train_or_test=0):
        pid_list = self.get_participantID_list()

        if train_or_test == 0:
            mp_overdict = collections.OrderedDict()
            mp_overdict['pid'] = {}
            for pid in pid_list:
                mp_overdict['pid'][pid] = {}
                for moprim in mp_list[pid]:
                    dict_idx = 0
                    mp_overdict['pid'][pid][moprim] = {dict_idx : {}}
                    for test_or_train_key in mp_location[pid][moprim].keys():
                        for block_key in mp_location[pid][moprim][test_or_train_key].keys():
                            #for trial_key in mp_location[pid][moprim][test_or_train_key][block_key].values():
                            trial_key = mp_location[pid][moprim][test_or_train_key][block_key]
                            dict_idx += 1
                            #mp_overdict[moprim][dict_idx] = {dict_idx : {}}
                            mp_overdict['pid'][pid][moprim][dict_idx] = self.get_trial_array(pid, test_or_train_key, block_key, trial_key)


        else:
            mp_overdict = collections.OrderedDict()
            mp_overdict['pid'] = {}
            for pid in pid_list:
                mp_overdict['pid'][pid] = {}
                for moprim in mp_list[pid]:
                    dict_idx = 0
                    mp_overdict['pid'][pid][moprim] = {dict_idx : {}}
                    for block_key in mp_location[pid][moprim][train_or_test].keys():
                        #for trial_key in mp_location[pid][moprim][train_or_test][block_key].values():
                        trial_key = mp_location[pid][moprim][train_or_test][block_key]
                        dict_idx += 1
                        mp_overdict['pid'][pid][moprim][dict_idx] = self.get_trial_array(pid, train_or_test, block_key, trial_key)

        return mp_overdict


    # plot odometry
    def visualize_odom(self, mp_location, mp_list, mp=0, train_or_test=0, participantID=0):

        cmap = ['lightcoral', 'forestgreen', 'deepskyblue', 'saddlebrown', 'khaki', 'turquoise', 'orchid', 'peru', 'gold', 'cyan', 'slategrey', 'crimson', 'blueviolet', 'darkorange', 'lawngreen']

        # case for unspecified phase; includes both training and testing phase data
        if train_or_test == 0:
            print('\n[NOTE]: training or testing unspecified!\n')
            if participantID == 0:
                pid_list = self.get_participantID_list()
                pid_num = len(pid_list)
                pid_col = 3
                pid_row = 6
                fig, axs = plt.subplots(pid_col, pid_row)
                col_axis_num = 0
                row_axis_num = 0
                for pid in mp_location['pid'].keys():                
                    print('plotting ' + str(pid) + ' on subplot axis: ' + str(col_axis_num) + ', ' + str(row_axis_num))
                    for trial_key in mp_location['pid'][pid].keys():
                        for ts_idx in mp_location['pid'][pid][trial_key]['ts_idx']:
                            axs[col_axis_num, row_axis_num].plot(mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][0], mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][1], '.')
                            axs[col_axis_num, row_axis_num].set_title(str(pid))
                    if col_axis_num < pid_col-1:
                        col_axis_num += 1
                    else:
                        if row_axis_num < pid_row-1:
                            row_axis_num += 1
                            col_axis_num = 0
                        else:
                            break
            else:
                if type(participantID) == int:
                    pid = 'P' + str(participantID)
                else:
                    pid = participantID
                #print(pid)
                #print(mp_location['pid'].keys())
                #print(mp_location['pid'][pid])
                for trial_key in mp_location['pid'][pid].keys():
                        for ts_idx in mp_location['pid'][pid][trial_key]['ts_idx']:
                            plt.plot(mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][0], mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][1], '.')

        # case where training/testing phase is specified
        else:
            #print('\n[NOTE]: training or testing specified as argument!\n')
            # pid not provided; show data for all participants
            if participantID == 0:
                pid_list = self.get_participantID_list()
                pid_num = len(pid_list)
                pid_col = 3
                pid_row = 6
                fig, axs = plt.subplots(pid_col, pid_row, sharey=True, sharex=True)
                col_axis_num = 0
                row_axis_num = 0
                for pid in mp_location['pid'].keys():                
                    print('\nplotting ' + str(pid) + ' on subplot axis: ' + str(col_axis_num) + ', ' + str(row_axis_num))
                    for trial_key in mp_location['pid'][pid][mp].keys():
                        print('\tcurrently on trial: ' + str(trial_key))
                        axs[col_axis_num, row_axis_num].plot([410, 440], [425, 425], '--k', markersize=0.2)
                        axs[col_axis_num, row_axis_num].plot([425, 425], [415, 440], '--k', markersize=0.2)
                        try:
                            for ts_idx in mp_location['pid'][pid][mp][trial_key]['ts_idx']:
                                x = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0]
                                y = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][1]
                                theta = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][2]
                                if ts_idx%10 == 0:
                                    axs[col_axis_num, row_axis_num].plot(mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0], mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][1], '.', color=cmap[trial_key], alpha=0.75, markersize=0.8)
                                    #axs[col_axis_num, row_axis_num].plot([mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0], mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0] + 20*np.sin(mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][2])], [mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][1], mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0] + 20*np.cos(mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][3])], '-', color=cmap[trial_key+1])
                                    axs[col_axis_num, row_axis_num].plot([x, x + (10*np.cos(theta))],[y, y + (10*np.sin(theta))],'-', color=cmap[trial_key], markersize=0.1)
                                    axs[col_axis_num, row_axis_num].set_title(str(pid))
                                    #axs[col_axis_num, row_axis_num].set_xlim([0, 900])
                                    #axs[col_axis_num, row_axis_num].set_ylim([0, 900])
                                    axs[col_axis_num, row_axis_num].set_box_aspect(1)
                                    axs[col_axis_num, row_axis_num].tick_params(direction='in', length=3)
                                
                        except:
                            print('\t\t[WARNING]: no timesteps found')
                            pass
                    if col_axis_num < pid_col-1:
                        col_axis_num += 1
                    else:
                        if row_axis_num < pid_row-1:
                            row_axis_num += 1
                            col_axis_num = 0
                        else:
                            break
                fig.text(0.5, 0.04, 'x', ha='center', va='center')
                fig.text(0.06, 0.5, 'y', ha='center', va='center', rotation='vertical')
                fig.suptitle(str(train_or_test) + ' Pose Data for Motion Primitive: ' + str(mp))
                plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/' + str(mp) + '_' + str(train_or_test) + '_pose_data_all_participants.png', dpi=800, facecolor='w', transparent=True)
            else:
                if type(participantID) == int:
                    pid = 'P' + str(participantID)
                else:
                    pid = participantID
                for trial_key in mp_location['pid'][pid][mp].keys():
                        plt.plot([410, 440], [425, 425], '--k', markersize=0.2)
                        plt.plot([425, 425], [415, 440], '--k', markersize=0.2)
                        #print('training_all_moprim_all_pid_test.json > pid > ' + str(pid) + ' > ' + str(mp) + str(trial_key))
                        try:
                            for ts_idx in mp_location['pid'][pid][mp][trial_key]['ts_idx']:
                                if ts_idx%10 == 0:
                                    x = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0]
                                    y = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][1]
                                    theta = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][2]
                                    plt.plot(mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0], mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][1], '.', color=cmap[trial_key])
                                    plt.plot([x, x + (10*np.cos(theta))],[y, y + (10*np.sin(theta))],'--', color=cmap[trial_key], markersize=0.3)
                        except:
                            #print('\t\t[WARNING]: no timesteps found')
                            pass
                plt.xlabel('x')
                plt.ylabel('y')
                plt.title(str(pid) + ' ' + str(train_or_test) + ' Pose Data for Motion Primitive: ' + str(mp))

                if not os.path.exists('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid) + '/pose/'):
                    os.makedirs('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid) + '/pose/')
                plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid) + '/pose/' + str(mp) + '_' + str(train_or_test) + '_pose_data_' + str(pid) + '.png', dpi=800, facecolor='w', transparent=True)
            
        #plt.show()
        plt.clf()
        

        return

    # plot control signals
    def visualize_controls(self, mp_location, mp_list, mp=0, train_or_test=0, participantID=0):

        cmap = ['lightcoral', 'forestgreen', 'deepskyblue', 'saddlebrown', 'khaki', 'turquoise', 'orchid', 'peru', 'gold', 'cyan', 'slategrey', 'crimson', 'blueviolet', 'darkorange', 'lawngreen']

        # case for unspecified phase; includes both training and testing phase data
        if train_or_test == 0:
            print('\n[NOTE]: training or testing unspecified!\n')
            if participantID == 0:
                pid_list = self.get_participantID_list()
                pid_num = len(pid_list)
                pid_col = 3
                pid_row = 6
                fig, axs = plt.subplots(pid_col, pid_row, sharey=True, sharex=True)
                col_axis_num = 0
                row_axis_num = 0
                for pid in mp_location['pid'].keys():                
                    print('plotting ' + str(pid) + ' on subplot axis: ' + str(col_axis_num) + ', ' + str(row_axis_num))
                    for trial_key in mp_location['pid'][pid].keys():
                        for ts_idx in mp_location['pid'][pid][trial_key]['ts_idx']:
                            axs[col_axis_num, row_axis_num].plot(mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][5], mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][6], '.')
                            axs[col_axis_num, row_axis_num].set_title(str(pid))
                    if col_axis_num < pid_col-1:
                        col_axis_num += 1
                    else:
                        if row_axis_num < pid_row-1:
                            row_axis_num += 1
                            col_axis_num = 0
                        else:
                            break
            else:
                if type(participantID) == int:
                    pid = 'P' + str(participantID)
                else:
                    pid = participantID
                #print(pid)
                #print(mp_location['pid'].keys())
                #print(mp_location['pid'][pid])
                for trial_key in mp_location['pid'][pid].keys():
                        for ts_idx in mp_location['pid'][pid][trial_key]['ts_idx']:
                            plt.plot(mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][5], mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][6], '.')

        # case where training/testing phase is specified
        else:
            #print('\n[NOTE]: training or testing specified as argument!\n')
            # pid not provided; show data for all participants
            if participantID == 0:
                pid_list = self.get_participantID_list()
                pid_num = len(pid_list)
                pid_col = 3
                pid_row = 6
                fig, axs = plt.subplots(pid_col, pid_row, sharey=True, sharex=True)
                col_axis_num = 0
                row_axis_num = 0
                for pid in mp_location['pid'].keys():                
                    print('\nplotting ' + str(pid) + ' on subplot axis: ' + str(col_axis_num) + ', ' + str(row_axis_num))
                    for trial_key in mp_location['pid'][pid][mp].keys():
                        print('\tcurrently on trial: ' + str(trial_key))
                        axs[col_axis_num, row_axis_num].plot([-0.5, 0.5], [0, 0], '--k', markersize=0.2)
                        axs[col_axis_num, row_axis_num].plot([0, 0], [-0.2, 0.2], '--k', markersize=0.2)
                        try:
                            for ts_idx in mp_location['pid'][pid][mp][trial_key]['ts_idx']:
                                if ts_idx%10 == 0:
                                    axs[col_axis_num, row_axis_num].plot(mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][5], mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][6], '.', color=cmap[trial_key], alpha=0.75, markersize=0.8)
                                    axs[col_axis_num, row_axis_num].set_title(str(pid))
                                    #axs[col_axis_num, row_axis_num].set_xlim([-0, 900])
                                    #axs[col_axis_num, row_axis_num].set_ylim([-0, 900])
                                    axs[col_axis_num, row_axis_num].set_box_aspect(1)
                                    axs[col_axis_num, row_axis_num].tick_params(direction='in', length=3)
                                    
                        except:
                            print('\t\t[WARNING]: no timesteps found')
                            pass
                    if col_axis_num < pid_col-1:
                        col_axis_num += 1
                    else:
                        if row_axis_num < pid_row-1:
                            row_axis_num += 1
                            col_axis_num = 0
                        else:
                            break
                fig.text(0.5, 0.04, 'linear velocity (m/s)', ha='center', va='center')
                fig.text(0.06, 0.5, 'angular velocity (rad/s)', ha='center', va='center', rotation='vertical')
                fig.suptitle(str(train_or_test) + ' Control Data for Motion Primitive: ' + str(mp))
                plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/' + str(mp) + '_' + str(train_or_test) + '_control_data_all_participants.png', dpi=800, facecolor='w', transparent=True)

            else:
                if type(participantID) == int:
                    pid = 'P' + str(participantID)
                else:
                    pid = participantID
                for trial_key in mp_location['pid'][pid][mp].keys():
                    plt.plot([-0.5, 0.5], [0, 0], '--k', markersize=0.2)
                    plt.plot([0, 0], [-0.2, 0.2], '--k', markersize=0.2)
                    try:
                        for ts_idx in mp_location['pid'][pid][mp][trial_key]['ts_idx']:
                            if ts_idx%10 == 0:
                                plt.plot(mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][5], mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][6], '.', color=cmap[trial_key], markersize=0.5)
                    except:
                        #print('\t\t[WARNING]: no timesteps found')
                        pass
                plt.xlabel('linear velocity (m/s)')
                plt.ylabel('angular velocity (rad/s)')
                plt.title(str(pid) + ' ' + str(train_or_test) + ' Control Data for Motion Primitive: ' + str(mp))

                if not os.path.exists('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid) + '/controls/'):
                    os.makedirs('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid) + '/controls/')
                plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid) + '/controls/' + str(mp) + '_' + str(train_or_test) + '_control_data_' + str(pid) + '.png', dpi=800, facecolor='w', transparent=True)

        #plt.show()
        plt.clf()
        
        return

####################### MAIN FUNCTION #######################################################################################

def main():
    vmd = visualizer()
    vmd.load_dict()

    # get the distribution of motion primitives across all participants
    moprim_dict_all_pid, moprim_location_all_pid, moprim_list = vmd.get_moprim_dist()
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_dict_all_pid_test.json', "w") as write_json:
        json.dump(moprim_dict_all_pid, write_json)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_location_all_pid_test.json', "w") as write_json:
        json.dump(moprim_location_all_pid, write_json)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_list.json', "w") as write_json:
        json.dump(moprim_list, write_json)

    ##



    # # get all instances of a single motion primitive from a single participant
    # single_moprim_single_pid_array = vmd.get_single_moprim_single_pid(11, moprim_location_all_pid, 'fwr')
    # with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/single_moprim_single_pid_test.json', "w") as write_json:
    #     json.dump(single_moprim_single_pid_array, write_json)
    
    # get all instances of a single motion primitive from all participants
    single_moprim_all_pid_array = vmd.get_single_moprim_all_pid(moprim_location_all_pid, 'fwr')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/single_moprim_all_pid_test.json', "w") as write_json:
        json.dump(single_moprim_all_pid_array, write_json)

     # get all instances of all motion primitives during the TRAINING phase from all participants
    training_all_moprim_all_pid_array = vmd.get_all_moprim_all_pid(moprim_location_all_pid, moprim_list, 'Training')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/training_all_moprim_all_pid_test.json', "w") as write_json:
        json.dump(training_all_moprim_all_pid_array, write_json)

    # get all instances of all motion primitives during the TRAINING phase from all participants
    testing_all_moprim_all_pid_array = vmd.get_all_moprim_all_pid(moprim_location_all_pid, moprim_list, 'Testing')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/testing_all_moprim_all_pid_test.json', "w") as write_json:
        json.dump(testing_all_moprim_all_pid_array, write_json)


    #vmd.visualize_odom(single_moprim_all_pid_array, moprim_list, 'fwr', 'P11')

    ##

    pid_list = vmd.get_participantID_list()

    # for pid in pid_list:
    #     for mp_idx in moprim_list['P11']:
    #         print(str(pid) + ', ' + str(mp_idx))
    #         vmd.visualize_odom(training_all_moprim_all_pid_array, moprim_list, mp_idx, 'Training', pid)
    #         vmd.visualize_controls(training_all_moprim_all_pid_array, moprim_list, mp_idx, 'Training', pid)

    #         vmd.visualize_odom(testing_all_moprim_all_pid_array, moprim_list, mp_idx, 'Testing', pid)
    #         vmd.visualize_controls(testing_all_moprim_all_pid_array, moprim_list, mp_idx, 'Testing', pid)

    
    
    for mp_idx in moprim_list['P11']:
        print(mp_idx)
        vmd.visualize_odom(training_all_moprim_all_pid_array, moprim_list, mp_idx, 'Training')
        vmd.visualize_controls(training_all_moprim_all_pid_array, moprim_list, mp_idx, 'Training')

        vmd.visualize_odom(testing_all_moprim_all_pid_array, moprim_list, mp_idx, 'Testing')
        vmd.visualize_controls(testing_all_moprim_all_pid_array, moprim_list, mp_idx, 'Testing')


    return

    ############ MOPRIM INFORMATION #########################################################################################

    # get the distribution of motions primitives across a single participant
    moprim_dict_single_pid, moprim_location_single_pid, moprim_list = vmd.get_moprim_dist(11)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_dict_test.json', "w") as write_json:
        json.dump(moprim_dict_single_pid, write_json)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_location_test.json', "w") as write_json:
        json.dump(moprim_location_single_pid, write_json)

    # get the distribution of motion primitives across all participants
    moprim_dict_all_pid, moprim_location_all_pid, moprim_list = vmd.get_moprim_dist()
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_dict_all_pid_test.json', "w") as write_json:
        json.dump(moprim_dict_all_pid, write_json)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_location_all_pid_test.json', "w") as write_json:
        json.dump(moprim_location_all_pid, write_json)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_list.json', "w") as write_json:
        json.dump(moprim_list, write_json)

    # get all instances of a single motion primitive from a single participant
    single_moprim_single_pid_array = vmd.get_single_moprim_single_pid(11, moprim_location_all_pid, 'fwr')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/single_moprim_single_pid_test.json', "w") as write_json:
        json.dump(single_moprim_single_pid_array, write_json)

    # get all instances of all motion primitives from a single participant
    all_moprim_single_pid_array = vmd.get_all_moprim_single_pid(11, moprim_location_all_pid, moprim_list)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/all_moprim_single_pid_test.json', "w") as write_json:
        json.dump(all_moprim_single_pid_array, write_json)

    # get all instances of a single motion primitive from all participants
    single_moprim_all_pid_array = vmd.get_single_moprim_all_pid(moprim_location_all_pid, 'fwr')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/single_moprim_all_pid_test.json', "w") as write_json:
        json.dump(single_moprim_all_pid_array, write_json)
    
    # get all instances of all motion primitives from all participants
    all_moprim_all_pid_array = vmd.get_all_moprim_all_pid(moprim_location_all_pid, moprim_list)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/all_moprim_all_pid_test.json', "w") as write_json:
        json.dump(all_moprim_all_pid_array, write_json)

    # get all instances of a single motion primitive during the TESTING phase from all participants
    testing_single_moprim_all_pid_array = vmd.get_single_moprim_all_pid(moprim_location_all_pid, 'fwr', 'Testing')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/testing_single_moprim_all_pid_test.json', "w") as write_json:
        json.dump(testing_single_moprim_all_pid_array, write_json)
    
    # get all instances of all motion primitives during the TESTING phase from all participants
    testing_all_moprim_all_pid_array = vmd.get_all_moprim_all_pid(moprim_location_all_pid, moprim_list, 'Testing')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/testing_all_moprim_all_pid_test.json', "w") as write_json:
        json.dump(testing_all_moprim_all_pid_array, write_json)

    # get all instances of a single motion primitive during the TRAINING phase from all participants
    training_single_moprim_all_pid_array = vmd.get_single_moprim_all_pid(moprim_location_all_pid, 'fwr', 'Training')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/training_single_moprim_all_pid_test.json', "w") as write_json:
        json.dump(training_single_moprim_all_pid_array, write_json)
    
    # get all instances of all motion primitives during the TRAINING phase from all participants
    training_all_moprim_all_pid_array = vmd.get_all_moprim_all_pid(moprim_location_all_pid, moprim_list, 'Training')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/training_all_moprim_all_pid_test.json', "w") as write_json:
        json.dump(training_all_moprim_all_pid_array, write_json)

    return 

    ############ PID INFORMATION ############################################################################################

    pid_list = vmd.get_participantID_list()

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
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/test_timestep_test.json', "w") as write_json:
        json.dump(test_timestep_test, write_json)




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

