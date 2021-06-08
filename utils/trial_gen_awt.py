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
global ab
global trial_type_idx
trial_type_idx = -1

# NOTE: 0,0 -> bottom left

###########################################################
def create_start_location(width, height, phase):
    #all_cell_coords = list(itertools.product(range(width), range(height)))
    if phase == "train":
        rand_heading = np.random.randint(0, 360) ## CHECK THIS [1/16/2021] 
        start_state = [(width/2), (height/2), -90]
    elif phase == "test":
        start_state = [(width/2), (height/2), -90] # TO-DO: CHECK IF THIS IS PROPER FORMAT; TODO: change -90 -> 270 (?)
    start_state_dict = dict()
    start_state_dict['x'] = start_state[0]
    start_state_dict['y'] = start_state[1]
    start_state_dict['angle'] = start_state[2]
    start_state_dict['xv'] = 0.0
    start_state_dict['yv'] = 0.0
    start_state_dict['lv'] = 0.0
    start_state_dict['angularVelocity'] = 0.0
    start_state_dict['maxLinearVelocity'] = 150
    start_state_dict['maxAngularVelocity'] = 100
    start_state_dict['linearAcceleration'] = 50
    start_state_dict['angularAcceleration'] = 15
    start_state_dict['width'] = 50
    start_state_dict['height'] = 50
    start_state_dict['linearMu'] = 1
    start_state_dict['rotationMu'] = 0.1
    return start_state_dict

