#!/usr/bin/env python
# -*- coding: utf-8 -*-
import collections
import json
import argparse
import os
import itertools
import random
from textwrap import dedent
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
import similaritymeasures
import trajectory_recovery_v3_callable as trc # custom scripts for polynomial recreation of optimal timeseries (for comparison)

#


class traj_sim():
    def __init__(self):
        self.dpath_test = '/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/testing_all_moprim_all_pid_test.json'
        self.dpath_train = '/home/mossti/Documents/argallab/RemoteHRI_support/rhri_data/test/training_all_moprim_all_pid_test.json'
        self.test_ds = []
        self.train_ds = []
        #self.mp_list = ['fwr', 'bwr', 'bwl', 'fwl', 'fwr_cw', 'bwr_ccw', 'bwl_cw', 'fwl_ccw', 'fw', 'bw', 'cw', 'ccw']
        self.mp_list = ['fwr', 'bwr', 'bwl', 'fwl', 'fwr_cw', 'bwr_ccw', 'bwl_cw', 'fwl_ccw']
        self.mp_map = {'fwr': 'forward-right', 'bwr': 'backward-right', 'bwl': 'backward-left', 'fwl': 'forward-left', 'fwr_cw': 'forward-right-clockwise',
                       'bwr_ccw': 'backward-right-counterclockwise', 'bwl_cw': 'backward-left-clockwise', 'fwl_ccw': 'forward-left-counterclockwise'}  # TODO: finish this map
        self.pid_list = ["P11", "P8", "P23", "P3", "P13", "P21", "P2", "P10",
                         "P19", "P24", "P6", "P20", "P5", "P4", "P7", "P22", "P9", "P14"]
        self.pid2_list = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8",
                          "P9", "P10", "P11", "P12", "P13", "P14", "P15", "P16", "P17", "P18"]
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
        self.sim_metric_map = {"df": "discrete Frechet distance",
                               "pcm": "partial curve mapping", "dtw": "dynamic time warping"}
    #

################################################################################################################################
### DATA LOADING AND PREPARATION ###############################################################################################
################################################################################################################################

    # initializes self.test_ds and self.train_ds
    def load_moprim_data(self):
        # load and store all test data
        with open(self.dpath_test, "r") as read_json1:
            self.test_ds = json.load(read_json1)

        # load and store all training data
        with open(self.dpath_train, "r") as read_json2:
            self.train_ds = json.load(read_json2)

        return

    # recovers a single trajectory [x, y] from a specified pid, mp, trial number, and a provided list of timestep counts
    def recover_trajectory_from_json(self, pid, mp, trial_num, ts_list):
        print('\n\t[NOTE:] recovering trajectory #: ' + str(trial_num))

        trial_key = str(int(ts_list[trial_num, 0]))
        ts_total = ts_list[trial_num, 1]

        print('\t\ttotal # of timesteps: ' + str(ts_total))

        traj = np.empty([int(ts_total)-1, 2])

        for ts in range(0, int(ts_total-1)):
            # print(ts)
            x_temp = self.test_ds["pid"][pid][mp][str(trial_key)]["ts_idx"][str(ts)][0]
            y_temp = self.test_ds["pid"][pid][mp][str(trial_key)]["ts_idx"][str(ts)][1]
            traj[int(ts), :] = np.array([x_temp, y_temp])

        return traj

    # recovers a single trajectory [x, y, theta] from a specified pid, mp, trial number, and a provided list of timestep counts
    # TODO: finish this (!)
    def recover_pose_from_json(self, pid, mp, trial_num, ts_list):
        print('\n\t[NOTE:] recovering trajectory #: ' + str(trial_num))

        trial_key = str(int(ts_list[trial_num, 0]))
        ts_total = ts_list[trial_num, 1]

        print('\t\ttotal # of timesteps: ' + str(ts_total))

        traj = np.empty([int(ts_total)-1, 3])

        for ts in range(0, int(ts_total-1)):
            # print(ts)
            x_temp = self.test_ds["pid"][pid][mp][str(trial_key)]["ts_idx"][str(ts)][0]
            y_temp = self.test_ds["pid"][pid][mp][str(trial_key)]["ts_idx"][str(ts)][1]
            theta_tmp = self.test_ds["pid"][pid][mp][str(trial_key)]["ts_idx"][str(ts)][2]
            traj[int(ts), :] = np.array([x_temp, y_temp])

        return traj

