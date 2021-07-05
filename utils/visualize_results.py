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
import matplotlib as mpl
#import matplotlib.rcParams as rcp
import cv2 as cv
import scipy as sp
from scipy.spatial import ConvexHull, convex_hull_plot_2d
from scipy import ndimage
from decimal import Decimal
import pandas as pd

class visualizer:
    def __init__(self):
        self.dpath = '/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/master_dict.json'
        self.training_all_moprim_all_pid_array = collections.OrderedDict()
        self.testing_all_moprim_all_pid_array = collections.OrderedDict()
        self.pid_to_pid2_map = {"P11": "P1",
                                "P8": "P2",
                                "P23": "P3",
                                "P3": "P4",
                                "P13": "P5",
                                "P21": "P6",
                                "P2": "P7",
                                "P10": "P8",
                                "P19": "P9",
                                "P24": "P10",
                                "P6": "P11",
                                "P20": "P12",
                                "P5": "P13",
                                "P4": "P14",
                                "P7": "P15",
                                "P22": "P16",
                                "P9": "P17",
                                "P14": "P18"
                                }
        self.cho_metric_array = collections.OrderedDict()
        self.questionnaire_array = collections.OrderedDict()
     
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
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        if date == 0:
            date_from_dict, date_key = self.get_date_auto(participantID)
        else:
            date_key = date

        questionnaire = self.md['participantID'][pid]['date'][date_key]['Questionnaire']

        return questionnaire

    def initialize_cho_metric_array(self, pid_array, train_or_test, mp_list):
        print(mp_list)
        for pid in pid_array:
            self.cho_metric_array[pid] = {}
            for phase in train_or_test:
                self.cho_metric_array[pid][phase] = {}

                for mp in mp_list:
                    self.cho_metric_array[pid][phase][mp] = {}
                    print(str(pid) + ' ' + str(phase) + ' ' + str(mp))
        return


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

    # returns the distribution of motion primitives from either all participants or a single participant (wraps self.get_morpims())
    def get_moprim_dist(self, participantID='na', date=0):

        # IF/ELSE to handle PID as either an int (#) or a string ('P#')
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

                # TODO: test this (questionnaire response logging)
                questionnaire_temp = self.get_questionnaire_response(pid)
                self.questionnaire_array[pid] = {pid: questionnaire_temp}

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

    # returns a single participant's distribution of motion primitives
    def get_moprims(self, participantID, moprim_list, mp_dist, mp_location, test_or_train=0, block_num=0, trial_num=0, date=0):

        # IF/ELSE to handle PID as either an int (#) or a string ('P#')
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

    # returns a single trial array
    def get_trial_array(self, participantID, test_or_train, block_num, trial_num, date=0):

        # IF/ELSE to handle PID as either an int (#) or a string ('P#')
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID

        # IF/ELSE to handle block number as either an int (#) or a string ('${test_or_train} Block #')
        if type(block_num) == int:
            block2get = test_or_train + ' Block ' + str(block_num)
        else:
            block2get = block_num

        # IF/ELSE to handle trial number as either an int (#) or a string ('Trial #')
        if type(trial_num) == int:
            trial2get = 'Trial ' + str(trial_num)
        else:
            trial2get = trial_num

        # if a specific date is not provided, it is retrieved from the visualizer's get_date_auto() method
        # NOTE: TODO: this will need to be tweaked considerably to handle multiple experiments over multiple days for a single participant
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

        # IF/ELSE to handle PID as either an int (#) or a string ('P#')
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

        # IF/ELSE to handle PID as either an int (#) or a string ('P#')
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

        # hard-coded custom colormap
        cmap = ['lightcoral', 'forestgreen', 'deepskyblue', 'saddlebrown', 'khaki', 'turquoise', 'orchid', 'peru', 'gold', 'cyan', 'slategrey', 'crimson', 'blueviolet', 'darkorange', 'lawngreen']

        # IF case for unspecified phase; includes both training and testing phase data
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

        # ELSE case where training/testing phase is specified
        else:
            # IF case for pid not provided; show data for all participants
            if participantID == 0:
                pid_list = self.get_participantID_list()
                pid_num = len(pid_list)
                pid_col = 3
                pid_row = 6
                fig, axs = plt.subplots(pid_col, pid_row, sharey=True, sharex=True)
                col_axis_num = 0
                row_axis_num = 0

                # iterate through PIDs for a given motion primitive
                for pid in mp_location['pid'].keys():

                    # NOTE: temporary mapping to change PIDs to ascending order
                    # TODO: figure out a better, more flexible way to handle this besides a hardcoded mapping
                    pid2 = self.pid_to_pid2_map[pid]

                    print('\nplotting ' + str(pid) + ' on subplot axis: ' + str(col_axis_num) + ', ' + str(row_axis_num))

                    # iterate through trials for a given PID + motion primitive
                    for trial_key in mp_location['pid'][pid][mp].keys():
                        print('\tcurrently on trial: ' + str(trial_key))
                        axs[col_axis_num, row_axis_num].plot([410, 440], [425, 425], '--k', markersize=0.2)
                        axs[col_axis_num, row_axis_num].plot([425, 425], [415, 440], '--k', markersize=0.2)
                        try:
                            # iterate trough timesteps for given PID + motion primitive + current trial
                            for ts_idx in mp_location['pid'][pid][mp][trial_key]['ts_idx']:
                                x = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0]
                                y = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][1]
                                theta = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][2]

                                # this conditional is to trim down the number of samples plotted; change the value after the module (%) operator to choose a new trajectory resolution to plot
                                if ts_idx%20 == 0:
                                    axs[col_axis_num, row_axis_num].plot(mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0], mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][1], '.', color=cmap[trial_key], alpha=0.75, markersize=0.6)
                                    axs[col_axis_num, row_axis_num].plot([x, x + (10*np.cos(theta))],[y, y + (10*np.sin(theta))],'-', color=cmap[trial_key], markersize=0.05)
                                    axs[col_axis_num, row_axis_num].set_title(str(pid2))
                                    axs[col_axis_num, row_axis_num].set_box_aspect(1)
                                    axs[col_axis_num, row_axis_num].tick_params(direction='in', length=3, labelsize=5)
   
                        except:
                            print('\t\t[WARNING]: no timesteps found')
                            pass
                    
                    # IF/ELSE handles iteration through subplot indices
                    if col_axis_num < pid_col-1:
                        col_axis_num += 1
                    else:
                        if row_axis_num < pid_row-1:
                            row_axis_num += 1
                            col_axis_num = 0
                        else:
                            break
                
                # generate text for figure
                fig.text(0.5, 0.04, 'x (px)', ha='center', va='center')
                fig.text(0.06, 0.5, 'y (px)', ha='center', va='center', rotation='vertical')
                fig.suptitle(str(train_or_test) + ' Pose Data for Motion Primitive: ' + str(mp))

                # TODO: make this a toggle argument (whether to save or show plots)
                #print('\t...vertices plotted! Preparing to show plot.')
                #plt.show()

                # save plots according to provided file path & formatting  
                if not os.path.exists('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/'):
                    os.makedirs('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/')
                plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/' + str(mp) + '_' + str(train_or_test) + '_pose_data_all_participants.png', dpi=800, facecolor='w', transparent=True)

            # ELSE case where pid is provided
            else:

                # IF/ELSE to handle PID as either an int (#) or a string ('P#')
                if type(participantID) == int:
                    pid = 'P' + str(participantID)
                else:
                    pid = participantID
                
                # NOTE: temporary mapping to change PIDs to ascending order
                # TODO: figure out a better, more flexible way to handle this besides a hardcoded mapping
                pid2 = self.pid_to_pid2_map[pid]

                # iterate through all trials for specified PID + motion primitive
                for trial_key in mp_location['pid'][pid][mp].keys():
                    plt.plot([410, 440], [425, 425], '--k', markersize=0.2)
                    plt.plot([425, 425], [415, 440], '--k', markersize=0.2)
                    try:
                        for ts_idx in mp_location['pid'][pid][mp][trial_key]['ts_idx']:
                            if ts_idx%20 == 0:
                                x = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0]
                                y = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][1]
                                theta = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][2]
                                plt.plot(mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][0], mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][1], '.', color=cmap[trial_key], alpha=0.75, markersize=0.6)
                                plt.plot([x, x + (10*np.cos(theta))],[y, y + (10*np.sin(theta))],'-', color=cmap[trial_key], markersize=0.01)
                    except:
                        print('\t\t[WARNING]: no timesteps found')
                        pass

                # generate text for figure
                plt.xlabel('x (px)')
                plt.ylabel('y (px)')
                plt.title(str(pid2) + ' ' + str(train_or_test) + ' Pose Data for Motion Primitive: ' + str(mp))

                # TODO: make this a toggle argument (whether to save or show plots)
                #print('\t...vertices plotted! Preparing to show plot.')
                #plt.show()

                # save plots according to provided file path & formatting        
                if not os.path.exists('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/pose/' + str(mp) + '/'):
                    os.makedirs('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/pose/' + str(mp) + '/')
                plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/pose/' + str(mp) + '/' + str(pid2) + '_' + str(mp) + '_' + str(train_or_test) + '_pose_data_.png', dpi=800, facecolor='w', transparent=True)
            
        #plt.show()

        # clear figure
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
                    pid2 = self.pid_to_pid2_map[pid]         
                    print('plotting ' + str(pid) + ' on subplot axis: ' + str(col_axis_num) + ', ' + str(row_axis_num))
                    for trial_key in mp_location['pid'][pid].keys():
                        ms_iterate = 0.2
                        for ts_idx in mp_location['pid'][pid][trial_key]['ts_idx']:
                            if ts_idx%10 == 0:
                                ms_iterate += 0.05
                                #axs[col_axis_num, row_axis_num].plot(mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][5], mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][6], '.', alpha=0.75, markersize=0.6)
                                axs[col_axis_num, row_axis_num].plot(-mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][5], mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][6], '.', alpha=0.75, markersize=ms_iterate)
                                axs[col_axis_num, row_axis_num].set_title(str(pid2))
                                axs[col_axis_num, row_axis_num].set_box_aspect(1)
                                axs[col_axis_num, row_axis_num].tick_params(direction='in', length=3, labelsize=5)
                    if col_axis_num < pid_col-1:
                        col_axis_num += 1
                    else:
                        if row_axis_num < pid_row-1:
                            row_axis_num += 1
                            col_axis_num = 0
                        else:
                            break
                if not os.path.exists('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/'):
                    os.makedirs('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/')
                plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/' + str(mp) + '_' + str(train_or_test) + 'comparison_control_data_all_participants.png', dpi=800, facecolor='w', transparent=True)

            else:
                if type(participantID) == int:
                    pid = 'P' + str(participantID)
                else:
                    pid = participantID
                #print(pid)
                #print(mp_location['pid'].keys())
                #print(mp_location['pid'][pid])
                pid2 = self.pid_to_pid2_map[pid]
                for trial_key in mp_location['pid'][pid].keys():
                    ms_iterate = 0.2
                    for ts_idx in mp_location['pid'][pid][trial_key]['ts_idx']:
                        if ts_idx%10 == 0:
                            ms_iterate += 0.05
                            plt.plot(mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][5], -mp_location['pid'][pid][trial_key]['ts_idx'][ts_idx][6], '.', alpha=0.75, markersize=ms_iterate)
                if not os.path.exists('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/'):
                    os.makedirs('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/')
                plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/' + str(pid2) + '_' + str(mp) + '_comparison_control_data.png', dpi=800, facecolor='w', transparent=True)


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
                    pid2 = self.pid_to_pid2_map[pid]                
                    print('\nplotting ' + str(pid) + ' on subplot axis: ' + str(col_axis_num) + ', ' + str(row_axis_num))
                    for trial_key in mp_location['pid'][pid][mp].keys():
                        ms_iterate = 0.2
                        print('\tcurrently on trial: ' + str(trial_key))
                        axs[col_axis_num, row_axis_num].plot([-0.05, 0.05], [0, 0], '--k', markersize=0.05)
                        axs[col_axis_num, row_axis_num].plot([0, 0], [-0.05, 0.05], '--k', markersize=0.05)
                        try:
                            for ts_idx in mp_location['pid'][pid][mp][trial_key]['ts_idx']:
                                if ts_idx%10 == 0:
                                    ms_iterate += 0.05
                                    axs[col_axis_num, row_axis_num].plot(-mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][5], mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][6], '.', color=cmap[trial_key], alpha=0.75, markersize=ms_iterate)
                                    axs[col_axis_num, row_axis_num].set_title(str(pid2))
                                    #axs[col_axis_num, row_axis_num].set_xlim([-0, 900])
                                    #axs[col_axis_num, row_axis_num].set_ylim([-0, 900])
                                    axs[col_axis_num, row_axis_num].set_box_aspect(1)
                                    axs[col_axis_num, row_axis_num].tick_params(direction='in', length=3, labelsize=5)
                                    
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
                fig.text(0.5, 0.04, 'angular velocity (rad/s)', ha='center', va='center')
                fig.text(0.06, 0.5, 'linear velocity (m/s)', ha='center', va='center', rotation='vertical')
                fig.suptitle(str(train_or_test) + ' Control Data for Motion Primitive: ' + str(mp))

                if not os.path.exists('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/'):
                    os.makedirs('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/')
                plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/all_participants/' + str(mp) + '/' + str(mp) + '_' + str(train_or_test) + '_control_data_all_participants.png', dpi=800, facecolor='w', transparent=True)

            else:
                if type(participantID) == int:
                    pid = 'P' + str(participantID)
                else:
                    pid = participantID
                pid2 = self.pid_to_pid2_map[pid]
                for trial_key in mp_location['pid'][pid][mp].keys():
                    ms_iterate = 0.2
                    plt.plot([-0.05, 0.05], [0, 0], '--k', markersize=0.05)
                    plt.plot([0, 0], [-0.05, 0.05], '--k', markersize=0.05)
                    try:
                        for ts_idx in mp_location['pid'][pid][mp][trial_key]['ts_idx']:
                            if ts_idx%10 == 0:
                                ms_iterate += 0.05
                                plt.plot(-mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][5], mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][6], '.', color=cmap[trial_key], alpha=0.75, markersize=ms_iterate)
                    except:
                        #print('\t\t[WARNING]: no timesteps found')
                        pass
                plt.xlabel('angular velocity (rad/s)')
                plt.ylabel('linear velocity (m/s)')                
                plt.title(str(pid2) + ' ' + str(train_or_test) + ' Control Data for Motion Primitive: ' + str(mp))

                if not os.path.exists('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/'):
                    os.makedirs('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/')
                plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/' + str(mp) + '_' + str(train_or_test) + '_control_data_' + str(pid2) + '.png', dpi=800, facecolor='w', transparent=True)

        #plt.show()
        plt.clf()
        
        return

    # computes the convex hull of a set of control points using scipy's ConvexHull() method ## opencv-python's convexHull() method
    def compute_convex_hull(self, mp_list, mp, train_or_test=0, participantID=0):

        cmap = ['lightcoral', 'forestgreen', 'deepskyblue', 'saddlebrown', 'khaki', 'turquoise', 'orchid', 'peru', 'gold', 'cyan', 'slategrey', 'crimson', 'blueviolet', 'darkorange', 'lawngreen']
        
        if type(participantID) == int:
            pid = 'P' + str(participantID)
        else:
            pid = participantID
        pid2 = self.pid_to_pid2_map[pid]
        
        # IF case for specified testing vs. training phase
        if train_or_test != 0:
            if train_or_test == 'Training':
                    mp_location = self.training_all_moprim_all_pid_array
            elif train_or_test == 'Testing':
                mp_location = self.testing_all_moprim_all_pid_array

            mp_control_array = np.array([[0, 0]])
            for trial_key in mp_location['pid'][pid][mp].keys():
                try:
                    for ts_idx in mp_location['pid'][pid][mp][trial_key]['ts_idx']:
                        lv = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][5]
                        tv = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][6]
                    
                        arr_to_append = np.array([-lv, tv])
                        mp_control_array = np.append(mp_control_array, [arr_to_append], axis=0)
                    
                except:
                    print('\t\t[WARNING]: no timesteps found for trial: ' + str(trial_key))
                    pass
            
            # remove the initial row of zeros (included for initializing the numpy array)
            mp_control_array = np.delete(mp_control_array, 0, 0)

            ## NOTE: TODO: FURTHER TRIMMING OF CONTROL POINTS WOULD BE HELPFUL; re: the importance of omission (TOGGLE)

            # plot coordinate frame on subplot
            plt.plot([-0.05, 0.05], [0, 0], '--k', markersize=0.05) # 35 (maxangvel) / 60 (fps)
            plt.plot([0, 0], [-0.05, 0.05], '--k', markersize=0.05) # 95 (maxlinvel) / 50 (fps)
        

            # compute convex hull (CHO) for motion primitive timeseries
            print('\n[1] beginning to compute convex hull for PID: ' + str(pid) + ', MP: ' + str(mp) + '...')
            hull = ConvexHull(mp_control_array)
            print('\t...hull computed!')

            # plot control points for visualization purposes
            print('[2] beginning to plot control points...')
            plt.plot(mp_control_array[:,0], mp_control_array[:,1], 'o', markersize=0.75, alpha=0.6)
            print('\t...control points plotted!')

            # compute the standard deviation of control signals across motion primitive timeseries
            stdev = np.std(mp_control_array, axis=0)
            # format the standard deviation of angular (tv) and linear (lv) velocities to cap # of significant figures
            stdev_tv = "{:.5f}".format(stdev[0])
            stdev_lv = "{:.5f}".format(stdev[1])

            # compute the area of the hull computed via CHO
            hull_area = hull.area
            # format the hull's area to cap # of significant figures
            hull_area_reduced = "{:.5f}".format(hull_area)

            # compute the bi-axial centroids of the hull computed via CHO
            hull_centroid = mp_control_array.mean(axis=0)
            # format the centroids along the angular (tv) and linear (lv) velocity axes to cap # of significant figures
            hull_centroid_lv = "{:.5f}".format(hull_centroid[0])
            hull_centroid_tv = "{:.5f}".format(hull_centroid[1])
            # store the reduced format centroids in a single array
            hull_centroid_reduced = [float(hull_centroid_lv), float(hull_centroid_tv)]

            # TODO: test for functionality (CHO metric logging)
            cho_metric_list = [float(stdev_tv), float(stdev_lv), float(hull_area_reduced), float(hull_centroid_lv), float(hull_centroid_tv)]
            self.cho_metric_array[pid][train_or_test][mp] = cho_metric_list

            # plot simplices from CHO
            simplex_plot_counter = 0
            print('[3] beginning to plot simplices...')
            for simplex in hull.simplices:
                print('\t...plotting simplex #' + str(simplex_plot_counter) + ' ...')
                plt.plot(mp_control_array[simplex, 0], mp_control_array[simplex,1], 'k-')
                simplex_plot_counter += 1
            print('\t...all simplices plotted!')
            
            # plot vertices from CHO
            print('[4] beginning to plot vertices...')
            plt.plot(mp_control_array[hull.vertices[:],0], mp_control_array[hull.vertices[:],1], 'ro', markersize=0.6) # plot outermost points (used as vertices)
            plt.title('Convex Hull for ' + str(train_or_test) + ' Phase' + '\nParticipant: ' + str(pid2) + '; Motion Primitive: ' + str(mp) + '\nArea: ' + str(hull_area_reduced) + '; Centroid: ' + str(hull_centroid_reduced) + '\nLinear st.dev.: ' + str(stdev_lv) + '; Angular st.dev.: ' + str(stdev_tv), fontsize=6)
            plt.xlabel('angular velocity (m/s)')
            plt.ylabel('linear velocity (rad/s)')


            # TODO: make this a toggle argument (whether to save or show plots)
            #print('\t...vertices plotted! Preparing to show plot.')
            #plt.show()

            # save plots according to provided file path & formatting
            print('\t...vertices plotted! Preparing to save plot...')
            if not os.path.exists('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/'):
                os.makedirs('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/')
            plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/' + str(pid2) + '_' + str(mp) + '_CHO_' + str(train_or_test) + '_phase_control_data_' + '.png', dpi=800, facecolor='w', transparent=True)

        # ELSE case for unspecified training vs. testing phase (plots side-by-side for comparison)
        else:
            
            # set up subplots w/ shared axes
            fig, (axs1, axs2) = plt.subplots(1, 2, sharey=True, sharex=True)

            # phase_array allows us to increment through both the Training and Testing phases
            phase_array = ['Training', 'Testing']
            for phase in phase_array:
                if phase == 'Training':
                    mp_location = self.training_all_moprim_all_pid_array
                    axs = axs1
                elif phase == 'Testing':
                    mp_location = self.testing_all_moprim_all_pid_array
                    axs = axs2
                
                # initialize the numpy array which will store linear and angular velocities (control signals)
                mp_control_array = np.array([[0, 0]])

                # iterate through all trials for a given pid + motion primitive
                for trial_key in mp_location['pid'][pid][mp].keys():
                    try:
                        # iterate through all timesteps in the current trial
                        for ts_idx in mp_location['pid'][pid][mp][trial_key]['ts_idx']:
                            # assign the linear (lv) and angular (tv) velocities for the given timestep to lv, tv
                            lv = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][5]
                            tv = mp_location['pid'][pid][mp][trial_key]['ts_idx'][ts_idx][6]
                    
                            arr_to_append = np.array([-lv, tv])
                            mp_control_array = np.append(mp_control_array, [arr_to_append], axis=0)
                    
                    # NOTE: at present, the 'except' will trigger (at least) once for each block because of an empty trial sub-dict in the json files
                    # TODO: fix this (non-intrusive but annoying) formatting issue in parse_results.py (!)
                    except:
                        print('\t\t[WARNING]: no timesteps found for trial: ' + str(trial_key))
                        pass
                
                # remove the initial row of zeros (included for initializing the numpy array)
                mp_control_array = np.delete(mp_control_array, 0, 0)
                
                ## NOTE: TODO: FURTHER TRIMMING OF CONTROL POINTS WOULD BE HELPFUL; re: the importance of omission (TOGGLE)

                # plot coordinate frame on subplot
                axs.plot([-0.05, 0.05], [0, 0], '--k', markersize=0.2) # 35 (maxangvel) / 60 (fps)
                axs.plot([0, 0], [-0.05, 0.05], '--k', markersize=0.2) # 95 (maxlinvel) / 50 (fps)
            
                # compute convex hull (CHO) for motion primitive timeseries
                print('\n[1] beginning to compute convex hull for PID: ' + str(pid) + ', MP: ' + str(mp) + '...')
                hull = ConvexHull(mp_control_array)
                print('\t...hull computed!')

                # plot control points for visualization purposes
                print('[2] beginning to plot ' + str(phase) + ' data control points...')
                axs.plot(mp_control_array[:,0], mp_control_array[:,1], 'o', markersize=0.75, alpha=0.6)
                print('\t...control points plotted!')

                # compute the standard deviation of control signals across motion primitive timeseries
                stdev = np.std(mp_control_array, axis=0)
                # format the standard deviation of angular (tv) and linear (lv) velocities to cap # of significant figures
                stdev_tv = "{:.5f}".format(stdev[0])
                stdev_lv = "{:.5f}".format(stdev[1])

                # compute the area of the hull computed via CHO
                hull_area = hull.area
                # format the hull's area to cap # of significant figures
                hull_area_reduced = "{:.5f}".format(hull_area)

                # compute the bi-axial centroids of the hull computed via CHO
                hull_centroid = mp_control_array.mean(axis=0)
                # format the centroids along the angular (tv) and linear (lv) velocity axes to cap # of significant figures
                hull_centroid_lv = "{:.5f}".format(hull_centroid[0])
                hull_centroid_tv = "{:.5f}".format(hull_centroid[1])
                # store the reduced format centroids in a single array
                hull_centroid_reduced = [float(hull_centroid_lv), float(hull_centroid_tv)]

                # TODO: test for functionality (CHO metric logging) # NOTE: INITIAL TEST LOOKS SUCCESSFUL
                cho_metric_list = [float(stdev_tv), float(stdev_lv), float(hull_area_reduced), float(hull_centroid_lv), float(hull_centroid_tv)]
                self.cho_metric_array[pid][train_or_test][mp] = cho_metric_list

                # if pid in self.cho_metric_array.keys() == False:
                #     #    self.cho_metric_array[pid] =
                #     if train_or_test in self.cho_metric_array[pid].keys() == False:
                #         self.cho_metric_array[pid] = {train_or_test : mp}
                # if mp in self.cho_metric_array[pid][train_or_test].keys() == False:
                #     self.cho_metric_array[pid][train_or_test] = {mp: cho_metric_list}

                # plot simplices from CHO
                simplex_plot_counter = 0
                print('[3] beginning to plot simplices...')
                for simplex in hull.simplices:
                    print('\t...plotting simplex #' + str(simplex_plot_counter) + ' ...')
                    axs.plot(mp_control_array[simplex, 0], mp_control_array[simplex,1], 'k-')
                    simplex_plot_counter += 1
                print('\t...all simplices plotted!')
                
                # plot vertices from CHO
                print('beginning to plot vertices...')
                axs.plot(mp_control_array[hull.vertices[:],0], mp_control_array[hull.vertices[:],1], 'ro') # plot outermost points (used as vertices)
                print('\t...vertices plotted!')
                axs.set_box_aspect(1)
                axs.tick_params(direction='in', length=3, labelsize=5)
                axs.set_title(str(phase) + ' Phase\nArea: ' + str(hull_area_reduced) + '; Centroid: ' + str(hull_centroid_reduced) + '\nLinear st.dev.: ' + str(stdev_lv) + '; Angular st.dev.: ' + str(stdev_tv))#, size=3)#, fontdict['fontsize']=10)#, fontsize=10)
                axs.plot(hull_centroid[0],'*y')

            # generate text for figure
            fig.text(0.5, 0.04, 'angular velocity (rad/s)', ha='center', va='center')
            fig.text(0.06, 0.5, 'linear velocity (m/s)', ha='center', va='center', rotation='vertical')
            fig.suptitle('Control Signal Hulls for Training vs. Testing\nParticipant: ' + str(pid2) + '; Motion Primitive: ' + str(mp))

            # TODO: make this a toggle argument (whether to save or show plots)
            #print('\t...vertices plotted! Preparing to show plot.')
            #plt.show()

            # save plots according to provided file path & formatting           
            print('Preparing to save plot...')
            if not os.path.exists('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/'):
                    os.makedirs('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/')
            plt.savefig('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_figures/single_participant_data/' + str(pid2) + '/controls/' + str(mp) + '/' + str(pid2) + '_' + str(mp) + '_CHO_phase_comparison' + '_control_data_' + '.png', dpi=800, facecolor='w', transparent=True)

        # clear figure
        plt.clf()

        return

    #
    def get_cho_params_from_log(self, pid='na', test_or_train='na', mp='na'):
        if pid != 'na':
            cho_metric_temp = self.cho_metric_array[pid]
            if test_or_train != 'na':
                cho_metric_temp = cho_metric_temp[test_or_train]
                if mp !='na':
                    cho_metric_temp = cho_metric_temp[mp]
                else:
                    return cho_metric_temp
            else:
                return cho_metric_temp
        else:
            print('returning entire array; error encountered at pid selection')
            return self.cho_metric_array

        return

    # 
    # NOTE: population=0 refers to visualizing results from the entire population
    def visualize_cho_data(self, pid_list, phase_array, mp_list, plot_choice, population=0, test_or_train='na', moprim='na'):

        ## NOTE: 
        ## [0] = stdev_tv
        ## [1] = stdev_lv
        ## [2] = hull_area_reduced
        ## [3] = hull_centroid_lv
        ## [4] = hull_centroid_tv

        #array = np.array([0, 0, 0, 0, 0, 0, 0])

        # flag for plotting individual distributions


        # flag for plotting all distributions

        # plot objects
        labels = mp_list

        x = np.arange(len(labels))
        width = 0.2

        fig, ax = plt.subplots()

        ave_list = np.array([[0, 0, 0, 0, 0, 0, 0]])


        # [plot choice 1] plot CHO distribution across all participants, per motion primitive
        for pid in pid_list:

            for phase in phase_array:


                for mp in mp_list:
                    try:
                        

                        #print(pid)
                        #print(phase)
                        #print(mp)
                        #cho_metric = self.get_cho_params_from_log(pid, phase, mp)
                        cho_metric = self.cho_metric_array[pid][phase][mp]
                        # flattern out cho_metrics into large array
                        #ave_list = np.append(ave_list, [cho_metric[0]])


                        print('\n\ncho_metric below:\n')
                        print(cho_metric)
                        
                        #index = mp_list.index(mp)
                        #bar_space = 


                        #ax.bar(x, cho_metric[0], width)

                        # rects1 = ax.bar(x - 2*(width/len(labels)), cho_metric[0], width, label='stdev_tv')
                        # rects2 = ax.bar(x - width/len(labels), cho_metric[1], width, label='stdev_lv')
                        # rects3 = ax.bar(x, cho_metric[2], width, label='hull_area')
                        # rects4 = ax.bar(x + width/len(labels), cho_metric[3], width, label='centroid_lv')
                        # rects5 = ax.bar(x + 2*(width/len(labels)), cho_metric[4], width, label='centroid_tv')



                        #print(cho_metric)

                        ave_list = np.append(ave_list, np.array([[pid, mp, cho_metric[0], cho_metric[1], cho_metric[2], cho_metric[3], cho_metric[4]]]), axis=0)
                        print('\t\t\tave_list successfully appended')


                        #df = pd.DataFrame(cho_metric, columns=cho_metric.keys())
                        #print(df.to_string)
                    except:
                        pass
                        # rects1 = ax.bar(x - 2*(width/len(labels)), 0.0, width, label='stdev_tv')
                        # rects2 = ax.bar(x - width/len(labels), 0.0, width, label='stdev_lv')
                        # rects3 = ax.bar(x, 0.0, width, label='hull_area')
                        # rects4 = ax.bar(x + width/len(labels), 0.0, width, label='centroid_lv')
                        # rects5 = ax.bar(x + 2*(width/len(labels)), 0.0, width, label='centroid_tv')

            ax.set_ylabel('#')
            ax.set_title('Scores by motion primitive for: ' + str(pid))
            ax.set_xticks(x)
            ax.set_xticklabels(labels)
            #ax.legend()

            #ax.bar_label(rects1, padding=3)
            #ax.bar_label(rects2, padding=3)
            #ax.bar_label(rects3, padding=3)
            #ax.bar_label(rects4, padding=3)
            #ax.bar_label(rects5, padding=3)

            fig.tight_layout()
            #plt.show()

        print('\n[NOTE:] printing ave_list below: ')
        print(ave_list)

        return


    # adapted from user 'eumiro' @ url: https://stackoverflow.com/questions/6913532/display-a-decimal-in-scientific-notation
    def format_e(n):
        a = '%E' % n
        return a.split('E')[0].rstrip('0').rstrip('.') + 'E' + a.split('E')[1]

    #
    def export_logs(self):
        with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/questionnaire_responses.json', "w") as write_json:
            json.dump(self.questionnaire_array, write_json)
        with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/cho_metrics.json', "w") as write_json:
            json.dump(self.cho_metric_array, write_json)


