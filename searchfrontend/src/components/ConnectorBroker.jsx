import React, { useState, useEffect } from "react";
import {
    ReactiveList,
    MultiList
} from "@appbaseio/reactivesearch";
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Container, Divider, TextField } from "@material-ui/core";
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { useSelector } from 'react-redux';
import { getAllConnectors } from '../helpers/sparql/connectors';

import ArrowNext from '../assets/icons/arrow-next.svg'
import ArrowPrev from '../assets/icons/arrow-previous.svg'
import useExpandableFilter from "../helpers/useExpandableFilter";

//The following css styles for ExpansionPanel, ExpansionPanelSummary, and ExpansionPanelDetails are taken from https://codesandbox.io/s/52fpr
const ExpansionPanel = withStyles({
    root: {
        border: '1px solid rgba(0, 0, 0, .125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: 'auto',
        },
    },
    expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
    root: {
        backgroundColor: 'rgba(0, 0, 0, .03)',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight: 56,
        '&$expanded': {
            minHeight: 56,
        },
    },
    content: {
        '&$expanded': {
            margin: '12px 0',
        },
    },
    expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
    root: {
        display: 'inline-block',
        padding: theme.spacing(2),
    },
}))(MuiExpansionPanelDetails);

export function BrokerConnectorView(props) {

    let obj = props.connector;
    let provider = obj.provider;
    let connector = obj.connector;
    let id = obj._id;
    let objCatalog = obj.catalog ? obj.catalog[0] : [];
    let resources = objCatalog.resources ? objCatalog.resources : [];

    //function to display field/URI based on 'div' classname
    function displayField(fieldLabel, fieldVal, classVal) {
        return (
            <div className={classVal}>
                <Typography variant="body2" gutterBottom>{fieldLabel}</Typography>
                <Typography variant="h6" gutterBottom>{fieldVal}</Typography>
            </div>
        );
    }

    function displayURI(fieldLabel, fieldVal, classVal) {
        return (
            <div className={classVal}>
                <Typography variant="body2" gutterBottom>{fieldLabel}</Typography>
                <Typography variant="h6" gutterBottom><a rel="noopener noreferrer" href={`${fieldVal}`} target="_blank">{fieldVal}</a></Typography>
            </div>
        );
    }

    //convert bytes to kb, mb accordingly: https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
    function getByteSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        var k = 1024,
            decimal = 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimal)) + ' ' + sizes[i];
    }

    function displayResourceRdf(rdfVal) {
        return (
            <div id="display-rdf">
                <Typography variant="caption" display="block" gutterBottom>{rdfVal}</Typography>
            </div>
        )
    }

    const [open, setOpen] = React.useState(false);

    return (
        <div>
            <IconButton aria-label="go back" size="medium" onClick={() => props.updateCurrentConnector({})}>
                <ArrowBackIcon fontSize="inherit" />
            </IconButton>
            <Container className="connector-view">
                {
                    connector.title ?
                        <Typography variant="h4" display="block" gutterBottom>
                            {connector.title.join(", ")}
                        </Typography> : ""
                }
                {
                    connector.description ? displayField("Connector Description", connector.description.join(", "), "flow-attributes") : ""
                }
                {
                    id ? displayURI("Connector URI", connector.originURI, "flow-attributes") : ""
                }
                {
                    connector.accessUrl ? displayURI("Access URL", connector.accessUrl, "flow-attributes") : ""
                }
                {
                    provider.curator ? displayURI("Curator", provider.curator, "flow-attributes") : ""
                }
                {
                    provider.maintainer ? displayURI("Maintainer", provider.maintainer, "flow-attributes") : ""
                }
                {
                    connector.inboundModelVersions ? displayField("Inbound IDS Model Versions", connector.inboundModelVersions.join(", "), "inline-attributes") : ""
                }
                {
                    connector.outboundModelVersion ? displayField("Outbound IDS Model Version", connector.outboundModelVersion, "inline-attributes") : ""
                }
                {
                    connector.connectorVersion ? displayField("Software Version", connector.connectorVersion, "inline-attributes") : ""
                }
                {
                    connector.securityProfile ? displayField("Security Profile", connector.securityProfile, "inline-attributes") : ""
                }

                <br />
                {
                    resources.length !== 0 ?
                        <React.Fragment>
                            {resources.map(resource => (
                                <ExpansionPanel>
                                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content">
                                        {
                                            resource.title ?
                                                <Typography variant="h5" display="block" gutterBottom>{resource.title.join(", ")}</Typography>
                                                : <Typography variant="h5" display="block" gutterBottom>Unknown Resource</Typography>
                                        }
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                    {
                                                resource.originURI ? displayURI("Original ID", resource.originURI, "inline-attributes") : ""
                        }    
                                        {
                                            resource.description ? displayField("Resource Description", resource.description.join(", "), "flow-attributes") : ""
                                        }
                                        {
                                            resource.sovereign ? displayURI("Data Owner", resource.sovereign, "flow-attributes") : ""
                                        }
                                        {
                                            resource.publisher ? displayURI("Data Publisher", resource.publisher, "flow-attributes") : ""
                                        }
                                        {
                                            resource.customLicense ? displayURI("Custom License", resource.customLicense, "flow-attributes") : ""
                                        }
                                        {
                                            resource.labelStandardLicense ? displayURI("Standard License", resource.labelStandardLicense, "flow-attributes") : ""
                                        }
                                        <div className="rounded-borders">
                                            <Typography variant="body2" gutterBottom align="left">Resource Meta Data</Typography>

                                            {
                                                resource.keyword ? displayField("Keyword", resource.keyword.join(", "), "inline-attributes") : ""
                                            }

                                            {
                                                resource["mobids:DataCategory"] ? displayField("Data Category", resource["mobids:DataCategory"].join(", "), "inline-attributes") : ""
                                            }
                                            {
                                                resource["mobids:DataCategoryDetail"] ? displayField("Data Category Detail", resource["mobids:DataCategoryDetail"].join(", "), "inline-attributes") : ""
                                            }
                                            {
                                                resource["mobids:transportMode"] ? displayField("Transport Mode", resource["mobids:transportMode"].join(", "), "inline-attributes") : ""
                                            }
                                            {
                                                resource["mobids:roadNetworkCoverage"] ? displayField("Road Network Coverage", resource["mobids:roadNetworkCoverage"].join(", "), "inline-attributes") : ""
                                            }
                                            {
                                                resource["mobids:geoReferenceMethod"] ? displayField("Geo Reference Method", resource["mobids:geoReferenceMethod"].join(", "), "inline-attributes") : ""
                                            }
                                            {
                                                resource["mobids:nutsLocation"] ? displayField("NUTS Code", resource["mobids:nutsLocation"].join(", "), "inline-attributes") : ""
                                            }

                                            {
                                                resource.version ? displayField("Version", resource.version, "inline-attributes") : ""
                                            }

                                            {
                                                resource.language ? displayField("Language", resource.language.join(", "), "inline-attributes") : ""
                                            }
                                            {
                                                resource.contentType ? displayField("Content Type", resource.contentType, "inline-attributes") : ""
                                            }
                                            {
                                                resource.contentStandard ? displayURI("Content Standard", resource.contentStandard, "inline-attributes") : ""
                                            }
                                            {
                                                resource.paymentModality ? displayURI("Payment Modality", resource.paymentModality, "inline-attributes") : ""
                                            }
                                             {
                                                resource.sample ? displayURI("Sample Resource", resource.sample, "inline-attributes") : ""
                                            }

                                            {
                                                resource.temporalCoverages && resource.temporalCoverages.length !== 0 ?
                                                    <React.Fragment>
                                                        {resource.temporalCoverages.map(resTempInterval => (
                                                            resTempInterval.temporalCoverageInterval ? displayField("Temporal Coverage of the Content", `Begin: ${resTempInterval.temporalCoverageInterval.begin.split("T")[0]} End: ${resTempInterval.temporalCoverageInterval.end.split("T")[0]}`, "inline-attributes") : ""
                                                        ))
                                                        }
                                                    </React.Fragment> : ""
                                            }
                                        </div>

                                        <br />
                                        {
                                            resource.endpoints ?
                                                <div className="rounded-borders">
                                                    <Typography variant="body2" gutterBottom align="left">Resource Endpoints</Typography>
                                                    {resource.endpoints.map(endpoint => (
                                                        <React.Fragment>
                                                            {/* {
                                                                endpoint.Path ? displayField("Path", endpoint.Path, "inline-attributes") : ""
                                                            } */}
                                                            {
                                                                endpoint.inboundPath ? displayField("Inbound Path", endpoint.inboundPath, "inline-attributes") : ""
                                                            }
                                                            {
                                                                endpoint.outboundPath ? displayField("Outbound Path", endpoint.outboundPath, "inline-attributes") : ""
                                                            }
                                                            {
                                                                endpoint.endpointArtifacts ?
                                                                    <span>
                                                                        {endpoint.endpointArtifacts.map(artifact => (
                                                                            <React.Fragment>
                                                                                {
                                                                                    artifact.creation ? displayField("Created", artifact.creation.split("T")[0], "inline-attributes") : ""
                                                                                }
                                                                                {
                                                                                    artifact.bytesize ? displayField("Size", getByteSize(artifact.bytesize), "inline-attributes") : ""
                                                                                }
                                                                                {
                                                                                    artifact.filename ? displayField("File name", artifact.filename, "inline-attributes") : ""
                                                                                }
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </span> : ""
                                                            }
                                                            {
                                                                endpoint.endpointHost ?
                                                                    <span>
                                                                        {endpoint.endpointHost.map(host => (
                                                                            <React.Fragment>
                                                                                {
                                                                                    host.protocol ? displayField("Protocol", host.protocol, "inline-attributes") : ""
                                                                                }
                                                                                {
                                                                                    host.accessURL ? displayURI("URL", host.accessURL, "inline-attributes") : ""
                                                                                }
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </span> : ""
                                                            }
                                                        </React.Fragment>
                                                    ))}
                                                </div> : ""
                                        }
                                        <br />
                                        {
                                            resource.representation ?
                                                <div className="rounded-borders">
                                                    <Typography variant="body2" gutterBottom align="left">Representation</Typography>
                                                    {resource.representation.map(rep => (
                                                        <React.Fragment>
                                                            {
                                                                rep.labelMediatype ? displayField("MimeType", rep.labelMediatype, "inline-attributes") : ""
                                                            }
                                                            {
                                                                rep.representationVocab ? displayURI("Domain Vocabulary", rep.representationVocab, "inline-attributes") : ""
                                                            }
                                                            {
                                                                rep.representationStandard ? displayURI("Standard", rep.representationStandard, "inline-attributes") : ""
                                                            }
                                                            {
                                                                rep.instance ?
                                                                    <span>
                                                                        {rep.instance.map(instance => (
                                                                            <React.Fragment>
                                                                                {
                                                                                    instance.creation ? displayField("Created", instance.creation.split("T")[0], "inline-attributes") : ""
                                                                                }
                                                                                {
                                                                                    instance.bytesize ? displayField("Bytesize", getByteSize(instance.bytesize), "inline-attributes") : ""
                                                                                }
                                                                                {
                                                                                    instance.filename ? displayURI("Filename", instance.filename, "inline-attributes") : ""
                                                                                }
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </span> : ""
                                                            }
                                                        </React.Fragment>
                                                    ))}
                                                </div> : ""
                                        }
                                        <br />
                                        {
                                            resource.contract ?
                                                <div className="rounded-borders">
                                                    {resource.contract.map(contract => (
                                                        <React.Fragment>
                                                            <span>
                                                                <Typography variant="body2" gutterBottom align="left">Attached Usage Policy</Typography>
                                                                {
                                                                    contract.contractProvider ? displayURI("Provider", contract.contractProvider, "inline-attributes") : ""
                                                                }
                                                                {
                                                                    contract.contractConsumer ? displayURI("Consumer", contract.contractConsumer, "inline-attributes") : ""
                                                                }
                                                                {
                                                                    contract.contractRefersTo ? displayField("Refers to", contract.contractRefersTo, "inline-attributes") : ""
                                                                }
                                                                {
                                                                    contract.contractDate ? displayField("Date of signing", contract.contractDate.split("T")[0], "inline-attributes") : ""
                                                                }
                                                                {
                                                                    contract.contractStart ? displayField("Start date", contract.contractStart.split("T")[0], "inline-attributes") : ""
                                                                }
                                                                {
                                                                    contract.contractEnd ? displayField("End date", contract.contractEnd.split("T")[0], "inline-attributes") : ""
                                                                }
                                                                {
                                                                    contract.contractDocument && contract.contractDocument.docTitle ? displayField("Contract Title", contract.contractDocument.docTitle.join(", "), "flow-attributes") : ""
                                                                }
                                                                {
                                                                    contract.contractDocument && contract.contractDocument.docDesc ? displayField("Contract Description", contract.contractDocument.docDesc.join(", "), "flow-attributes") : ""
                                                                }
                                                            </span>
                                                            <br />
                                                            {
                                                                contract.contractObligation ?
                                                                    <span>
                                                                        {contract.contractObligation.map(oblige => (
                                                                            <React.Fragment>
                                                                                {/* {
                                                                                    oblige.dutyTitle ? displayField("Title", oblige.dutyTitle.join(", "), "flow-attributes") : ""
                                                                                }
                                                                                {
                                                                                    oblige.dutyDesc ? displayField("Description", oblige.dutyDesc.join(", "), "flow-attributes") : ""
                                                                                } */}
                                                                                {
                                                                                    oblige.dutyConstraint ?
                                                                                        <span>
                                                                                            {oblige.dutyConstraint.map(constraint => (
                                                                                                <React.Fragment>
                                                                                                    {
                                                                                                        constraint.leftOperand || constraint.operator || constraint.rightOperand ? displayField("Duty Constraint", constraint.leftOperand + " " + constraint.operator + " " + constraint.rightOperand, "flow-attributes") : ""
                                                                                                    }
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </span>
                                                                                        : ""
                                                                                }
                                                                                {
                                                                                    oblige.dutyAction ? displayField("Duty Action", oblige.dutyAction.join(", "), "inline-attributes") : ""
                                                                                }
                                                                                {
                                                                                    oblige.dutyAssignee ?
                                                                                        <span>
                                                                                            {oblige.dutyAssignee.map(assignee => (
                                                                                                <React.Fragment>
                                                                                                    {
                                                                                                        assignee.id ? displayURI("Duty Assignee", assignee.id, "inline-attributes") : ""
                                                                                                    }
                                                                                                    {/* {
                                                                                                            assignee.assigneeTitle ? displayField("Assignee Title", assignee.assigneeTitle.join(", "), "inline-attributes") : ""
                                                                                                        }
                                                                                                        {
                                                                                                            assignee.assigneeDesc ? displayField("Assignee Description", assignee.assigneeDesc.join(", "), "inline-attributes") : ""
                                                                                                        }
                                                                                                        {
                                                                                                            assignee.assigneeHomePage ? displayURI("Homepage", assignee.assigneeHomePage, "inline-attributes") : ""
                                                                                                        }
                                                                                                        {
                                                                                                            assignee.assigneeEmail ? displayURI("Email", assignee.assigneeEmail.join(", "), "inline-attributes") : ""
                                                                                                        } */}
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </span> : ""
                                                                                }
                                                                                {
                                                                                    oblige.dutyAssigner ?
                                                                                        <span>
                                                                                            {oblige.dutyAssigner.map(assigner => (
                                                                                                <React.Fragment>
                                                                                                    {
                                                                                                        assigner.id ? displayURI("Duty Assigner", assigner.id, "inline-attributes") : ""
                                                                                                    }
                                                                                                    {/* {
                                                                                                            assigner.assignerTitle ? displayField("Assigner Title", assigner.assignerTitle.join(", "), "inline-attributes") : ""
                                                                                                        }
                                                                                                        {
                                                                                                            assigner.assignerDesc ? displayField("Assigner Description", assigner.assignerDesc.join(", "), "inline-attributes") : ""
                                                                                                        }
                                                                                                        {
                                                                                                            assigner.assignerHomePage ? displayURI("Homepage", assigner.assignerHomePage, "inline-attributes") : ""
                                                                                                        }
                                                                                                        {
                                                                                                            assigner.assignerEmail ? displayURI("Email", assigner.assignerEmail.join(", "), "inline-attributes") : ""
                                                                                                        } */}
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </span> : ""
                                                                                }
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </span> : ""
                                                            }
                                                            <br />
                                                            {
                                                                contract.contractPermission ?
                                                                    <span>
                                                                        {contract.contractPermission.map(permission => (
                                                                            <React.Fragment>
                                                                                {/* {
                                                                                    permission.permissionTitle ? displayField("Title", permission.permissionTitle.join(", "), "flow-attributes") : ""
                                                                                }
                                                                                {
                                                                                    permission.permissionDesc ? displayField("Description", permission.permissionDesc.join(", "), "flow-attributes") : ""
                                                                                } */}
                                                                                {
                                                                                    permission.permissionConstraint ?
                                                                                        <span>
                                                                                            {permission.permissionConstraint.map(constraint => (
                                                                                                <React.Fragment>
                                                                                                    {
                                                                                                        constraint.leftOperand || constraint.operator || constraint.rightOperand ? displayField("Permission Constraint", constraint.leftOperand + " " + constraint.operator + " " + constraint.rightOperand, "flow-attributes") : ""
                                                                                                    }
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </span>
                                                                                        : ""
                                                                                }
                                                                                {
                                                                                    permission.permissionAction ? displayField("Permission Action", permission.permissionAction.join(", "), "inline-attributes") : ""
                                                                                }
                                                                                {
                                                                                    permission.permissionAssignee ?
                                                                                        <span>
                                                                                            {permission.permissionAssignee.map(assignee => (
                                                                                                <React.Fragment>
                                                                                                    {
                                                                                                        assignee.id ? displayURI("Permission Assignee", assignee.id, "inline-attributes") : ""
                                                                                                    }
                                                                                                    {/* {
                                                                                                        assignee.assigneeTitle ? displayField("Assignee Title", assignee.assigneeTitle.join(", "), "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assignee.assigneeDesc ? displayField("Assignee Description", assignee.assigneeDesc.join(", "), "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assignee.assigneeHomePage ? displayURI("Homepage", assignee.assigneeHomePage, "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assignee.assigneeEmail ? displayURI("Email", assignee.assigneeEmail.join(", "), "inline-attributes") : ""
                                                                                                    } */}
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </span> : ""
                                                                                }
                                                                                {
                                                                                    permission.permissionAssigner ?
                                                                                        <span>
                                                                                            {permission.permissionAssigner.map(assigner => (
                                                                                                <React.Fragment>
                                                                                                    {
                                                                                                        assigner.id ? displayURI("Permission Assigner", assigner.id, "inline-attributes") : ""
                                                                                                    }
                                                                                                    {/* {
                                                                                                        assigner.assignerTitle ? displayField("Assigner Title", assigner.assignerTitle.join(", "), "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assigner.assignerDesc ? displayField("Assigner Description", assigner.assignerDesc.join(", "), "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assigner.assignerHomePage ? displayURI("Homepage", assigner.assignerHomePage, "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assigner.assignerEmail ? displayURI("Email", assigner.assignerEmail.join(", "), "inline-attributes") : ""
                                                                                                    } */}
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </span> : ""
                                                                                }
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </span> : ""
                                                            }
                                                            <br />
                                                            {
                                                                contract.contractProhibition ?
                                                                    <span>
                                                                        {contract.contractProhibition.map(prohibit => (
                                                                            <React.Fragment>
                                                                                {/* {
                                                                                    prohibit.prohibitionTitle ? displayField("Title", prohibit.prohibitionTitle.join(", "), "flow-attributes") : ""
                                                                                }
                                                                                {
                                                                                    prohibit.prohibitionDesc ? displayField("Description", prohibit.prohibitionDesc.join(", "), "flow-attributes") : ""
                                                                                } */}
                                                                                {
                                                                                    prohibit.prohibitionConstraint ?
                                                                                        <span>
                                                                                            {prohibit.prohibitionConstraint.map(constraint => (
                                                                                                <React.Fragment>
                                                                                                    {
                                                                                                        constraint.leftOperand || constraint.operator || constraint.rightOperand ? displayField("Prohibition Constraint", constraint.leftOperand + " " + constraint.operator + " " + constraint.rightOperand, "inline-attributes") : ""
                                                                                                    }
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </span>
                                                                                        : ""
                                                                                }
                                                                                {
                                                                                    prohibit.prohibitionAction ? displayField("Prohibition Action", prohibit.prohibitionAction.join(", "), "inline-attributes") : ""
                                                                                }
                                                                                {
                                                                                    prohibit.prohibitionAssignee ?
                                                                                        <span>
                                                                                            {prohibit.prohibitionAssignee.map(assignee => (
                                                                                                <React.Fragment>
                                                                                                    {
                                                                                                        assignee.id ? displayURI("Prohibition Assignee", assignee.id, "inline-attributes") : ""
                                                                                                    }
                                                                                                    {/* {
                                                                                                        assignee.assigneeTitle ? displayField("Assignee Title", assignee.assigneeTitle.join(", "), "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assignee.assigneeDesc ? displayField("Assignee Description", assignee.assigneeDesc.join(", "), "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assignee.assigneeHomePage ? displayURI("Homepage", assignee.assigneeHomePage, "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assignee.assigneeEmail ? displayURI("Email", assignee.assigneeEmail.join(", "), "inline-attributes") : ""
                                                                                                    } */}
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </span> : ""
                                                                                }
                                                                                {
                                                                                    prohibit.prohibitionAssigner ?
                                                                                        <span>
                                                                                            {prohibit.prohibitionAssigner.map(assigner => (
                                                                                                <React.Fragment>
                                                                                                    {
                                                                                                        assigner.id ? displayURI("Prohibition Assigner", assigner.id, "inline-attributes") : ""
                                                                                                    }
                                                                                                    {/* {
                                                                                                        assigner.assignerTitle ? displayField("Assigner Title", assigner.assignerTitle.join(", "), "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assigner.assignerDesc ? displayField("Assigner Description", assigner.assignerDesc.join(", "), "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assigner.assignerHomePage ? displayURI("Homepage", assigner.assignerHomePage, "inline-attributes") : ""
                                                                                                    }
                                                                                                    {
                                                                                                        assigner.assignerEmail ? displayURI("Email", assigner.assignerEmail.join(", "), "inline-attributes") : ""
                                                                                                    } */}
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </span> : ""
                                                                                }
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </span> : ""
                                                            }
                                                        </React.Fragment>
                                                    ))}
                                                </div> : ""
                                        }
                                        <br />
                                        <Button color="primary" variant="outlined" onClick={() => { setOpen(!open); }}>
                                            Show/Hide JSON-LD
                                        </Button>
                                        <br />
                                        {
                                            open ?
                                                <div className="rounded-borders" style={{ margin: "20px" }}>
                                                    {
                                                        resource.resourceAsJsonLd ? displayResourceRdf(resource.resourceAsJsonLd) : ""
                                                    }
                                                </div>
                                                : ""
                                        }
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            ))}
                        </React.Fragment> : ""
                }
            </Container>
        </div >
    );
}

export function BrokerFilter(props) {

    useExpandableFilter()

    return (
        <React.Fragment>
            <MultiList
                componentId="list-2"
                dataField="catalog.resources.keyword.keyword"
                showSearch={false}
                title="Keyword"
                className="expandable expanded"
                URLParams={true}
            />
            <Divider />
            <MultiList
                componentId="list-3"
                dataField="catalog.resources.publisher.keyword"
                showSearch={false}
                title="Publisher"
                className="expandable"
                URLParams={true}
            />

            <Divider />
            <MultiList
                componentId="list-6"
                dataField="catalog.resources.language.keyword"
                showSearch={false}
                title="Resource Language"
                className="expandable"
                URLParams={true}
            />
            <Divider />
            <MultiList
                componentId="list-1"
                dataField="connector.securityProfile.keyword"
                showSearch={false}
                title="Connector Security Profile"
                className="expandable"
                URLParams={true}
            />
            {/* <Query /> */}
        </React.Fragment>
    )
}

export function SearchBroker(props) {


    const [connectors, setConnectors] = useState([]);
    const token = useSelector(state => state.auth.token);

    useEffect(() => {
        getAllConnectors(token).then(data => {
            setConnectors(data);
        });
    }, []);

    function handleBrokerClick(e) {
        props.updateCurrentConnector(e);
    }

    function renderBrokerData(res) {
        let objCatalog = res.catalog ? res.catalog[0] : [];
        let resources = objCatalog.resources ? objCatalog.resources[0] : null;
        let provider = res.provider;
        let connector = res.connector;
        // let type = res._type;
        return (
            <React.Fragment key={process.env.REACT_APP_USE_SPARQL === 'true' ? encodeURIComponent(connector.originURI) : encodeURIComponent(res._id)}>
                <Link to={'/connector/connector?id=' + (process.env.REACT_APP_USE_SPARQL === 'true' ? encodeURIComponent(connector.originURI) : encodeURIComponent(res._id))} >
                    <Card key={res._id} style={{ border: 'none', boxShadow: "none" }} onClick={() => handleBrokerClick(res)}>
                        <CardActionArea>
                            <CardContent className="connector-content">
                                <Typography variant="h5" component="h2">
                                    {connector.title.join(", ")}
                                </Typography>
                                <Typography variant="body2">
                                    {connector.description.join(", ")}
                                </Typography>
                                {
                                    resources && resources.description ?
                                        <div className="connector-resource connector-content-container">
                                            <Typography component="p" className="link-title">
                                                Resource Description
                                            </Typography>
                                            <Typography variant="body2" component="p">
                                                {resources.description}
                                            </Typography>
                                        </div>
                                    : ""
                                }
                                
                                <Grid container className="connector-links connector-content-container">
                                    <Grid item xs={6}>
                                        <Typography component="p" className="link-title">
                                            Curator
                                        </Typography>
                                        <Typography component="p" className="link-content">
                                            {provider.curator}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography component="p" className="link-title">
                                            Maintainer
                                        </Typography>
                                        <Typography component="p" className="link-content">
                                            {provider.maintainer}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    <Divider />
                </Link>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            {(process.env.REACT_APP_USE_SPARQL === 'true') && (
                connectors.map((connector) => (
                    renderBrokerData(connector)
                ))
            )}
            {(process.env.REACT_APP_USE_SPARQL === 'false') && (
                <ReactiveList
                    componentId="result"
                    dataField="connector.title.keyword"
                    pagination={true}
                    URLParams={true}
                    react={{
                        and: ["search", "list-1", "list-3", "list-2", "list-4", "list-6"]
                    }
                    }
                    renderItem={renderBrokerData}
                    renderResultStats={renderResultStats}
                    renderPagination={renderPagination}
                    size={4}
                    style={{
                        margin: 0
                    }}
                />
            )}
        </React.Fragment>

    )
}

export function renderPagination({pages, totalPages, currentPage, setPage, fragmentName}) {
    return <div className='pagination'>
        <Button variant='contained' 
        onClick={() => setPage(currentPage-1)}
        startIcon={<img src={ArrowPrev} height={15} width={15}/>}
        disabled={currentPage == 0} disableElevation>Previous</Button>

        <TextField defaultValue={currentPage+1} variant="outlined" 
        onChange={(e) => {
            let val = parseInt(e.target.value)
            if(val > 0 && val <= totalPages)
                setPage(val-1)
        }}
        style={{width: 50, marginRight: 12, textAlign: 'center'}} />
        of {totalPages}

        <Button variant='contained' 
        onClick={() => setPage(currentPage+1)}
        endIcon={<img src={ArrowNext} height={15} width={15}/>}
        disabled={currentPage == totalPages-1} disableElevation>Next</Button>
    </div>
}

export function renderResultStats(stats) {
    return <p className="results">{stats.numberOfResults} Results</p>
}