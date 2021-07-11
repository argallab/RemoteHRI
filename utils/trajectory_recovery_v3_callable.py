# !/usr/bin/env python
# -*- coding: utf-8 -*-
import numpy as np
import scipy as sp
import matplotlib.pyplot as plt
from scipy import optimize

# this script is for recovering sparse two-dimensional timeseries as approximate polynomial functions 
# TODO: generate 1 mp at a time


# scales trajectories to rhri values (mm -> px)
def scale_mm_to_px(traj2scale):
    scaled_traj = traj2scale
    #translation_vec = np.ones(np.size(traj2scale[:,0]), 1)*425.0
    scaled_traj[:,0] = traj2scale[:,0] + 425.0 # NOTE: TODO: figure out if added (80/2) goal icon translation is needed
    scaled_traj[:,1] = traj2scale[:,1] + 425.0 # NOTE: TODO: figure out if added (80/2) goal icon translation is needed

    return scaled_traj

# generates motion primitives that are 'fwr-like'
# specify mp to generate as well as # of timesteps for generated trajectory
def generate_fwr_like(mp, ts, show=False, save=False):

    #####################################################

    fwr = np.loadtxt('mp_optim/base/fwr_like.txt')
    ts = int(ts)

    #####################################################

    # FWR-LIKE CASE #

    if mp == 'fwr' or mp == 'all':
        # fwr (+, +)
        coeffs_fwr = np.polyfit(fwr[:,0], fwr[:,1], 8) 
        poly_eq_fwr = np.poly1d(coeffs_fwr)
        x_space_fwr = np.linspace(0, fwr[-1,0], ts)
        y_hat_fwr = poly_eq_fwr(x_space_fwr)
        if show == True:
            plt.plot(x_space_fwr, y_hat_fwr, '*k')
        fwr_traj = np.transpose(np.array([x_space_fwr, y_hat_fwr]))
        traj = fwr_traj
        # save fwr-like trajectories (x, y) as txt files
        if save == True:
            np.savetxt('mp_optim/mp/fwr.txt', fwr_traj)

    if mp == 'bwr' or mp == 'all':
        # bwr (+, -)
        coeffs_bwr = np.polyfit(fwr[:,0], -1*fwr[:,1], 8) 
        poly_eq_bwr = np.poly1d(coeffs_bwr)
        x_space_bwr = np.linspace(0, fwr[-1,0], ts)
        y_hat_bwr = poly_eq_bwr(x_space_bwr)
        if show == True:
            plt.plot(x_space_bwr, y_hat_bwr, '*r')
        bwr_traj = np.transpose(np.array([x_space_bwr, y_hat_bwr]))
        traj = bwr_traj
        # save fwr-like trajectories (x, y) as txt files
        if save == True:
            np.savetxt('mp_optim/mp/bwr.txt', bwr_traj)

    if mp == 'bwl' or mp == 'all':
        # bwl (-, -)
        coeffs_bwl = np.polyfit(-1*fwr[:,0], -1*fwr[:,1], 8) 
        poly_eq_bwl = np.poly1d(coeffs_bwl)
        x_space_bwl = np.linspace(0, -1*fwr[-1,0], ts)
        y_hat_bwl = poly_eq_bwl(x_space_bwl)
        if show == True:
            plt.plot(x_space_bwl, y_hat_bwl, '*g')
        bwl_traj = np.transpose(np.array([x_space_bwl, y_hat_bwl]))
        traj = bwl_traj
        # save fwr-like trajectories (x, y) as txt files
        if save == True:
            np.savetxt('mp_optim/mp/bwl.txt', bwl_traj)

    if mp == 'fwl' or mp == 'all':
        # fwl (-, +)
        coeffs_fwl = np.polyfit(-1*fwr[:,0], fwr[:,1], 8) 
        poly_eq_fwl = np.poly1d(coeffs_fwl)
        x_space_fwl = np.linspace(0, -1*fwr[-1,0], ts)
        y_hat_fwl = poly_eq_fwl(x_space_fwl)
        if show == True:
            plt.plot(x_space_fwl, y_hat_fwl, '*b')
        fwl_traj = np.transpose(np.array([x_space_fwl, y_hat_fwl]))
        traj = fwl_traj
        # save fwr-like trajectories (x, y) as txt files
        if save == True:
            np.savetxt('mp_optim/mp/fwl.txt', fwl_traj)

    # visualize polynomial fits
    if show == True:
        plt.show()

    if mp == 'all':
        return fwr_traj, bwr_traj, bwl_traj, fwl_traj
    else:
        return traj

