#!/usr/bin/env python
# -*- coding: utf-8 -*-
import collections
import json
import argparse
import os
import itertools
import random
import numpy as np

START_DIST_THRESHOLD = 2
INTER_GOAL_THRESHOLD = 10

def create_obstacle_list(width, height, occupancy_measure, num_obstacle_patches=2, dirichlet_scale_param=10):
    assert occupancy_measure < 1.0 and occupancy_measure >= 0.0
    num_cells = width * height
    num_occupied_cells = int(round(occupancy_measure * num_cells))
    num_cells_for_all_patches = list(np.int32(np.round(num_occupied_cells*np.random.dirichlet(np.ones(num_obstacle_patches)*dirichlet_scale_param))))
    all_cell_coords = list(itertools.product(range(width), range(height)))
    #pick three random starting points
    obstacle_patch_seeds = random.sample(all_cell_coords, num_obstacle_patches)
    def get_random_obstacle_neighbors(obs):
        def check_bounds(state):
            state[0] = max(0, min(state[0], width-1))
            state[1] = max(0, min(state[1], height-1))
            return state

        top_neighbor = tuple(check_bounds(np.array(obs) + (0, 1)))
        bottom_neighbor = tuple(check_bounds(np.array(obs) + (0, -1)))
        left_neighbor = tuple(check_bounds(np.array(obs) + (-1, 0)))
        right_neighbor = tuple(check_bounds(np.array(obs) + (1, 0)))

        all_neighbors = [top_neighbor, bottom_neighbor, left_neighbor, right_neighbor]
        # return all_neighbors
        num_neighbors_to_be_returned = random.randint(1, len(all_neighbors))
        return random.sample(all_neighbors, num_neighbors_to_be_returned)
    
    obstacle_list = []
    for i, (num_cells_for_patch, patch_seed) in enumerate(zip(num_cells_for_all_patches, obstacle_patch_seeds)):
        # print('Creating obstacle patch ', i)
        obstacles_in_patch = [tuple(patch_seed)]
        while len(obstacles_in_patch) <= num_cells_for_patch:
            new_cells = []
            for obs in obstacles_in_patch:
                new_cells.extend(get_random_obstacle_neighbors(obs))
            obstacles_in_patch.extend(new_cells)
            obstacles_in_patch = list(set(obstacles_in_patch)) #remove duplicates

        obstacle_list.extend(obstacles_in_patch)
    
    obstacle_dicts_list = []
    for obs in obstacle_list:
        obs_dict = dict()
        obs_dict['locationX'] = obs[0]
        obs_dict['locationY'] = obs[1]
        obstacle_dicts_list.append(obs_dict)
    return obstacle_list, obstacle_dicts_list
    
def create_random_goals(width, height, obstacle_list, num_goals=1):
    all_cell_coords = list(itertools.product(range(width), range(height)))
    random_goals = []
    sampled_goal = random.sample(list(set(all_cell_coords) - set(obstacle_list)- set(random_goals)), 1)[0]
    random_goals.append(sampled_goal) #add the first goal into the array.

    
    while len(random_goals) < num_goals:
        sampled_goal = random.sample(list(set(all_cell_coords) - set(obstacle_list)- set(random_goals)), 1)[0] #tuple
        dist_to_goals = [np.linalg.norm(np.array(sampled_goal) - np.array(g)) for g in random_goals]
        if min(dist_to_goals) > INTER_GOAL_THRESHOLD:
            random_goals.append(sampled_goal)
        else:
            continue
        
    goal_location_dict = dict()
    goal_location_dict['goalLocationX'] = random_goals[0][0] #for the time being just use the first goal in the list
    goal_location_dict['goalLocationY'] = random_goals[0][1]
    return random_goals, goal_location_dict

def create_start_location(width, height, obstacle_list, goal_list):
    all_cell_coords = list(itertools.product(range(width), range(height)))
    dist_to_goals = [-1000]
    while min(dist_to_goals) < START_DIST_THRESHOLD: 
        random_start_state = random.sample(list(set(all_cell_coords) - set(goal_list) - set(obstacle_list)), 1)[0]
        print(random_start_state)
        dist_to_goals = [np.linalg.norm(np.array(random_start_state) - np.array(g)) for g in goal_list]
        print(dist_to_goals)
    
    random_start_state_dict = dict()
    random_start_state_dict['x'] = random_start_state[0]
    random_start_state_dict['y'] = random_start_state[1]
    return random_start_state, random_start_state_dict