################################################################################################################################
### COMPUTE METRICS ############################################################################################################
################################################################################################################################
    
    # computes the radius of curvature for a single timestep
    def compute_roc(roc_args):
        roc = 0

        xp = roc_args[0]
        yp = roc_args[1]
        xpp = roc_args[2]
        ypp = roc_args[3]

        # https://mathworld.wolfram.com/RadiusofCurvature.html
        roc = ((xp ^ 2 + yp ^ 2)) ^ (3/2)/((xp*ypp - yp*xpp))

        return roc

    # TODO: finish this # TODO: test! May be working at this point

    def compute_radius_of_curvature_sum(self, pid, trial_num, mp):
        traj = self.recover_trajectory_from_json(self, pid, trial_num, mp)

        roc_sum = 0

        # x', y', x'', y''
        roc_args = [0, 0, 0, 0]
        roc_args_prior = [0, 0, 0, 0]

        for ts_index in range(1, len(traj[:, 0])):
            xp = traj[ts_index, 0] - traj[ts_index-1, 0]  # x'
            yp = traj[ts_index, 1] - traj[ts_index-1, 1]  # y'
            xpp = xp - roc_args_prior[0]  # x''
            ypp = yp - roc_args_prior[1]  # y''
            roc_args = [xp, yp, xpp, ypp]
            roc = self.compute_roc(roc_args)
            roc_sum = roc_sum + roc
            roc_args_prior = roc_args

        return roc_sum
    
    # https://pypi.org/project/similaritymeasures/
    def compare_two_trajectories_dtw(self, traj1, traj2, sim_metric):
        if sim_metric == 'dtw':
            dtw, d = similaritymeasures.dtw(traj1, traj2)
            val = dtw
        elif sim_metric == 'cl':
            val = similaritymeasures.curve_length_measure(traj1, traj2)
        elif sim_metric == 'df':
            val = similaritymeasures.frechet_dist(traj1, traj2)
        elif sim_metric == 'pcm':
            val = similaritymeasures.pcm(traj1, traj2)

        return val
    
    # returns the number of timesteps in a specific trial
    def compute_trial_time(self, pid, trial_num, mp):
        print('pid: ' + str(pid) + ', trial_num: ' +
              str(trial_num) + ', mp: ' + str(mp))
        num_ts = len(self.test_ds["pid"][pid][mp]
                     [str(trial_num)]["ts_idx"].keys())

        return num_ts

    # applies the optimality conditions of radius of curvature (roc) and minimal length
    # to determine the local optimum within a bundle of specified motion primitive trajectories
    # TODO: test this
    def find_optimal_trajectory_from_bundle(self, pid, mp):

        trial_number = 0

        # find the number of trials performed for the specified motion primitive
        num_trials = len(self.test_ds["pid"][pid][mp].keys())

        opt_list = np.empty([num_trials-1, 2])
        opt_list_weighted = np.empty([num_trials-1], 2)

        tt_weight = 0.4
        roc_weight = 0.6

        for trial_idx in range(1, num_trials):
            trial_time = self.compute_trial_time(pid, trial_idx, mp)
            roc_sum = self.compute_radius_of_curvature_sum(pid, trial_idx, mp)
            opt_list[trial_idx-1, :] = [trial_time, roc_sum]
            opt_list_weighted[trial_idx-1,:] = [trial_idx, (tt_weight*trial_time + roc_weight*roc_sum)]

        #min_traj_idx = np.argmin(trial_time_list[:,1])
        opt_local_trial_number = np.argmin(opt_list_weighted[:,1])
        

        return opt_local_trial_number