# generates motion primitives that are 'hybrid-like'
# specify mp to generate as well as # of timesteps for generated trajectory
def generate_hybrid_like(mp, ts, show=False, save=False):

    ####################################################

    hybrid = np.loadtxt('mp_optim/base/hybrid_like.txt')
    ts = int(ts)

    ####################################################

    # HYBRID-LIKE CASE #

    if mp == 'fwr_cw' or mp == 'all':
        # fwr_cw (+, +)
        coeffs_fwr_cw = np.polyfit(hybrid[:,0], hybrid[:,1], 12) 
        poly_eq_fwr_cw = np.poly1d(coeffs_fwr_cw)
        x_space_fwr_cw = np.linspace(0, hybrid[-1,0], 400)
        y_hat_fwr_cw = poly_eq_fwr_cw(x_space_fwr_cw)
        if show == True:
            plt.plot(x_space_fwr_cw, y_hat_fwr_cw, '*k')
        fwr_cw_traj = np.transpose(np.array([x_space_fwr_cw, y_hat_fwr_cw]))
        traj = fwr_cw_traj
        # save hybrid-like trajectories (x, y) as txt files
        if save == True:
            np.savetxt('mp_optim/mp/fwr_cw.txt', fwr_cw_traj)

    if mp == 'bwr_ccw' or mp == 'all':
        # bwr_ccw (+, -)
        coeffs_bwr_ccw = np.polyfit(hybrid[:,0], -1*hybrid[:,1], 12) 
        poly_eq_bwr_ccw = np.poly1d(coeffs_bwr_ccw)
        x_space_bwr_ccw = np.linspace(0, hybrid[-1,0], 400)
        y_hat_bwr_ccw = poly_eq_bwr_ccw(x_space_bwr_ccw)
        if show == True:
            plt.plot(x_space_bwr_ccw, y_hat_bwr_ccw, '*r')
        bwr_ccw_traj = np.transpose(np.array([x_space_bwr_ccw, y_hat_bwr_ccw]))
        traj = bwr_ccw_traj
        # save hybrid-like trajectories (x, y) as txt files
        if save == True:
            np.savetxt('mp_optim/mp/bwr_ccw.txt', bwr_ccw_traj)
            
    if mp == 'bwl_cw' or mp == 'all':
        # bwl_cw (-, -)
        coeffs_bwl_cw = np.polyfit(-1*hybrid[:,0], -1*hybrid[:,1], 12) 
        poly_eq_bwl_cw = np.poly1d(coeffs_bwl_cw)
        x_space_bwl_cw = np.linspace(0, -1*hybrid[-1,0], 400)
        y_hat_bwl_cw = poly_eq_bwl_cw(x_space_bwl_cw)
        if show == True:
            plt.plot(x_space_bwl_cw, y_hat_bwl_cw, '*g')
        bwl_cw_traj = np.transpose(np.array([x_space_bwl_cw, y_hat_bwl_cw]))
        traj = bwl_cw_traj
        # save hybrid-like trajectories (x, y) as txt files
        if save == True:
            np.savetxt('mp_optim/mp/bwl_cw.txt', bwl_cw_traj)

    if mp == 'fwl_ccw' or mp == 'all':
        # fwl_ccw (-, +)
        coeffs_fwl_ccw = np.polyfit(-1*hybrid[:,0], hybrid[:,1], 12) 
        poly_eq_fwl_ccw = np.poly1d(coeffs_fwl_ccw)
        x_space_fwl_ccw = np.linspace(0, -1*hybrid[-1,0], 400)
        y_hat_fwl_ccw = poly_eq_fwl_ccw(x_space_fwl_ccw)
        if show == True:
            plt.plot(x_space_fwl_ccw, y_hat_fwl_ccw, '*b')
        fwl_ccw_traj = np.transpose(np.array([x_space_fwl_ccw, y_hat_fwl_ccw]))
        traj = fwl_ccw_traj
        # save hybrid-like trajectories (x, y) as txt files
        if save == True:
            np.savetxt('mp_optim/mp/fwl_ccw.txt', fwl_ccw_traj)

    # visualize polynomial fits
    if show == True:
        plt.show()
    
    if mp == 'all':
        return fwr_cw_traj, bwr_ccw_traj, bwl_cw_traj, fwl_ccw_traj
    else:
        return traj

