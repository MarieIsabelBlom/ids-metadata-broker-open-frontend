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
  DELETE_FAIL,
  SAVE_SUCCESS,
  SAVE_FAIL
} from './types';

import { mongodb_handlerURL } from '../urlConfig';
import { elasticsearchURL } from '../urlConfig';



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

//Save deleted Resource to MongoDB
export const savetodbresource = ({ reason }) => (dispatch, getState) => {
  //const token = getState().auth.token;
  let resourceId = decodeURIComponent(window.location.search);
  if (resourceId !== null && resourceId !== "") {
      resourceId = resourceId.split("=")[1];
  }

axios.get(elasticsearchURL + '/resources/_search?size=100&q=*:*&pretty' , tokenConfig(getState), {
  data: {
      query: {
          term: {
              _id: resourceId
          }
      }
  }
})
.then(response => {
    if (response.status === 200) {
        const fresource = [response.data.hits.hits.find(({ _id }) => _id === resourceId)];
        fresource.map(resource => {
                let ResourceURI = resource._source.resourceID;
               // console.log(JSON.stringify(ResourceURI))   
                  
  var data = JSON.stringify({ "id": ResourceURI, "reason": reason });
  let tokenheader =   tokenConfig(getState)
  var config = {
    method: 'post',
    url: mongodb_handlerURL + '/data/addreason',
   /* headers: { 
      'Content-Type': 'application/json'
        },*/
      headers: tokenheader.headers,  
    data : data
  };

 /* if (token) {
    config.headers['x-auth-token'] = token;
  };
  console.log(token);*/
  console.log(tokenConfig(getState))
  axios(config, tokenConfig(getState))
  .then(function (response) {
    dispatch({
      type: SAVE_SUCCESS
    });
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  }); 
     })  
        
        }
    })
    .catch(err => {
      if (err.response) {
        dispatch(
          returnErrors(err.response.data, err.response.status, 'SAVE_FAIL')
        )
      } else {
        dispatch(
          returnErrors({ msg: 'Network error' }, 400, 'SAVE_FAIL')
        );
      }
      dispatch({
        type: SAVE_FAIL
      })
    }) 
  };

//Save deleted Connector to DB  
export const savetodb = ({ reason }) =>  (dispatch, getState) => {
  const token = getState().auth.token;
  let resourceId = decodeURIComponent(window.location.search);
  if (resourceId !== null && resourceId !== "") {
      resourceId = resourceId.split("=")[1];
  }

axios.get(elasticsearchURL + '/registrations/_search?size=1000&pretty' , tokenConfig(getState), {
  data: {
      query: {
          term: {
              _id: resourceId
          }
      }
  }
})
.then(response => {
    if (response.status === 200) {
        const connector = response.data.hits.hits;
        const fconnector = [response.data.hits.hits.find(({ _id }) => _id === resourceId)];
        fconnector.map(conn => {
                let id = conn._id;
                let connector = conn._source.connector;
                let originURI = connector.originURI;
              //  console.log(JSON.stringify(originURI))   
                  

  var data = JSON.stringify({ "id": originURI, "reason": reason });
  
  var config = {
    method: 'post',
    url: mongodb_handlerURL +  '/data/addreason',
    headers: { 
      'Content-Type': 'application/json'
        },
    data : data
  };
  if (token) {
    config.headers['x-auth-token'] = token;
  };
  
  axios(config, tokenConfig(getState))
  .then(function (response) {
    dispatch({
      type: SAVE_SUCCESS
    });
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  }); 
     })  
        
        }
    })
    .catch(err => {
      if (err.response) {
        dispatch(
          returnErrors(err.response.data, err.response.status, 'SAVE_FAIL')
        )
      } else {
        dispatch(
          returnErrors({ msg: 'Network error' }, 400, 'SAVE_FAIL')
        );
      }
      dispatch({
        type: SAVE_FAIL
      })
    }) 
  };

export const deleteconnectors = () => (dispatch, getState) => {

  let resourceId = decodeURIComponent(window.location.search);
  if (resourceId !== null && resourceId !== "") {
      resourceId = resourceId.split("=")[1];
  }

axios.get(elasticsearchURL + '/registrations/_search?size=1000&pretty' , tokenConfig(getState), {
  data: {
      query: {
          term: {
              _id: resourceId
          }
      }
  }
})
.then(response => {
    if (response.status === 200) {
        const connector = response.data.hits.hits;
        const fconnector = [response.data.hits.hits.find(({ _id }) => _id === resourceId)];
        fconnector.map(conn => {
                let id = conn._id;
                let connector = conn._source.connector;
                let originURI = connector.originURI;
              //  console.log(JSON.stringify(originURI))   
       axios.get(mongodb_handlerURL + '/data/clean/connector/' + originURI, tokenConfig(getState), )
        .then ((originURI) => {
           console.log("cleaning Request for Connector " , JSON.stringify(originURI));})
        .catch(err => {
          if (err.response) {
            dispatch(returnErrors(err.response.data, err.response.status))
            console.log('Fehler')
          } else {
            dispatch(returnErrors({ msg: 'Network Error' }, 400))
          }
          dispatch({
            type: DELETE_FAIL
          })
        }) 
      })  
        
        }
    })
        .catch(err => {
            console.log("An error occured: " + err);
        })
}



export const deleteresource = () => (dispatch, getState) => {
  
  let resourceId = decodeURIComponent(window.location.search);
  if (resourceId !== null && resourceId !== "") {
      resourceId = resourceId.split("=")[1];
  }

  axios.get(elasticsearchURL + '/resources/_search?size=100&q=*:*&pretty', tokenConfig(getState), {
    data: {
      query: {
        term: {
          _id: resourceId
        }
      }
    }
  })
    .then(response => {
      if (response.status === 200) {
        const fresource = [response.data.hits.hits.find(({ _id }) => _id === resourceId)];
        fresource.map(resource => {
          let ResourceURI = resource._source.resourceID;
          //console.log(JSON.stringify(ResourceURI))   

          //get connector originURI
          //post request is used because browsers don't allow sending get requests with body - it is ignored
          let connectorID = resource._source.connectorID;
          axios.get(elasticsearchURL + '/registrations/_search?size=100&pretty', {
            query: {
              term: {
                _id: connectorID
              }
            }
          }, tokenConfig(getState))
            .then(connectorResponse => {
              if (connectorResponse.status === 200) {
              //get connector originURI
             // const originURI = connectorResponse.data.hits.hits[0]._source.connector.originURI;
              
             const fconnector = [connectorResponse.data.hits.hits.find(({ _id }) => _id === connectorID)];
             fconnector.map(conn => {
                     let connector = conn._source.connector;
                     let originURI = connector.originURI;
                   //  console.log(JSON.stringify(originURI))   
              axios.get(mongodb_handlerURL + '/data/clean/connectors/' + originURI + '/resource/' + ResourceURI, tokenConfig(getState),)
                .then((ResourceURI) => {
                  console.log("cleaning Request for Resource ", JSON.stringify(ResourceURI));
                })
                .catch(err => {
                  if (err.response) {
                    dispatch(returnErrors(err.response.data, err.response.status))
                  } else {
                    dispatch(returnErrors({ msg: 'Network Error' }, 400))
                  }
                  dispatch({
                    type: DELETE_FAIL
                  })
                })
            })
         }
         })
        })
      }
    });
}

