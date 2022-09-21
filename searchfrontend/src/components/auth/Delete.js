import React, { Component } from 'react';
import { connect } from 'react-redux';
import { deletion } from '../../actions/authActions';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
 

class Delete extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired
  }



  render() {
    const { classes } = this.props;
    return (
<Button type="submit" onClick={this.props.deletion}>Delete</Button>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  null
)(Delete)