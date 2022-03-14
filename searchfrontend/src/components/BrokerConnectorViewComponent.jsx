import React, { useState, useEffect } from "react";
import axios from 'axios';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Container, Divider } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";

import { useSelector } from 'react-redux';
import { getConnector, prepareConnectorFormat } from '../helpers/sparql/connectors';

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


export function BrokerConnectorViewComponent(props) {

    let [provider, setProvider] = useState({});
    let [connector, setConnector] = useState({});
    let [id, setId] = useState({});
    let [objCatalog, setObjCatalog] = useState([]);
    let [resourcesArray, setResourcesArray] = useState([]);
    //useEffect and useState helps in managing the states of the corresponding resource
    useEffect(() => {
        prepareResource();
    }, []); //the [] braces means to run it when the component is mounted/loaded

    let targetURI = props.es_url
    let selfURI = props.es_url
    if (typeof (targetURI) !== 'undefined' && targetURI != null) {
        if (targetURI.includes("/es")) {

            targetURI = targetURI + "/es"
        }
        else {
            selfURI = selfURI.substr(0, selfURI.length - 3)
        }
    }
    else {
        targetURI = "/es"
    }

    const token = useSelector(state => state.auth.token);

    const prepareResource = () => {
        let resourceId = decodeURIComponent(props.location.search);
        if (process.env.REACT_APP_USE_SPARQL === 'true') {
            let validResourceId;
            //extracting the connector ID
            if (resourceId !== null && resourceId !== "") {
                resourceId = resourceId.split("=")[1];
                validResourceId = resourceId;
            }
            //getting a connector based on the ID
            getConnector(token, validResourceId).then(data => {
                let connector = prepareConnectorFormat(data, validResourceId);
                setConnector(connector.connector);
                setProvider(connector.provider);
                setResourcesArray(connector.resources);
            });
        } else {
            let validResourceId;
            // The id of the resource will be appended in the url. eg.., https://<hostname>/resources/resource?id=https%3A%2F%2Fiais.fraunhofer.de%2Feis%2Fids%2FsomeBroker%2Fcatalog541260824%2F1091662930%2F1213443818
            if (resourceId !== null && resourceId !== "") {
                //split the above url to get only the resource id
                resourceId = resourceId.split("=")[1];
                // The id's of the object will contain unique paths added by the elastic search. Here in the resourceId: https://iais.fraunhofer.de/eis/ids/someBroker/catalog541260824/1091662930/1213443818, the valid resource id excludes the last path. So the valid url is: https://iais.fraunhofer.de/eis/ids/someBroker/catalog541260824/1091662930
                validResourceId = resourceId;
            }
            //find and get the respective validResourceId in Elastic search

            axios.get(targetURI + "registrations/_search?size=1000&pretty", {
                data: {
                    query: {
                        term: {
                            _id: validResourceId
                        }
                    }
                }
            })
                .then(response => {

                    if (response.status === 200) {
                        const resVal = response.data.hits.hits.find(({ _id }) => _id === validResourceId);
                        if (resVal !== null) {
                            setProvider(resVal._source.provider)
                            setConnector(resVal._source.connector)
                            setId(resVal._source._id)
                            setObjCatalog(resVal._source.catalog ? resVal._source.catalog[0] : [])
                        }


                    }
                })
                .catch(err => {
                    console.log("An error occured: " + err);
                })
        }
    }
    let resources = [];
    if (process.env.REACT_APP_USE_SPARQL === 'false') {
        resources = objCatalog.resources ? objCatalog.resources : [];
    } else {
        resources = resourcesArray;
    }

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
            {
                props.showBackButton ?
                    <IconButton aria-label="go back" size="medium" onClick={() => { props.history.goBack(); }}>
                        <ArrowBackIcon fontSize="inherit" />
                    </IconButton> : ""
            }
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
                    connector.originURI ? displayURI("Connector URI", connector.originURI, "flow-attributes") : ""
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

                                        <Link to={'/resources/resource?id=' + resource.resourceID } target="_blank">
                                            {resource.resourceID}
                                        </Link>

                                        <br /><br />
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