#######################
# NOTE: x, y values in pixels; include a scale factor; defined in vehicle ego frame
# TODO: abs(5) -> abs(1)
# TODO: transform to world coord. before adding to start loc.
def generate_mp_dict(pixel_scale, mp_list, start_location, height):
    mp_dict = dict()
    mp_dict['fw'] = [0, 1, 270]
    mp_dict['bw'] = [0, -1, 270]
    mp_dict['fwr'] = [np.sqrt(2)/2, np.sqrt(2)/2, 315]
    mp_dict['fwl'] = [-np.sqrt(2)/2, np.sqrt(2)/2, 225] 
    mp_dict['bwr'] = [-np.sqrt(2)/2, -np.sqrt(2)/2, 315] 
    mp_dict['bwl'] = [np.sqrt(2)/2, -np.sqrt(2)/2, 225] 
    mp_dict['cw'] = [0, 0, 75] # TODO: proper angle? CHANGE TO ~180 degree turn
    mp_dict['ccw'] = [0, 0, 105] # TODO: proper angle?
    mp_dict['fwr_cw'] = [0.4, 0, 90]#[0.3, 0, 90]
    mp_dict['fwl_ccw'] = [-0.4, 0, 90]#[-0.3, 0, 90]
    mp_dict['bwr_ccw'] = [0.4, 0, 90]#[0.3, 0, 90]
    mp_dict['bwl_cw'] = [-0.4, 0, 90]#[-0.3, 0, 90]

    mp_dict['fw'] = [0, 1, 270]
    mp_dict['bw'] = [0, -1, 270]
    mp_dict['fwr'] = [np.sqrt(2)/2, np.sqrt(2)/2, 315]
    mp_dict['fwl'] = [-np.sqrt(2)/2, np.sqrt(2)/2, 225] 
    mp_dict['bwr'] = [-np.sqrt(2)/2, -np.sqrt(2)/2, 315] 
    mp_dict['bwl'] = [np.sqrt(2)/2, -np.sqrt(2)/2, 225] 
    mp_dict['cw'] = [0, 0, 75] # TODO: proper angle? CHANGE TO ~180 degree turn
    mp_dict['ccw'] = [0, 0, 105] # TODO: proper angle?
    mp_dict['fwr_cw'] = [0.4, 0, 90]#[0.3, 0, 90]
    mp_dict['fwl_ccw'] = [-0.4, 0, 90]#[-0.3, 0, 90]
    mp_dict['bwr_ccw'] = [0.4, 0, 90]#[0.3, 0, 90]
    mp_dict['bwl_cw'] = [-0.4, 0, 90]#[-0.3, 0, 90]

    somp_scaler = pixel_scale#1#pixel_scale/3

    for moprim in mp_list:
        if moprim != 'fw' and moprim != 'bw' and moprim != 'cw' and moprim != 'ccw' and moprim != 'fwr_cw' and moprim != 'fwl_ccw' and moprim != 'bwr_ccw' and moprim != 'bwl_cw':
            if moprim == 'fwr' or moprim == 'bwr':
                mp_dict[moprim][0] = (mp_dict[moprim][0]*pixel_scale)-0.5*height
                mp_dict[moprim][1] = (mp_dict[moprim][1]*pixel_scale)-0.5*height
            elif moprim == 'fwl' or moprim == 'bwl':
                mp_dict[moprim][0] = (mp_dict[moprim][0]*pixel_scale)-0.5*height
                mp_dict[moprim][1] = (mp_dict[moprim][1]*pixel_scale)-0.5*height

            #mp_dict[moprim][0] = (mp_dict[moprim][0]*pixel_scale)
            #mp_dict[moprim][1] = (mp_dict[moprim][1]*pixel_scale)-0.5*height
        elif moprim == 'fw':
            mp_dict[moprim][0] = mp_dict[moprim][0]-(0.5*height) # 50 is hardcoded user height
            mp_dict[moprim][1] = (mp_dict[moprim][1]*pixel_scale)-1.0*height#(0.2*pixel_scale)#75
        elif moprim == 'bw':
            mp_dict[moprim][0] = mp_dict[moprim][0]-(0.5*height) # 50 is hardcoded user height
            mp_dict[moprim][1] = (mp_dict[moprim][1]*pixel_scale)#+1.0*height#*(0.2*pixel_scale)#*75
        elif moprim == 'cw':
            mp_dict[moprim][0] = mp_dict[moprim][0]-(0.5*height) # 50 is hardcoded user height
            mp_dict[moprim][1] = mp_dict[moprim][1]-(0.5*height) # 50 is hardcoded user height
        elif moprim == 'ccw':
            mp_dict[moprim][0] = mp_dict[moprim][0]-(0.5*height) # 50 is hardcoded user height
            mp_dict[moprim][1] = mp_dict[moprim][1]-(0.5*height) # 50 is hardcoded user height
        elif moprim == 'fwr_cw':
            mp_dict[moprim][0] = ((mp_dict[moprim][0])*(somp_scaler))-(0.5*height)#*pixel_scale)
            mp_dict[moprim][1] = mp_dict[moprim][1]-(0.5*height)#-50#(0.5*50)#*(somp_scaler)#*pixel_scale)
        elif moprim == 'fwl_ccw':
            mp_dict[moprim][0] = mp_dict[moprim][0]*(somp_scaler)-(0.5*height)#*pixel_scale)
            mp_dict[moprim][1] = mp_dict[moprim][1]-(0.5*height)#-50#(0.5*50)#*(somp_scaler)#*pixel_scale)
        elif moprim == 'bwr_ccw': ## TODO: fix offset
            mp_dict[moprim][0] = ((mp_dict[moprim][0])*(somp_scaler))-(0.5*height)#*pixel_scale)
            mp_dict[moprim][1] = mp_dict[moprim][1]-(0.5*height)#-50#(0.5*50)#*(somp_scaler)#*pixel_scale)
        elif moprim == 'bwl_cw': ## TODO: fix offset
            mp_dict[moprim][0] = (mp_dict[moprim][0]*(somp_scaler))-(0.5*height)#*pixel_scale)
            mp_dict[moprim][1] = mp_dict[moprim][1]-(0.5*height)#-50#(0.5*50)#*(somp_scaler)#*pixel_scale)
        mp_dict[moprim][0] = mp_dict[moprim][0]+start_location['x']
        mp_dict[moprim][1] = mp_dict[moprim][1]+start_location['y']
        if start_location['angle']+90 >= 0.01: # TODO: check this; changed -90 -> +90 [3/31/2021]
            mp_dict[moprim] = ego2world(start_location, mp_dict[moprim])
            mp_dict[moprim] = ego2world_rot(start_location, mp_dict[moprim])
        else:
            continue
            
        #print('\n')
    return mp_dict
#
def generate_mp_list():
    #mp_list = ['fw', 'bw', 'fwr', 'fwl', 'bwr', 'bwl', 'cw', 'ccw']
    #mp_list = ['fw', 'bw', 'fwr', 'fwl', 'bwr', 'bwl']
    mp_list = ['fwr', 'fwl', 'bwr', 'bwl', 'fwr_cw', 'fwl_ccw', 'bwr_ccw', 'bwl_cw']
    #mp_list = ['fw', 'bw', 'fwr', 'fwl', 'bwr', 'bwl', 'fwr_cw', 'fwl_ccw', 'bwr_ccw', 'bwl_cw']
    #mp_list = ['fw', 'bw', 'fwr', 'fwl', 'bwr', 'bwl', 'cw', 'ccw', 'fwr_cw', 'fwl_ccw', 'bwr_ccw', 'bwl_cw']
    return mp_list

