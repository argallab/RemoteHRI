#!/usr/bin/env python
# -*- coding: utf-8 -*-
import collections
import json
import argparse
import os
import itertools
import random
import numpy as np

############################################################################################
# FUNCTIONS:
# (1) create_obstacle_list(width, height, occupancy_measure, num_obstacle_patches=2, dirichlet_scale_param=10)
#   > (1a) get_random_obstacle_neighbors(obs)
#       > (1b) check_bounds(state)
# (2) create_random_goals(width, height, obstacle_list, num_goals=1)
# (3) create_start_location(width, height, obstacle_list, goal_list)
# (4) generate_grid_world_trials(args)
#------------------------------------------------------------------------------------------
# REQUIRED FUNCTIONS:
# (1) set start location
#   > (1a) if training phase -> random location 
#   > (1b) if testing phase -> center of environment
# (2) shuffle goals
#   > (2a) if training phase -> shuffle 3 blocks of randomly chosen motion primitive goals
#       > (2a.i) include check for representation of all potential goals across 3 blocks
#       > (2a.ii) include check for goals that go OOB w/ chosen vehicle pose
#   > (2b) if testing phase -> shuffle 10 blocks of 8 motion primitive goals
#       > (2b.i) include check for repeats, both between and within trial blocks 
# (3) generate grid world trials
############################################################################################

#########################
START_DIST_THRESHOLD = 2  
INTER_GOAL_THRESHOLD = 10

# NOTE: 0,0 -> bottom left

###########################################################
# TODO: 90 or 0 -> which is 'up' (?)
def create_start_location(width, height, phase):
    #all_cell_coords = list(itertools.product(range(width), range(height)))
    if phase == "train":
        rand_heading = np.random.randint(0, 360) ## CHECK THIS [1/16/2021]
        start_state = [(width/2), (height/2), rand_heading]
    elif phase == "test":
        start_state = [(width/2), (height/2), 90] # TO-DO: CHECK IF THIS IS PROPER FORMAT
    start_state_dict = dict()
    start_state_dict['x'] = start_state[0]
    start_state_dict['y'] = start_state[1]
    start_state_dict['theta'] = start_state[2]
    return start_state_dict

#######################
# NOTE: x, y values in pixels; include a scale factor; defined in vehicle ego frame
# TODO: abs(5) -> abs(1)
# TODO: transform to world coord. before adding to start loc.
def generate_mp_dict(pixel_scale, mp_list):
    mp_dict = dict()
    mp_dict['fw'] = [0, 5, 90]
    mp_dict['bw'] = [0, -5, 90] 
    mp_dict['fwr'] = [2.236, 2.236, 45] 
    mp_dict['fwl'] = [-2.236, 2.236, 135] 
    mp_dict['bwr'] = [-2.236, -2.236, 225] 
    mp_dict['bwl'] = [2.236, -2.236, 315] 
    mp_dict['cw'] = [0, 0, 295] 
    mp_dict['ccw'] = [0, 0, 245]
    #for moprim in mp_list: # TODO: CHECK if this is the proper way to index
    #    mp_dict[moprim][0] = mp_dict[moprim][0]*pixel_scale
    #    mp_dict[moprim][1] = mp_dict[moprim][1]*pixel_scale
    return mp_dict
#
def generate_mp_list():
    mp_list = ['fw', 'bw', 'fwr', 'fwl', 'bwr', 'bwl', 'cw', 'ccw']
    return mp_list

## transforms a given goal location (specified in ego frame) into the world frame 
def ego2world_tf(start_location, goal_location):
    tf_mat = np.array([[np.cos(goal_location[2]), -np.sin(goal_location[2])],
                       [np.sin(goal_location[2]), np.cos(goal_location[2])]])
    goal_location_tf = [0, 0, 0]
    start_location_temp = np.array([start_location['x'], start_location['y']])
    matmul_tmp = np.matmul(tf_mat, start_location_temp)
    tf_rot = start_location['theta'] + goal_location[2] # TODO: CHECK THIS
    tf_rot_norm = normalizeAngle(tf_rot) # TODO: CHECK THIS AS WELL
    goal_location_tf = [matmul_tmp[0], matmul_tmp[1], tf_rot_norm]
    return goal_location_tf

## TODO: checks for equal distribution of trial types
#def goal_tally():
    
