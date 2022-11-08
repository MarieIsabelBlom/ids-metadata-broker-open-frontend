import React, { Component } from 'react';
import { connect } from 'react-redux';
import { deleteresource, deleteconnectors } from '../../actions/authActions';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
 

class DeleteResource extends Component {
  static propTypes = {
   // auth: PropTypes.object.isRequired,
    deleteresource: PropTypes.func.isRequired,
    deleteconnectors: PropTypes.func.isRequired,
    isConnector: PropTypes.bool
  }


  render() {
    const { classes } = this.props;
    return (
<Button type="submit" onClick={this.props.isConnector?this.props.deleteconnectors:this.props.deleteresource}>Delete</Button>
    )
  }
}

/*const mapStateToProps = state => ({
  auth: state.auth
});*/


export default connect(
 //mapStateToProps,
  null,
  {deleteresource, deleteconnectors}
)(DeleteResource)