def generate_mp_tf_dict():
    mp_tf = dict()
    mp_tf ['fw'] = [0.0, 0.0]
    mp_tf ['bw'] = [0.0, 0.0] 
    mp_tf ['fwr'] = [-1.0, 1.0]
    mp_tf ['fwl'] = [1.0, -1.0] 
    mp_tf ['bwr'] = [1.0, -1.0] 
    mp_tf ['bwl'] = [-1.0, 1.0] 
    mp_tf ['cw'] = [0.0, 0.0] 
    mp_tf ['ccw'] = [0.0, 0.0]
    mp_tf['fwr_cw'] = [-1.0, 1.0] 
    mp_tf['fwl_ccw'] = [1.0, -1.0] 
    mp_tf['bwr_ccw'] = [1.0, -1.0] # TODO: check this; temp fix
    mp_tf['bwl_cw'] = [-1.0, 1.0] # TODO: check this; temp fix
     
    return mp_tf


def generate_boundary_dict():

    boundary_dict = {}
    boundary_dict['fw'] = "png/fw.png"
    boundary_dict['bw'] = "png/bw.png"
    boundary_dict['fwr'] = "png/fwr.png"
    boundary_dict['fwl'] = "png/fwl.png"
    boundary_dict['bwr'] = "png/bwl.png" # temp fix for naming
    boundary_dict['bwl'] = "png/bwr.png" # temp fix for naming
    boundary_dict['ccw'] = "png/ccw.png"
    boundary_dict['cw'] = "png/cw.png"
    boundary_dict['fwr_cw'] = "png/fwr_cw.png"
    boundary_dict['fwl_ccw'] = "png/fwl_ccw.png"
    boundary_dict['bwr_ccw'] = "png/bwr_ccw.png"
    boundary_dict['bwl_cw'] = "png/bwl_cw.png"

    return boundary_dict

def generate_goal_dict():

    goal_dict = {}
    #goal_dict['fw'] = "png/goal_icon_v2_fwbw.png"
    #goal_dict['bw'] = "png/goal_icon_v2_fwbw.png"
    #goal_dict['fwr'] = "png/goal_icon_v2_fwrbwl.png"
    #goal_dict['fwl'] = "png/goal_icon_v2_fwlbwr.png"
    #goal_dict['bwr'] = "png/goal_icon_v2_fwrbwl.png" # 
    #goal_dict['bwl'] = "png/goal_icon_v2_fwlbwr.png" #
    #goal_dict['ccw'] = "png/goal_icon_v2_ccw.png"
    #goal_dict['cw'] = "png/goal_icon_v2_cw.png"

    #goal_dict['fw'] = "png/goal_icon_v3_fwbw.png"
    #goal_dict['bw'] = "png/goal_icon_v3_fwbw.png"
    #goal_dict['fwr'] = "png/goal_icon_v3_fwrbwl.png"
    #goal_dict['fwl'] = "png/goal_icon_v3_fwlbwr.png"
    #goal_dict['bwr'] = "png/goal_icon_v3_fwrbwl.png" # 
    #goal_dict['bwl'] = "png/goal_icon_v3_fwlbwr.png" #
    #goal_dict['ccw'] = "png/goal_icon_v3_ccw.png"
    #goal_dict['cw'] = "png/goal_icon_v3_cw.png"
    #goal_dict['fwr_cw'] = "png/goal_icon_v3_270deg.png"
    #goal_dict['fwl_ccw'] = "png/goal_icon_v3_270deg.png"
    #goal_dict['bwr_ccw'] = "png/goal_icon_v3_270deg.png"
    #goal_dict['bwl_cw'] = "png/goal_icon_v3_270deg.png"

    goal_dict['fw'] = "png/goal_icon_v4_fwbw.png"
    goal_dict['bw'] = "png/goal_icon_v4_fwbw.png"
    goal_dict['fwr'] = "png/goal_icon_v4_fwrbwl.png"
    goal_dict['fwl'] = "png/goal_icon_v4_fwlbwr.png"
    goal_dict['bwr'] = "png/goal_icon_v4_fwrbwl.png" # 
    goal_dict['bwl'] = "png/goal_icon_v4_fwlbwr.png" #
    goal_dict['ccw'] = "png/goal_icon_v4_ccw.png"
    goal_dict['cw'] = "png/goal_icon_v4_cw.png"
    goal_dict['fwr_cw'] = "png/goal_icon_v4_270deg.png"
    goal_dict['fwl_ccw'] = "png/goal_icon_v4_270deg.png"
    goal_dict['bwr_ccw'] = "png/goal_icon_v4_270deg.png"
    goal_dict['bwl_cw'] = "png/goal_icon_v4_270deg.png"

    return goal_dict