#return

## angle wrapping support function
# adapted from author: simnibs at the following address:
# https://www.programcreek.com/python/?CodeExample=normalize+angle
def normalizeAngle(angle):
    while angle < 0:
        angle += 360 * 1
    while angle > 360 * 1:
        angle -= 360 * 1
    return angle 

##
# def check_goal_location(mp_dict, start_state_dict,)
# NOTE: currently goal locations are NOT necessary to check
##


#########################################################
def generate_goal_list(mp_dict, mp_list, start_state_dict, phase, goal_list):
    #all_cell_coords = list(itertools.product(range(width), range(height)))
    goal_list = []
    #dist_to_goals = [-100]
    
    num_moprim = len(mp_list)

    # TODO: store successive rand_goal_loc's mp_dict idx(s) into 
    # goal_list; use check on goal list to make sure repeated trials
    # do not occur in any given block; goal_tally() fn for this (!)
    #
    trial_type_idx = np.random.randint(0, num_moprim)
    trial_type = mp_list[trial_type_idx]

    #while min(dist_to_goals) < START_DIST_THRESHOLD: # TODO: check if necessary; noise?
    if phase == "train":
        rand_goal_loc = mp_dict[trial_type]
        goal_choice = ego2world_tf(start_state_dict, rand_goal_loc)
    elif phase == "test":
        rand_goal_loc = mp_dict[trial_type]
        goal_choice = ego2world_tf(start_state_dict, rand_goal_loc)
        
    goal_list = np.append(goal_list, goal_choice, 0)

    return goal_list, goal_choice