def generate_grid_world_trials(args):
    num_blocks = args.num_blocks
    num_trials_per_block = args.num_trials_per_block
    experiment_name = args.experiment_name
    experiment_json_name = args.experiment_json_name
    is_shuffle_blocks = args.is_shuffle_blocks
    is_shuffle_trials = args.is_shuffle_trials
    
    #grid world dimensions and obstacle occupancy measure
    width = args.width
    height = args.height
    occupancy_measure = args.occupancy_measure

    experiment_dict = collections.OrderedDict()

    experiment_dict["experimentName"] = experiment_name
    experiment_dict["shuffleBlocks"] = is_shuffle_blocks
    experiment_dict["blocks"] = []
    for nb in range(num_blocks+1): #+1 to accomodate for the training block. # TODO: is this what's causing the extra trial? Check this![06/04/2021]
        current_block = collections.OrderedDict()
        if nb == 0: #if training block
            current_block['blockName'] = "Training Block"
            current_block['preTrials'] = []
            training_block_intro_text_trial = collections.OrderedDict()
            training_block_intro_text_trial['stimulusType'] = "text-display"
            training_block_intro_text_trial['text'] = "<div><h3>Grid World Experiment</h3><hr /><p>This experiment consists of a training phase and a testing phase.</p><p>In this training phase, you will be introduced to our grid world and the objectives of the trials.</p><p>Once you have completed the training phase, you will be taken to the testing phase, which will consist of 2 sets of grid world games. The first block will consist of simple grid world games with no obstacles and the second block will consist of simple grid world games with obstacles.</p><p>When you are finished with the experiment, you may exit the webpage and your answers will be saved automatically.</p><div class=\"row\"><div class=\"col-md-6\"><p>Grid worlds will look like this. The gray robot is you and you must get the gray robot to the green square using WASD or arrow keys.</p><img style=\"height:200px; width:auto;\" src=\"img/gridworld3x3.png\" /></div><div class=\"col-md-6\"><p>Grid worlds with obstacles will look like this.  You are unable to move the robot into a black square.</p><img style=\"height:200px; width:auto;\" src=\"img/gridworld5x5.png\" /></div></div></div>"
            current_block['preTrials'].append(training_block_intro_text_trial)
        else:
            current_block['blockName'] = "Testing Block {}".format(nb)
            current_block['preTrials'] = []
        
        current_block['shuffleTrials'] = is_shuffle_trials
        current_block['trials'] = []
        
        for ntb in range(num_trials_per_block):
            tdict =  collections.OrderedDict()
            tdict['stimulusType'] = "grid-world"
            tdict['width'] = width
            tdict['height'] = height
            
            if nb == 0: #if training block
                obstacle_list = []
                obstacle_dicts_list = []
                tdict['instructions'] = "This is a grid-world.  Move the robot to the goal. Use WASD or the arrow keys to move.  (robot=gray circle, goal=green space)"
            else:
                obstacle_list, obstacle_dicts_list = create_obstacle_list(width, height, occupancy_measure) #obstacle is a list of collections.OrderedDict() where each dict has two keys locationX locationY
                tdict['instructions'] = "This is a grid-world with obstacles.  You cannot go into the black squares.  Move the robot to the goal. Use WASD or the arrow keys to move.  (robot=gray circle, goal=green space)"
            
            tdict['obstacles'] = obstacle_dicts_list
            goal_location_list, goal_location_dict = create_random_goals(width, height, obstacle_list, num_goals=1)
            print(goal_location_list)
            tdict['goalLocationX'] = goal_location_dict['goalLocationX']
            tdict['goalLocationY'] = goal_location_dict['goalLocationY']

            random_start_state, random_start_state_dict = create_start_location(width, height, obstacle_list, goal_location_list) #is a dict containing two keys x and y. 
            tdict['humanAgent'] = random_start_state_dict
            tdict['tickTime'] = 600 #porbably immaterial if autonomous agent is None
            tdict['visualizeGridLines'] = False
            tdict['postText'] = "Good job!  Press any key to continue."
            current_block['trials'].append(tdict) #append trial to current block. 

        current_block['postTrials'] = [] #potentiall have survery for testing blocks
        block_end_text_trial = collections.OrderedDict()
        block_end_text_trial['stimulusType']= "text-display"
        block_end_text_trial['text'] = "<div><h3>Current block over. Press any key for next block</h3><hr/></div>"
        current_block['postTrials'].append(block_end_text_trial)

        experiment_dict["blocks"].append(current_block)
    
    #full path to json
    json_directory = os.path.join(os.path.dirname(__file__), 'exp_json_directory')
    if not os.path.exists(json_directory):
        os.makedirs(json_directory)
    full_path_to_json = os.path.join(json_directory, experiment_json_name)
    with open(full_path_to_json, 'w') as fp:
        json.dump(experiment_dict, fp)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--width', action='store', type=int, default=8, help="width of grid world")
    parser.add_argument('--height', action='store', type=int, default=8, help="height of grid world")
    parser.add_argument('--occupancy_measure', action='store', type=float, default=0.05, help="obstacle occupancy measure")
    parser.add_argument('--num_blocks', action='store', type=int, default=2, help="number of testing blocks")
    parser.add_argument('--num_trials_per_block', action='store', type=int, default=3, help="number of trials per training/testing blocks")
    parser.add_argument('--experiment_name', action='store', type=str, default="Grid World Experiment", help="name of the experiment")
    parser.add_argument('--experiment_json_name', action='store', type=str, default="Experiment_GW.json", help="name of the experiment json file")
    parser.add_argument('--is_shuffle_trials', action='store_true', default=False, help="flag for shuffling trials within a block")
    parser.add_argument('--is_shuffle_blocks', action='store_true', default=False, help="flag for shuffling blocks")

    args = parser.parse_args()
    generate_grid_world_trials(args)    