def ego2world(start_location, goal_location):
    
    #tf_mat = np.array([[np.cos(deg2rad), -np.sin(deg2rad), 0, start_location['x']],
    #                   [np.sin(deg2rad),  np.cos(deg2rad), 0, start_location['y']],
    #                   [0.0, 0.0, 1.0, 0.0],
    #                   [0.0, 0.0, 0.0, 1.0]])

    sx = start_location['x']
    sy = start_location['y']
    sang = start_location['angle']
    gx = goal_location[0]
    gy = goal_location[1]
    gang = goal_location[2]

    deg2rad = (sang/360)*(2*np.pi)

    arb_point_transl_x = (-(sx*np.cos(deg2rad)) + sy*np.sin(deg2rad) + sx)
    arb_point_transl_y = (-(sx*np.sin(deg2rad)) - sy*np.cos(deg2rad) + sy)

    tf_mat = np.array([[np.cos(deg2rad), -np.sin(deg2rad), 0, arb_point_transl_x],
                       [-np.sin(deg2rad), np.cos(deg2rad), 0, arb_point_transl_y],
                       [0.0, 0.0, 0.0, 1.0]])

    goal_location_temp = np.array([gx, gy, 0.0, 1.0])
    tf_goal = np.dot(tf_mat, goal_location_temp) #np.matmul(tf_mat, goal_location_temp)
    #print('\n')
    #print(tf_goal)
    #print('\n')
    #recv_ang = recover_angle(tf_goal, goal_location, start_location)

    # # TODO: CHECK THIS -> NOTE: seems to work; TODO: visual confirmation
    tf_rot = (sang - 90) + gang
    tf_rot_norm = normalizeAngle(tf_rot) 
    #

    goal_location_tf = np.array([tf_goal[0], tf_goal[1], tf_rot_norm])#_norm])


    return goal_location_tf

## TODO: if needed
def recover_angle(tfg, goal_loc, start_loc):

    pretfs_x = start_loc['x'] - goal_loc[0]
    pretfs_y = start_loc['y'] - goal_loc[1]
    posttfs_x = start_loc['x'] - tfg[0]
    posttfs_y = start_loc['y'] - tfg[1]

    pretf_slope = [pretfs_x, pretfs_y]
    posttf_slope = [posttfs_x, posttfs_y]

    recv_ang = 0.0

    return recv_ang