#####################################
def generate_grid_world_trials(args):
    ## pass in arguments ##
    
    # number of training and testing blocks + trials:
    num_train_blocks = args.num_train_blocks
    num_trials_per_train_block = args.num_train_trials
    #
    num_test_blocks = args.num_test_blocks
    num_trials_per_test_block = args.num_test_trials
    #
    num_train_trials = num_trials_per_train_block*num_train_blocks
    num_test_trials = num_trials_per_test_block*num_test_blocks
    #
    num_trials_total = num_train_trials + num_test_trials
    num_blocks_total = num_train_blocks + num_test_blocks

    # experimental information (for logging to .json)
    experiment_name = args.experiment_name
    experiment_json_name = args.experiment_json_name

    # shuffling options
    is_shuffle_blocks = args.is_shuffle_blocks
    is_shuffle_trials = args.is_shuffle_trials

    # Cartesian state-space dimensions
    width = args.width
    height = args.height

    ## initialize the dictionary which contains all train and test
    experiment_dict = collections.OrderedDict()
    experiment_dict["experimentName"] = experiment_name
    experiment_dict["shuffleBlocks"] = is_shuffle_blocks
    experiment_dict["blocks"] = []
    #
    
    ## generate motion primitive dictionary + list for indexing
    mp_list = generate_mp_list()
    mp_dict = generate_mp_dict(5, mp_list)

    ## populate trials in each block, for all blocks (train + test blocks)
    for block_num in range(num_blocks_total):
        current_block = collections.OrderedDict()
        if block_num <= num_train_blocks: # (training block case)
            current_block['blockName'] = "Training Block {}".format(block_num)
            current_block['preTrials'] = []
            training_block_intro_text_trial = collections.OrderedDict()
            training_block_intro_text_trial['stimulusType'] = "test-display"
            training_block_intro_text_trial['text'] = "<div><h3>Grid World Experiment</h3><hr /><p>This experiment consists of a training phase and a testing phase.</p><p>training_phase_placeholder_message_2</p><p>Once you have completed the training phase, you will be taken to the testing phase, PLACEHOLDER</p><p>When you are finished with the experiment, you may exit the webpage and your answers will be saved automatically.</p><div class=\"row\"><div class=\"col-md-6\"><p>Grid worlds will look like this. The gray robot is you and you must get the gray robot to the green square using WASD or arrow keys.</p><img style=\"height:200px; width:auto;\" src=\"img/gridworld3x3.png\" /></div><div class=\"col-md-6\"><p>Grid worlds with obstacles will look like this.  You are unable to move the robot into a black square.</p><img style=\"height:200px; width:auto;\" src=\"img/gridworld5x5.png\" /></div></div></div>"
            current_block['preTrials'].append(training_block_intro_text_trial)
            phase = "train" # (phase flag set)
        elif block_num > num_train_blocks: # (testing block case)
            current_block['blockName'] = "Testing Block {}".format(block_num-num_train_blocks)
            current_block['preTrials'] = []
            phase = "test" # (phase flag set)
        
        ## arguments to shuffle trials within a given block
        current_block['shuffleTrials'] = is_shuffle_trials
        current_block['trials'] = []

        ## initialize empty goal list per block
        goal_list = []

        ## trial 
        for trial_num in range(num_trials_total):
            trial_dict = collections.OrderedDict()
            trial_dict['stimulusType'] = "continuous-world-dynamic"
            trial_dict['width'] = width
            trial_dict['height'] = height

            if block_num == 0: # (training block case)
                trial_dict['instructions'] = "TRIAL INSTRUCTIONS: This is a grid-world. Move the robot with WASD or the arrow keys in order to reach the goals as they appear."
            elif block_num == num_train_blocks+1: # (testing block case)
                trial_dict['instructions'] = "TEST INSTRUCTIONS: This is a grid-world. Move the robot with WASD or the arrow keys in order to reach the goals as they appear."
            #else:
            #    trial_dict['instructions'] = "Press any key to continue..." # CHECK

            ## TO-DO: FIGURE THIS OUT :^)
            if block_num <= num_train_blocks: # (training block case)
                start_state_dict = create_start_location(width, height, phase)
            elif block_num > num_train_blocks: # (testing block case)
                start_state_dict = create_start_location(width, height, phase)

            goal_list, goal_location = generate_goal_list(mp_dict, mp_list, start_state_dict, phase, goal_list)
            print(goal_list)
            #
            trial_dict['humanAgent'] = start_state_dict
            #
            trial_dict['goalLocationX'] = goal_location[0]
            trial_dict['goalLocationY'] = goal_location[1]
            trial_dict['goalLocationTheta'] = goal_location[2]
            #
            trial_dict['tickTime'] = 600
            trial_dict['visualizeGridLines'] = True
            trial_dict['postText'] = "You've reached the goal! Press any key to continue."
            #
            current_block['trials'].append(trial_dict)

        current_block['postTrials'] = []
        block_end_text_trial = collections.OrderedDict()
        block_end_text_trial['stimulusType'] = "text-display"
        block_end_text_trial['text'] = "<pdiv><h3>Current block over. Press any key for next block</h3><hr/></div>"
        current_block['postTrials'].append(block_end_text_trial)

        experiment_dict["blocks"].append(current_block)
        
    print('generation of blocks completed')

    ## save and export the experiment as a .json file
    
    json_directory = os.path.join(os.path.dirname(__file__), 'exp_json_directory')
    if not os.path.exists(json_directory):
        os.makedirs(json_directory)
    full_path_to_json = os.path.join(json_directory, experiment_json_name)
    #print('\nprint json file:\n\t'+str(__file__) + ' -> ' + str(full_path_to_json)) ### TODO
    with open(full_path_to_json, 'w') as fp:
        json.dump(experiment_dict, fp)

## main function + argument parsing
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--width', action='store', type=int, default=8, help="width of grid world")
    parser.add_argument('--height', action='store', type=int, default=8, help="height of grid world")
    parser.add_argument('--num_train_blocks', action='store', type=int, default=3, help="number of training blocks")
    parser.add_argument('--num_train_trials', action='store', type=int, default=8, help="number of trials per training block")
    parser.add_argument('--num_test_blocks', action='store', type=int, default=3, help="number of testing blocks")
    parser.add_argument('--num_test_trials', action='store', type=int, default=8, help="number of trials per testing block")
    parser.add_argument('--experiment_name', action='store', type=str, default="Grid World Experiment (Continuous)", help="name of the experiment")
    parser.add_argument('--experiment_json_name', action='store', type=str, default="experiment_gw_cont.json", help="name of .json file which defines the experiment")
    parser.add_argument('--is_shuffle_trials', action='store_true', default=False, help="flag for shuffling trials")
    parser.add_argument('--is_shuffle_blocks', action='store_true', default=False, help="flag for shuffling blocks")
    
    args = parser.parse_args()
    generate_grid_world_trials(args)