####################### MAIN FUNCTION #######################################################################################

def main():
    vmd = visualizer()
    vmd.load_dict()
    
    ############ MOPRIM INFORMATION #########################################################################################

    # get the distribution of motion primitives across all participants
    moprim_dict_all_pid, moprim_location_all_pid, moprim_list = vmd.get_moprim_dist()
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_dict_all_pid_test.json', "w") as write_json:
        json.dump(moprim_dict_all_pid, write_json)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_location_all_pid_test.json', "w") as write_json:
        json.dump(moprim_location_all_pid, write_json)
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_list.json', "w") as write_json:
        json.dump(moprim_list, write_json)

    # get all instances of a single motion primitive from all participants
    single_moprim_all_pid_array = vmd.get_single_moprim_all_pid(moprim_location_all_pid, 'fwr')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/single_moprim_all_pid_test.json', "w") as write_json:
        json.dump(single_moprim_all_pid_array, write_json)

     # get all instances of all motion primitives during the TRAINING phase from all participants
    vmd.training_all_moprim_all_pid_array = vmd.get_all_moprim_all_pid(moprim_location_all_pid, moprim_list, 'Training')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/training_all_moprim_all_pid_test.json', "w") as write_json:
        json.dump(vmd.training_all_moprim_all_pid_array, write_json)

    # get all instances of all motion primitives during the TRAINING phase from all participants
    vmd.testing_all_moprim_all_pid_array = vmd.get_all_moprim_all_pid(moprim_location_all_pid, moprim_list, 'Testing')
    with open('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/testing_all_moprim_all_pid_test.json', "w") as write_json:
        json.dump(vmd.testing_all_moprim_all_pid_array, write_json)

    # generate a list of all participant IDs
    pid_list = ['P11', 'P28'] #vmd.get_participantID_list()
    # generate an array for storing current phase
    #phase_array = [0, 'Training', 'Testing']
    phase_array = ['Training', 'Testing']

    # initalize cho_metric_array class object
    vmd.initialize_cho_metric_array(pid_list, phase_array, moprim_list['P11'])

    #vmd.export_logs()

    #return

    # iterate through all participants
    for pid in pid_list:
        # iterate through all motion primitives
        for mp_idx in moprim_list['P11']:
            # iterate through all phases (NOTE: different behavior for phase_array[0] = 0)
            for phase in phase_array:
                try:
                    vmd.compute_convex_hull(moprim_list, mp_idx, phase, pid)
                except:
                    print('encountered issue with convex hull computation for: ' + str(pid) + '; ' + str(mp_idx) + '; PHASE: ' + str(phase))
 
    # export additional information as .json files, organized by PID
    vmd.export_logs()

    # NOTE: testing using dataframes (pandas) w/ json
    #df = pd.read_json('/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/moprim_list.json')
    #print(df.to_string())
    #print(df.info())

    vmd.visualize_cho_data(pid_list, phase_array, moprim_list['P11'], 0)

    # export additional information as .json files, organized by PID
    #vmd.export_logs()



    return   

    # FOR loop of all motion primitives in a given motion primitive list ('P11' here contains all moprims, and so this is the case for a complete list)
    # NOTE: this is for all participants
    for mp_idx in moprim_list['P11']:
        print(mp_idx)
        # visualize the odometry and controls for the training phase
        vmd.visualize_odom(vmd.training_all_moprim_all_pid_array, moprim_list, mp_idx, 'Training')
        vmd.visualize_controls(vmd.training_all_moprim_all_pid_array, moprim_list, mp_idx, 'Training')

        # visualize the odometry and controls for the testing phases
        vmd.visualize_odom(vmd.testing_all_moprim_all_pid_array, moprim_list, mp_idx, 'Testing')
        vmd.visualize_controls(vmd.testing_all_moprim_all_pid_array, moprim_list, mp_idx, 'Testing')

    # export additional information as .json files, organized by PID
    vmd.export_logs()

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