## TODO: URGENT (!) GOAL TRANSFORMATION NEEDS TO BE REPAIRED
## transforms a given goal location (specified in ego frame) into the world frame 
def ego2world_rot(start_location, goal_location):
    #print('\tentering ego2world_rot fn:')
    angle_for_matmul = (start_location['angle']/360)*(2*np.pi)
    tf_mat = np.array([[np.cos(angle_for_matmul), -np.sin(angle_for_matmul)],
                       [np.sin(angle_for_matmul),  np.cos(angle_for_matmul)]])
    
    goal_location_temp = np.array([goal_location[0], goal_location[1]])
    matmul_tmp = np.matmul(tf_mat, goal_location_temp)
    #print(goal_location_temp)
    #print(tf_mat)
    #print(matmul_tmp)
    
    # # TODO: CHECK THIS 
    tf_rot = (start_location['angle']- 90) + goal_location[2]
    tf_rot_norm = normalizeAngle(tf_rot) 
    #

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
    global trial_type_idx
    #all_cell_coords = list(itertools.product(range(width), range(height)))
    goal_list = []
    #dist_to_goals = [-100]
    
    num_moprim = len(mp_list)

    # TODO: store successive rand_goal_loc's mp_dict idx(s) into 
    # goal_list; use check on goal list to make sure repeated trials
    # do not occur in any given block; goal_tally() fn for this (!)
    #
    #trial_type_idx = np.random.randint(0, num_moprim)
    trial_type_idx = trial_type_idx + 1
    if trial_type_idx >= num_moprim:
        trial_type_idx = 0
    trial_type = mp_list[trial_type_idx]

    #while min(dist_to_goals) < START_DIST_THRESHOLD: # TODO: check if necessary; noise?
    if phase == "train":
        goal_choice = mp_dict[trial_type]
        
    elif phase == "test":
        goal_choice = mp_dict[trial_type]
        
 
    goal_list = np.append(goal_list, goal_choice, 0)

    return goal_list, goal_choice, trial_type

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
    print('\n')
    print(num_trials_total)
    print(num_blocks_total)
    print('\n')
    # experimental information (for logging to .json)
    experiment_name = args.experiment_name
    experiment_json_name = args.experiment_json_name

    # shuffling options
    is_shuffle_blocks = args.is_shuffle_blocks
    is_shuffle_trials = args.is_shuffle_trials

    # Cartesian state-space dimensions
    worldWidth = args.width
    worldHeight = args.height

    # user dimensions
    userWidth = args.userWidth
    userHeight = args.userHeight

    ## initialize the dictionary which contains all train and test
    experiment_dict = collections.OrderedDict()
    experiment_dict["experimentName"] = experiment_name
    experiment_dict["shuffleBlocks"] = is_shuffle_blocks
    experiment_dict["blocks"] = []
    #

    ## initialize the boundary dict (maps 'trial_type' to client/public/png/x.png files for moprim boundaries)
    boundary_dict = generate_boundary_dict()
    goal_dict = generate_goal_dict()
    #
    mp_tf = generate_mp_tf_dict()
    #

    ## populate trials in each block, for all blocks (train + test blocks)
    ab = 0
    a = 0
    b = 0
    for block_num in range(0, num_blocks_total): # NOTE: added 0 for starting bound on block_num's (index) range [6/01/21]
        current_block = collections.OrderedDict()
        #
        if block_num < num_train_blocks: # (training block case)
            a = a + 1
            current_block['blockName'] = "Training Block {}".format(block_num+1)
            current_block['block_type'] = "train"
            current_block['preTrials'] = []
            #training_block_intro_text_trial = collections.OrderedDict()
            #training_block_intro_text_trial['stimulusType'] = "test-display"
            #training_block_intro_text_trial['text'] = "<div><h3>Grid World Experiment</h3><hr /><p>This experiment consists of a training phase and a testing phase.</p><p>training_phase_placeholder_message_2</p><p>Once you have completed the training phase, you will be taken to the testing phase, PLACEHOLDER</p><p>When you are finished with the experiment, you may exit the webpage and your answers will be saved automatically.</p><div class=\"row\"><div class=\"col-md-6\"><p>Grid worlds will look like this. The gray robot is you and you must get the gray robot to the green square using WASD or arrow keys.</p><img style=\"height:200px; width:auto;\" src=\"img/gridworld3x3.png\" /></div><div class=\"col-md-6\"><p>Grid worlds with obstacles will look like this.  You are unable to move the robot into a black square.</p><img style=\"height:200px; width:auto;\" src=\"img/gridworld5x5.png\" /></div></div></div>"
            #current_block['preTrials'].append(training_block_intro_text_trial)
            phase = "train" # (phase flag set)
        elif block_num >= num_train_blocks: # (testing block case)
            b = b + 1
            current_block['blockName'] = "Testing Block {}".format(block_num-num_train_blocks+1)
            current_block['block_type'] = "test"
            current_block['preTrials'] = []
            phase = "test" # (phase flag set)

        print(current_block['blockName'])
        ab = a + b
        
        ## arguments to shuffle trials within a given block
        current_block['shuffleTrials'] = is_shuffle_trials
        current_block['trials'] = []

        ## initialize empty goal list per block
        goal_list = []

        ## trial range for trial_num ## NOTE: this is the spot ## TODO: this is where the blocksize > 1 bug is happening; FIGURE THIS OUT :^)
        #if num_trial
        if block_num < num_train_trials:
            if num_train_blocks == 0:
                trial_range = 0
            else:
                trial_range = (num_train_trials/num_train_blocks)
        
        elif block_num >= num_train_blocks:
            if num_test_blocks == 0:
                trial_range = 0
            else:
                trial_range = (num_test_trials/num_test_blocks)

        print(trial_range)
        ## trial 
        for trial_num in range(int(trial_range)):
            print(trial_num)
            trial_dict = collections.OrderedDict()
            trial_dict['fps'] = 60
            trial_dict['gridApproximation'] = 3 # TODO: get a better sense of this parameter's effect
            trial_dict['stimulusType'] = "continuous-world-dynamic"
            trial_dict['worldWidth'] = worldWidth
            trial_dict['worldHeight'] = worldHeight

            if num_train_blocks != 0:
                #print('\ntraining block case 1')
                if block_num == 0: # (training block case)
                    #print(' -> training block case 2')
                    trial_dict['instructions'] = "[0] TRAINING INSTRUCTIONS: ."
                elif block_num == num_train_blocks: # (testing block case)
                    trial_dict['instructions'] = "[1] TRAINING INSTRUCTIONS: ."
                #else:
                #    trial_dict['instructions'] = "Press any key to continue..." # CHECK
            elif num_train_blocks == 0:
                trial_dict['instructions'] = "TEST INSTRUCTIONS:  mp type = "

            ## TO-DO: FIGURE THIS OUT :^)
            if block_num < num_train_blocks: # (training block case)
                start_state_dict = create_start_location(worldWidth, worldHeight, phase)
            elif block_num >= num_train_blocks: # (testing block case)
                start_state_dict = create_start_location(worldWidth, worldHeight, phase)

            ## generate motion primitive dictionary + list for indexing ## NOTE: PIXEL_SCALE HERE
            pixel_scale = 350#190
            mp_list = generate_mp_list() 
            mp_dict = generate_mp_dict(pixel_scale, mp_list, start_state_dict, userHeight)

            goal_list, goal_location, trial_type = generate_goal_list(mp_dict, mp_list, start_state_dict, phase, goal_list)
            #print(goal_list)
            #
            trial_dict['humanAgent'] = start_state_dict
            #print(trial_dict['humanAgent'])
            #
            trial_dict['obstacles'] = []
            #
            
            tf_tmp = mp_tf[trial_type]            
            tf_x = tf_tmp[0]
            tf_y = tf_tmp[1]            

            trial_dict['goalWidth'] = userHeight#50
            trial_dict['goalHeight'] = userHeight#50

            w_tmp = trial_dict['goalWidth']
            h_tmp = trial_dict['goalHeight']
            diagonal = w_tmp*np.sqrt(2) # calculates diagonal of goal (square footprint)
            halfdiag = diagonal/2 # half diagonal for translation 
            trial_dict['goalLocationAngle'] = goal_location[2] # TODO: add fn downstream to use this  

            print(tf_tmp)
            print(tf_x)
            print(tf_y)
            print(goal_location[0])
            print(goal_location[1])
            print(goal_location[0] + tf_x*halfdiag*np.cos((45)+trial_dict['goalLocationAngle']) - w_tmp/2)
            print(goal_location[1] + tf_y*halfdiag*np.sin((45)+trial_dict['goalLocationAngle']) - h_tmp/2)

            trial_dict['goalLocationX'] = goal_location[0] #+ (trial_dict['goalWidth']/2)*np.cos((45)+trial_dict['goalLocationAngle'])
            trial_dict['goalLocationY'] = goal_location[1] #+ (trial_dict['goalHeight']/2)*np.sin((45)+trial_dict['goalLocationAngle'])
            
            #trial_dict['goalLocationX'] = goal_location[0] + (trial_dict['goalWidth']/2)*np.cos((45)+trial_dict['goalLocationAngle'])
            #trial_dict['goalLocationY'] = goal_location[1] + (trial_dict['goalHeight']/2)*np.sin((45)+trial_dict['goalLocationAngle'])
            #trial_dict['goalLocationX'] = goal_location[0] - w_tmp/2 + tf_x*w_tmp/2*np.cos((45)+trial_dict['goalLocationAngle']) 
            #trial_dict['goalLocationY'] = goal_location[1] - h_tmp/2 + tf_y*h_tmp/2*np.sin((45)+trial_dict['goalLocationAngle'])
            #trial_dict['goalLocationX'] = goal_location[0] - w_tmp/2 + tf_x*w_tmp/2*np.cos((45)+trial_dict['goalLocationAngle']) 
            #trial_dict['goalLocationY'] = goal_location[1] - h_tmp/2 + tf_y*h_tmp/2*np.sin((45)+trial_dict['goalLocationAngle'])  
            trial_dict['instructions'] = "TEST INSTRUCTIONS: Move the robot with WASD or the arrow keys in order to reach the goals as they appear; \nFOR TESTING: mp type = " + str(trial_type)
            print('\n>>' + str(current_block['block_type']))
            print('\n')
            trial_dict['blockType'] = current_block['block_type']
            trial_dict['trial_type'] = trial_type
            trial_dict['boundary'] = boundary_dict[trial_dict['trial_type']]
            trial_dict['goal_img'] = goal_dict[trial_dict['trial_type']]
            #
            #trial_dict['tickTime'] = 600
            #trial_dict['visualizeGridLines'] = True
            trial_dict['postText'] = "You've reached the goal! Press any key to continue."
            #
            current_block['trials'].append(trial_dict)

        
        if block_num == num_blocks_total-1:
            current_block['postTrials'] = []
            endQuestionnaireBlock = collections.OrderedDict()
            endQuestionnaireBlock['stimulusType'] = "post-experiment-questionnaire"
            current_block['postTrials'].append(endQuestionnaireBlock)
        else:
            current_block['postTrials'] = []
            block_end_text_trial = collections.OrderedDict()
            block_end_text_trial['stimulusType'] = "text-display"
            block_end_text_trial['text'] = "<div><h3>Current block over. Press any key for next block</h3><hr/></div>" # pdiv -> div [3/29/2021]
            current_block['postTrials'].append(block_end_text_trial)

        experiment_dict["blocks"].append(current_block)

        

    
    #current_block['postExperimentQuestionnaire'] = []
    #endQuestionnaireBlock = collections.OrderedDict()
    #endQuestionnaireBlock['stimulusType'] = "postExperimentQuestionnaire"
    #experiment_dict["endQuestionnaireBlock"] = endQuestionnaireBlock

    print('generation of blocks completed')

    ## save and export the experiment as a .json file
    
    json_directory = os.path.join(os.path.dirname(__file__), '../server/')#exp_json_directory')
    if not os.path.exists(json_directory):
        os.makedirs(json_directory)
    full_path_to_json = os.path.join(json_directory, experiment_json_name)
    print('\nprint json file:\n\t'+str(__file__) + ' -> ' + str(full_path_to_json))
    with open(full_path_to_json, 'w') as fp:
        json.dump(experiment_dict, fp)

    print('\n>> total # of blocks: ' + str(ab) + '; with ' + str(a) + ' TRAIN blocks, ' + str(b) + ' TEST blocks.')
    print('\t---> total # of trials: ' + str(((a*num_trials_per_train_block) + (b*num_trials_per_test_block))) + '; with ' + str(num_trials_per_train_block) + ' TRAIN trials per block, ' + str(num_trials_per_test_block) + ' TEST trials per block.')

