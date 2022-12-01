import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { deleteresource, deleteconnectors, savetodb, savetodbresource } from '../../actions/authActions';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '40ch',
    },
    '& .loginButtonWrapper': {
      width: '100%',
      // marginLeft: '1ch',
      margin: theme.spacing(1)
    },
    '& .login-message': {
      color: "#B22222"
    }
  },
  button: {

    color: '#FFF', fontWeight: 'bold', borderRadius: 32,
    boxShadow: 'none',
    backgroundColor: '#666',
    '&:hover': {
      backgroundColor: '#999',
      color: '#666',
      boxShadow: 'none',
    }

  }
});

class DeleteResource extends Component {

  state = {
    reason: ''
  };

  static propTypes = {
    //auth: PropTypes.object.isRequired,
    deleteresource: PropTypes.func.isRequired,
    deleteconnectors: PropTypes.func.isRequired,
    isConnector: PropTypes.bool,
    savetodb: PropTypes.func.isRequired,
    savetodbresource: PropTypes.func.isRequired

  }

  
  state = {
    modal: false,
    username: '',
    password: '',
    msg: null
  };

  componentDidUpdate(prevProps) {
    const { error, isAuthenticated } = this.props;
    if (error !== prevProps.error) {
      // Check for login error
      if (error.id === 'LOGIN_FAIL') {
        this.setState({ msg: error.msg.msg });
      } else {
        this.setState({ msg: null });
      }
    }

    // If authenticated, close Modal
    if (this.state.modal) {
      if (isAuthenticated) {
        this.toggle();
      }
    }
  }

  toggle = () => {
    // Clear errors
    this.props.clearErrors();
    this.setState({
      modal: !this.state.modal
    });
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  }


  onSubmit = e => {
    e.preventDefault();

    const reason = this.state;
    
    //this.state = { reason: ''}

    // Attempt to Save
    this.props.isConnector?this.props.savetodb(reason):this.props.savetodbresource(reason);
    this.props.isConnector?this.props.deleteconnectors:this.props.deleteresource;
  }

  render() {
    const { classes } = this.props;
    //const  isAuthenticated  = this.props.auth;
    return (
      <Fragment>
      
      <form onSubmit={this.onSubmit}>
              <TextField
                id="outlined-basic"
                label="Reason for Deletion"
                variant="outlined"
                name="reason"
               value={this.state.reason || ''}
               onChange={this.onChange}
                required
              />         
               <div className="deleteButtonWrapper"></div>
<Button type="submit" onClick={this.props.isConnector?this.props.deleteconnectors:this.props.deleteresource}>Delete</Button>
</form>
</Fragment>
  )
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  error: state.error
});


export default connect(
 mapStateToProps,
 // null,
  {savetodb, savetodbresource, deleteresource, deleteconnectors}
)(DeleteResource)