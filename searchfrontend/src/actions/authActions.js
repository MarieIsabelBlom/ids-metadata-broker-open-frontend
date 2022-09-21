import axios from 'axios';
import { returnErrors } from './errorActions';

import {
  USER_LOADED,
  USER_LOADING,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT_SUCCESS,
  DELETE_SUCCESS,
  DELETE_FAIL
} from './types';

import { mongodb_handlerURL } from '../urlConfig';

// Check token & load user
export const loadUser = () => (dispatch, getState) => {
  // User loading
  dispatch({ type: USER_LOADING });

  axios.get(mongodb_handlerURL + '/auth/user', tokenConfig(getState))
    .then(res => dispatch({
      type: USER_LOADED,
      payload: res.data
    }))
    .catch(err => {
      if (err.response) {
        dispatch(returnErrors(err.response.data, err.response.status))
      } else {
        dispatch(returnErrors({ msg: 'Network Error' }, 400))
      }
      dispatch({
        type: AUTH_ERROR
      })
    })
}

// Setup config/headers and token
export const tokenConfig = getState => {
  // Get token from localstorate
  const token = getState().auth.token;

  // Headers
  const config = {
    headers: {
      'Content-type': 'application/json'
    }
  };

  // If token, add to headers
  if (token) {
    config.headers['x-auth-token'] = token;
  }

  return config;
}


// Login User
export const login = ({ username, password }) => dispatch => {
  // Headers
  const config = {
    headers: {
      'Content-type': 'application/json'
    }
  };

  // Request Body
  const body = JSON.stringify({ username, password });

  axios
    .post(mongodb_handlerURL + '/auth', body, config)
    .then(res =>
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      })
    )
    .catch(err => {
      if (err.response) {
        dispatch(
          returnErrors(err.response.data, err.response.status, 'LOGIN_FAIL')
        )
      } else {
        dispatch(
          returnErrors({ msg: 'Network error' }, 400, 'LOGIN_FAIL')
        );
      }
      dispatch({
        type: LOGIN_FAIL
      })
    })
}


// Logout User
export const logout = () => {
  return {
    type: LOGOUT_SUCCESS
  }
}

export const deletion = () => {
  return {
    type: DELETE_SUCCESS
  }
}