## main function + argument parsing
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--width', action='store', type=int, default=850, help="width of grid world")
    parser.add_argument('--height', action='store', type=int, default=850, help="height of grid world")
    parser.add_argument('--userWidth', action='store', type=int, default=80, help="width of user's vehicle")
    parser.add_argument('--userHeight', action='store', type=int, default=80, help="height of user's vehicle")
    parser.add_argument('--num_train_blocks', action='store', type=int, default=3, help="number of training blocks")
    parser.add_argument('--num_train_trials', action='store', type=int, default=1, help="number of trials per training block")
    parser.add_argument('--num_test_blocks', action='store', type=int, default=3, help="number of testing blocks")
    parser.add_argument('--num_test_trials', action='store', type=int, default=1, help="number of trials per testing block")
    parser.add_argument('--experiment_name', action='store', type=str, default="Grid World Experiment (Continuous)", help="name of the experiment")
    parser.add_argument('--experiment_json_name', action='store', type=str, default="Experiment_ContDyn_awt.json", help="name of .json file which defines the experiment")
    parser.add_argument('--is_shuffle_trials', action='store_true', default=True, help="flag for shuffling trials")
    parser.add_argument('--is_shuffle_blocks', action='store_true', default=False, help="flag for shuffling blocks")
    
    args = parser.parse_args()
    generate_grid_world_trials(args)