// Code developed by Finley Lau*, Deepak Gopinath*. Copyright (c) 2020. Argallab. (*) Equal contribution
import React from 'react';

function LoadingScreen(props) {
  return (
    <div className="loader centered-content">
      {props.text ? <h4>{props.text}</h4> : ""}
      {props.hideLoader ? "" : <i className="fa fa-cog fa-spin" />}
    </div>
  );
}

export default LoadingScreen;