################################################################################################################################
### SINGLE-USER ANALYSIS #######################################################################################################
################################################################################################################################

    # computes trajectory similarity metrics for a specified user and specified motion primitive
    def traj_sim_single_user_single_mp(self, pid, mp, sim_metric, local_global='local'):

        # find the number of trials performed for the specified motion primitive
        num_trials = len(self.test_ds["pid"][pid][mp].keys())
        # print(num_trials)

        # initialize numpy array for storing # of timesteps for all trials of specified motion primitives
        trial_time_list = np.empty([num_trials-1, 2])
        
        empty_trial_list = np.array([]) # empty trial list tweak added [7/11/2021]; TODO: check this

        # populate the numpy array above with timestep counts for each trial of specified motion primitive
        for trial_idx in range(1, num_trials):
            tmp_ts_count = self.compute_trial_time(pid, trial_idx, mp)
            if tmp_ts_count != 0:
                trial_time_list[trial_idx-1, 0] = trial_idx
                trial_time_list[trial_idx-1, 1] = tmp_ts_count
            else:
                empty_trial_list = np.append(empty_trial_list, trial_idx) # empty trial list tweak added [7/11/2021]; TODO: check this
                #continue
        if local_global == 'local':
            # find trial of specified motion primitive with minimum # of timesteps to complete
            min_traj_idx = np.argmin(trial_time_list[:, 1])
            print(trial_time_list)
            print('\n\tmin_traj_idx: ' + str(min_traj_idx) +
                ' => ' + str(trial_time_list[min_traj_idx, :]))

            val_list = np.empty([num_trials-1, 2])

            # recover trial w/ minimum # of timesteps
            traj1 = self.recover_trajectory_from_json(
                pid, mp, min_traj_idx, trial_time_list)

            counter_to_avoid_min_ts_gap = 0

            for trial_idx in range(0, num_trials-1):
                if trial_idx != min_traj_idx and (trial_idx in empty_trial_list) != True: # empty trial list tweak added [7/11/2021]; TODO: check this
                    traj2 = self.recover_trajectory_from_json(pid, mp, trial_idx, trial_time_list)
                    val = self.compare_two_trajectories_dtw(traj1, traj2, sim_metric)

                    # val list takes form as [ (trial_idx that min trial is compared to), (measure)]
                    val_list[counter_to_avoid_min_ts_gap, 0] = trial_idx
                    val_list[counter_to_avoid_min_ts_gap, 1] = val
                    counter_to_avoid_min_ts_gap += 1
                else:
                    pass

        elif local_global == 'global':
            # find trial of specified motion primitive with minimum # of timesteps to complete
            min_traj_idx = np.argmin(trial_time_list[:, 1])
            print(trial_time_list)
            print('\n\tmin_traj_idx: ' + str(min_traj_idx) + ' => ' + str(trial_time_list[min_traj_idx, :]))

            val_list = np.empty([num_trials-1, 2])

            counter_to_avoid_min_ts_gap = 0

            for trial_idx in range(0, num_trials-1):
                if (trial_idx in empty_trial_list) != True: # empty trial list tweak added [7/11/2021]; TODO: check this
                    # recover optimal trajectory from polynomial fit (trc)
                    print(trial_idx)
                    print(trial_time_list[trial_idx])
                    print(trial_time_list[trial_idx][1])
                    if (mp in ['fwr', 'bwr', 'bwl', 'fwl']) == True:
                        traj_tmp = trc.generate_fwr_like(mp, trial_time_list[trial_idx][1])
                        traj1 = trc.scale_mm_to_px(traj_tmp)
                    elif (mp in ['fwr_cw', 'bwr_ccw', 'bwl_cw', 'fwl_ccw']) == True:
                        traj_tmp = trc.generate_hybrid_like(mp, trial_time_list[trial_idx][1])
                        traj1 = trc.scale_mm_to_px(traj_tmp)
                    elif (mp in ['fw', 'bw']) == True:
                        traj1 = trc.generate_linear(mp) # TODO: separate scaling case (only linear is scaled)
                    elif (mp in ['cw', 'ccw']) == True:
                        traj1 = trc.generate_angular(mp) # TODO: separate scaling case (only angular is scaled)
                    traj2 = self.recover_trajectory_from_json(pid, mp, trial_idx, trial_time_list)
                    val = self.compare_two_trajectories_dtw(traj1, traj2, sim_metric)

                    # val list takes form as [ (trial_idx that min trial is compared to), (measure)]
                    val_list[counter_to_avoid_min_ts_gap, 0] = trial_idx
                    val_list[counter_to_avoid_min_ts_gap, 1] = val
                    counter_to_avoid_min_ts_gap += 1
                else:
                    pass

        return min_traj_idx, val_list

    # calls multiple instances of self.traj_sim_single_user_single_mp() to assess trajectory similarity measures for all motion primitives in mp_list
    def traj_sim_single_user(self, pid, sim_metric, local_global='local'):

        # val_stats_list (aka: vsl) takes form [(mean), (standard deviation), (variance)] for chosen trajectory similarity measure
        # NOTE: the rows of val_stats_list will conform to the order of motion primitives in the mp_list array
        val_stats_list = np.empty([len(self.mp_list), 3])
        vsl_counter = 0

        for mp_idx in self.mp_list:
            min_traj_idx, val_list = self.traj_sim_single_user_single_mp(pid, mp_idx, sim_metric, local_global)
            print('index of trajectory with minimum # timesteps: ' + str(min_traj_idx) + '\n---------------------------------------------------------------\n')
            #print(str(sim_metric) + ': ' + str(val_list))
            # print('\n')

            mean_tmp = np.mean(val_list[:, 1])
            stdev_tmp = np.std(val_list[:, 1])
            var_tmp = np.var(val_list[:, 1])

            val_stats_list[vsl_counter, :] = [mean_tmp, stdev_tmp, var_tmp]
            vsl_counter = vsl_counter + 1

        print('\n' + str(val_stats_list))

        # visualize results
        self.visualize_traj_sim_single_user(pid, sim_metric, val_stats_list)

        return val_stats_list

    #
    def visualize_traj_sim_single_user(self, pid, sim_metric, vsl):
        x = np.arange(len(self.mp_list))
        width = 0.1

        vsl_counter = 0
        for mp_idx in self.mp_list:
            plt.errorbar(x[vsl_counter], vsl[vsl_counter, 0],
                         vsl[vsl_counter, 1], fmt='ok')
            # plt.bar(x- 2 *(width), vsl[vsl_counter, 0], width, color='red')
            # plt.bar(x - width, vsl[vsl_counter, 1], width, color='green')
            # plt.bar(x, vsl[vsl_counter, 2], width, color='blue')
            vsl_counter = vsl_counter + 1

        plt.xticks(x, self.mp_list)
        plt.xlabel('motion primitive')
        plt.ylabel('mean ' + str(sim_metric))
        plt.title(str(sim_metric) + ' for: ' + str(pid))

        plt.show()
        return

