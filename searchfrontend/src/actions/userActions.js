import axios from 'axios';
import {
  USERS_LOADING,
  GET_USERS,
  ADD_USER,
  UPDATE_USER,
  DELETE_USER,
  CLEAR_USER
} from './types';
import { returnErrors } from './errorActions';
import { tokenConfig } from './authActions';

//import { mongodb_handlerURL } from '../urlConfig';

export const setUsersLoading = () => {
  return {
    type: USERS_LOADING
  }
}

const mongodb_handlerURL = 'http://localhost:4000';

export const getUsers = () => (dispatch, getState) => {
  dispatch(setUsersLoading());
  axios
      .get(mongodb_handlerURL + '/users', tokenConfig(getState))
      .then(res => {
          dispatch({
            type: GET_USERS,
            payload: res.data
          })
      })
      .catch(err => {
          console.log("Get users error: " + err);
      })
}

export const addUser = user => (dispatch, getState) => {
  axios
    .post(mongodb_handlerURL + '/users/add', user, tokenConfig(getState))
    .then(res => {
      dispatch({
        type: ADD_USER,
        payload: res.data
      })
    })
    .catch(err => {
      if(err.response) {
        dispatch(
          returnErrors(err.response.data, err.response.status, 'ADD_FAIL')
        )
      } else {
        dispatch(
          returnErrors({msg: 'Network error'}, 400, 'ADD_FAIL')
        );
      }
    })
}

// Clear User
export const clearUser = () => {
  return {
    type: CLEAR_USER
  }
}

export const updateUser = user => (dispatch, getState) => {
  axios
    .post(mongodb_handlerURL + `/users/update/${user.id}`, user, tokenConfig(getState))
    .then(res => {
      dispatch({
        type: UPDATE_USER,
        payload: res.data
      })
    })
}

export const deleteUser = id => (dispatch, getState) => {
  axios
    .delete(mongodb_handlerURL + `/users/delete/${id}`, tokenConfig(getState))
    .then(res => {
      dispatch({
        type: DELETE_USER,
        payload: id
      })
    })
}
