import React, { Component } from 'react';
import { Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { Link } from 'react-router-dom';
import { List, ListItem } from '@material-ui/core';
import "../css/MDS.css"

class Footer extends Component {
    render() {
        return (
            <Box component="footer" className="footer" m={4}>
                <Grid container className="footer-copyright">
                    <Grid container item xs={6}  lg={3} md={3} className="footer-header">
                        <h5 style={{ fontSize: '22px', marginTop: '16px' }}>Mobility<br />Data Space</h5>
                        <p style={{ fontSize: '18px', textAlign: 'left', color: '#8F8F8F' }}>International Data Spaces</p>
                    </Grid>
                    <Grid className="footer-mail" container item xs={6} lg={3} md={3} >
                        <List>
                            <ListItem button>
                                <Link to="/imprint">Imprint</Link>
                            </ListItem>
                            <ListItem button>
                                <a href="mailto:contact@ids.fraunhofer.de">Contact</a>
                            </ListItem>
                            <ListItem button>
                                <Link to="/data-protection">Data Protection Policy</Link>
                            </ListItem>
                        </List>
                    </Grid>
                    <Grid className="footer-mail" container item xs={6} lg={3} md={3} >
                        
                    </Grid>
                    <Grid className="footer-right" item xs={6} lg={3} md={3}  >
                        <p className="modified">  Last Modified: {new Date(document.lastModified).getDate() + "." + parseInt(new Date(document.lastModified).getMonth() + 1) + "." + new Date(document.lastModified).getFullYear()}</p>
                        <a className="copyright" href="https://www.iais.fraunhofer.de/.org/">© {new Date().getFullYear()}&nbsp;Fraunhofer IAIS</a>
                    </Grid>

                </Grid>
            </Box>
        )
    }
}

export default Footer