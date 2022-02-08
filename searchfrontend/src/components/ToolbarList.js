import React, { Component } from 'react';
import clsx from 'clsx';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { List, ListItem, Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import LoginOrLogout from './auth/LoginOrLogout';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

const styles = theme => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        boxShadow: '0 1px #ccc',
        padding: '30px 20px',
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.leavingScreen
        }),
    },
    appBarMDS: {
        background: 'none !important',
        boxShadow: 'none'
    },
    container: {
        padding: '0 8px',
    },
    selectedContainer: {
        background: 'linear-gradient(180deg, #FFF 40%, #FF0 0)',
    },
    text: {
        color: 'black !important',
        marginLeft: '24px',
        fontSize: 18,
    },
    searchIcon: {
        margin: "0 50px"
    }
})

class ToolbarList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: -1
        };
    }

    static propTypes = {
        auth: PropTypes.object.isRequired,
    }

    handleListItemClick = (event, index) => {
        this.setState({
            selectedIndex: index
        })
    };

    render() {
        const { isAuthenticated, user } = this.props.auth;
        const { classes } = this.props;
        const selectedIndex = this.state.selectedIndex;
        
        return (
            <AppBar position="absolute" className={clsx(classes.appBar, classes.appBarMDS, 'appbar')}>
                        <Toolbar>
                        <Link style={{ textDecoration: 'none', minWidth: '500px' }} to="/" onClick={(event) => this.handleListItemClick(event, -1)}>
                            <img src="./MDS-Logo-black.svg" alt="Mobility Data Space" width='200px' />
                        </Link>
            
                        <List className="toolbar-list" component="nav">
                            
                            <ListItem button selected={selectedIndex === 0} onClick={(event) => this.handleListItemClick(event, 0)}>
                                <div className={clsx(classes.container, selectedIndex === 0 && classes.selectedContainer)}>
                                    <Link to="/resources" style={{ textDecoration: 'none' }}>
                                        <Typography className={classes.text}>Resources</Typography>
                                    </Link>

                                </div>

                            </ListItem>


                            <ListItem button selected={selectedIndex === 1} onClick={(event) => this.handleListItemClick(event, 1)}>
                                <div className={clsx(classes.container, selectedIndex === 1 && classes.selectedContainer)}>
                                    <Link to="/connector" style={{ textDecoration: 'none' }}>
                                        <Typography className={classes.text}>Connectors</Typography>
                                    </Link>

                                </div>
                            </ListItem>
                                        
                                            
                            <ListItem button selected={selectedIndex === 6} onClick={(event) => this.handleListItemClick(event, 6)}>
                                <div className={clsx(classes.container, selectedIndex === 6 && classes.selectedContainer)}>
                                    <Link to="/browse" style={{ textDecoration: 'none' }}>
                                        <Typography className={classes.text}>Dashboard</Typography>
                                    </Link>

                                </div>
                            </ListItem>
                                            
                            {
                                isAuthenticated && user.role === "admin"
                                    ? <ListItem button selected={selectedIndex === 2} onClick={(event) => this.handleListItemClick(event, 2)}>
                                        <div className={clsx(classes.container, selectedIndex === 2 && classes.selectedContainer)}>
                                            <Link to="/admin" style={{ textDecoration: 'none' }}>
                                                <Typography className={classes.text}>Admin</Typography>
                                            </Link>

                                        </div>
                                    </ListItem>
                                    : ""
                            }

                            {
                                isAuthenticated && user.role === "admin"
                                    ? <ListItem button selected={selectedIndex === 3} onClick={(event) => this.handleListItemClick(event, 3)}>
                                        <div className={clsx(classes.container, selectedIndex === 3 && classes.selectedContainer)}>
                                            <Link to="/maintainer" style={{ textDecoration: 'none' }}>
                                                <Typography className={classes.text}>Maintainer</Typography>
                                            </Link>

                                        </div>
                                    </ListItem>
                                    : ""
                            }

                        </List>

                        <Link style={{ textDecoration: 'none' }} className={classes.searchIcon} to="/" onClick={(event) => this.handleListItemClick(event, -1)}>
                            <img src="./search.svg" alt="Search" width='30px' />
                        </Link>

                        <LoginOrLogout />
                    </Toolbar>
            </AppBar>
        )
    }
}
const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    null
)(withStyles(styles)(ToolbarList));