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
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

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
    appBarOpen: {
        height: '100%',
        backgroundColor: '#FFFF00 !important',
        boxShadow: 'none'
    },
    container: {
        padding: '0 8px',
    },
    selectedContainer: {
        background: 'linear-gradient(180deg, #FFF 40%, #FF0 0)',
    },
    appBarIconDiv: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
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
            selectedIndex: -1,
            open: false
        };
    }

    static propTypes = {
        auth: PropTypes.object.isRequired,
    }

    handleListItemClick = (event, index) => {
        this.setState({
            selectedIndex: index,
            open: false
        })
    };

    handleDrawerOpen = () => {
        this.setState({
            open: true
        })
    };

    handleDrawerClose = () => {
        this.setState({
            open: false
        })
    };

    render() {
        const { isAuthenticated, user } = this.props.auth;
        const { classes } = this.props;
        const selectedIndex = this.state.selectedIndex;
        
        return (
            <AppBar position="absolute" className={clsx(classes.appBar, this.state.open ? classes.appBarOpen: classes.appBarMDS, 'appbar')}>
                <Toolbar>
                    <div className="logo-wrapper">
                        <Link style={{ textDecoration: 'none' }} className="header-logo" to="/" onClick={(event) => this.handleListItemClick(event, -1)}>
                            <img src="./MDS-Logo-black.svg" alt="Mobility Data Space" width='200px' />
                        </Link>

                        <div className="menu-button">
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={this.state.open ? this.handleDrawerClose : this.handleDrawerOpen}
                            >
                                <MenuIcon />
                            </IconButton>
                        </div>
                    </div>

                    <List className={clsx("toolbar-list", !this.state.open && "hidden")} component="nav">

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

                    <div className={classes.appBarIconDiv}>
                        <Link style={{ textDecoration: 'none' }} className={clsx(classes.searchIcon, "search-icon", !this.state.open && "hidden")} to="/" onClick={(event) => this.handleListItemClick(event, -1)}>
                            <img src="./search.svg" alt="Search" width='30px' />
                        </Link>

                        <div className={clsx("login-button", !this.state.open && "hidden")}>
                            <LoginOrLogout />
                        </div>
                    </div>

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