################################################################################################################################
### MULTI-USER ANALYSIS ########################################################################################################
################################################################################################################################

    # TODO: finish this; goal is to compare and visualize variation in motion primitives across all users
    def traj_sim_all_users(self, sim_metric):

        # traj_sim_tensor takes form [[pid]x[mp]x[sim_metric value]]
        traj_sim_tensor = np.empty([len(self.pid_list), len(self.mp_list), 3])

        pid_counter = 0
        for pid_idx in self.pid_list:
            print(pid_idx)
            vsl_temp = self.traj_sim_single_user(pid_idx, sim_metric)
            traj_sim_tensor[pid_counter, :, :] = vsl_temp

            pid_counter = pid_counter + 1

        print(traj_sim_tensor)

        for mp in self.mp_list:
            self.visualize_traj_sim_all_users_single_mp(mp, sim_metric, traj_sim_tensor)

        return

    # TODO: finish this; goal is to visualize trajectory similarity metrics
    # for a single motion primitive across all users
    def visualize_traj_sim_all_users_single_mp(self, mp, sim_metric, tst):
        print('\n')
        x = np.arange(len(self.pid_list))
        width = 0.1

        # TODO: not iterating through motion primitives when visualizing; fix this (!)
        tst_counter = 0
        mp_idx = self.mp_list.index(mp)
        print('\t[NOTE:] current motion primitive index: ' + str(mp_idx))
        for pid_idx in range(0, len(self.pid_list)):
            plt.errorbar(x[tst_counter], tst[pid_idx, mp_idx, 0],
                         tst[pid_idx, mp_idx, 1], fmt='ok')
            print('\t\tmean: ' + str(tst[pid_idx, mp_idx, 0]) +
                  '; std. dev.: ' + str(tst[pid_idx, mp_idx, 1]))
            tst_counter = tst_counter + 1

        # TODO: add pid to pid2 map call here for updated figure text

        plt.xticks(x, self.pid2_list)
        plt.xlabel('participant ID')
        plt.ylabel('mean ' + str(sim_metric) + ' score')
        plt.title(str(self.sim_metric_map[str(
            sim_metric)]) + ' against personal best; all users; mp: ' + str(self.mp_map[str(mp)]))

        plt.show()
        return

################################################################################################################################
### MAIN #######################################################################################################################
################################################################################################################################

def main():
    ts = traj_sim()
    ts.load_moprim_data()
    # ts.traj_sim_single_user_single_mp("P11","fwr")
    ts.traj_sim_single_user('P11', 'df', 'global')
    #ts.traj_sim_all_users('dtw')


if __name__ == "__main__":
    main()
