import React, { useState, useEffect } from "react";
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Container, Divider, Grid } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import Rating from '@material-ui/lab/Rating';
import Box from '@material-ui/core/Box';
import axios from 'axios';
import clsx from 'clsx';
import { useSelector } from 'react-redux';

import { mongodb_handlerURL } from '../urlConfig';

import { getResource } from '../helpers/sparql/connectors';

import '../css/ConnectorView.css'
import ArrowBack from '../assets/icons/arrow-back.svg'
import { Link } from "react-router-dom";

export function BrokerResourceView(props) {

    //useEffect and useState helps in managing the states of the corresponding resource
    useEffect(() => {
        prepareResource();
    }, []); //the [] braces means to run it when the component is mounted/loaded

    let [resource, setResource] = useState({});

    let [open, setOpen] = React.useState(false);
    let [openSecondary, setOpenSecondary] = React.useState(false);

    let targetURI = props.es_url
    let selfURI = props.es_url
    
    //uncomment when merging with master branch M.P.
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

    const ADMIN_GRAPH = "<https://broker.ids.isst.fraunhofer.de/admin>";
    const user = useSelector(state => state.auth.user);
    const token = useSelector(state => state.auth.token);

    const labels = {
        1: 'Rate with 1 star',
        2: 'Rate with 2 stars',
        3: 'Rate with 3 stars',
        4: 'Rate with 4 stars',
        5: 'Rate with 5 stars',
    };

    let [averageRatingValue, setAverageRatingValue] = useState(-1);
    let [noOfRatings, setNoOfRatings] = useState(0);
    let [myRatingValue, setMyRatingValue] = useState(-1);
    let [hover, setHover] = useState(-1);

    let [queryResult, setQueryResult] = useState();


    const BASE_SECURITY_PROFILE = "idsc:BASE_SECURITY_PROFILE";
    const TRUST_SECURITY_PROFILE = "idsc:TRUST_SECURITY_PROFILE";
    const TRUST_PLUS_SECURITY_PROFILE = "idsc:TRUST_PLUS_SECURITY_PROFILE";

    let [trustLevel, setTrustLevel] = useState("");

    useEffect(() => {
        if (Object.keys(resource).length !== 0) {
            const resourceURI = resource.resourceID;

            let TRUST_LEVEL_QUERY = `
            PREFIX ids: <https://w3id.org/idsa/core/>
            PREFIX idsc: <https://w3id.org/idsa/code/>
            SELECT ?trustLevel
            WHERE {
                GRAPH ?graph {
                    <${resourceURI}> ids:contractOffer ?offer .
                    ?offer 	ids:permission ?permission .
                    ?permission ids:constraint ?constraint .
    
                    ?constraint ids:leftOperand idsc:SECURITY_LEVEL .
                    {
                        ?constraint ids:operator idsc:GTEQ .
                    } UNION {
                    ?constraint ids:operator idsc:GT .
                    } UNION {
                    ?constraint ids:operator idsc:EQ .
                    }
                    ?constraint ids:rightOperandReference  ?trustLevel .
                }
            }`;

            let query_url = mongodb_handlerURL + '/proxy/selectQuery';

            const myHeaders = new Headers();
            myHeaders.append('Content-type', 'application/json')

            if (token) {
                myHeaders.append('x-auth-token', token)
            }

            fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: TRUST_LEVEL_QUERY })
                .then(res => {
                    if (res.ok) {
                        return res.blob();
                    } else {
                        throw new Error("An unexpected error");
                    }
                })
                .then(resBlob => {
                    const reader = new FileReader();
                    reader.readAsText(resBlob);
                    reader.addEventListener("loadend", event => {
                        const queryResult = event.srcElement.result;
                        setQueryResult({ queryResult: event.srcElement.result });
                        let trustLevel = queryResult.substr(("?trustLevel").length);
                        trustLevel = trustLevel.replace(/\n/g, "");
                        if (trustLevel !== "") {
                            if (trustLevel === BASE_SECURITY_PROFILE) {
                                setTrustLevel("BASE SECURITY PROFILE");
                            } else if (trustLevel === TRUST_SECURITY_PROFILE) {
                                setTrustLevel("TRUST SECURITY PROFILE");
                            } else if (trustLevel === TRUST_PLUS_SECURITY_PROFILE) {
                                setTrustLevel("TRUST PLUS SECURITY PROFILE");
                            }
                        } else {
                            setTrustLevel("There is no defined trust level for this resource.");
                        }
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [resource])

    useEffect(() => {
        if (Object.keys(resource).length !== 0 && user !== null) {
            const resourceURI = resource.resourceID;

            let RATING_SPARQL_QUERY = `
              PREFIX ids: <https://w3id.org/idsa/core/>
              SELECT ?ratingValue
              WHERE {
                  GRAPH ${ADMIN_GRAPH} {
                      <${resourceURI}> ids:hasRating ?rating .
                      ?rating ids:issuer "${user._id}" .
                      ?rating ids:ratingValue ?ratingValue
                  }
              }`;

            let query_url = mongodb_handlerURL + '/proxy/selectQuery';

            const myHeaders = new Headers();
            myHeaders.append('Content-type', 'application/json')

            if (token) {
                myHeaders.append('x-auth-token', token)
            }

            fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: RATING_SPARQL_QUERY })
                .then(res => {
                    if (res.ok) {
                        return res.blob();
                    } else {
                        throw new Error("An unexpected error");
                    }
                })
                .then(resBlob => {
                    const reader = new FileReader();
                    reader.readAsText(resBlob);
                    reader.addEventListener("loadend", event => {
                        const queryResult = event.srcElement.result;
                        setQueryResult({ queryResult: event.srcElement.result });
                        let ratingValue = queryResult.substr(("?ratingValue").length);
                        ratingValue = ratingValue.replace(/\n/g, "");
                        if (ratingValue !== "") {
                            setMyRatingValue(parseInt(ratingValue));
                        }
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        }

    }, [resource]);

    useEffect(() => {
        if (Object.keys(resource).length !== 0 && user !== null) {
            const resourceURI = resource.resourceID;

            let AVG_RATING_SPARQL_QUERY = `
            PREFIX ids: <https://w3id.org/idsa/core/>
            SELECT (AVG(?ratingValue) AS ?average_rating) (COUNT(?ratingValue) as ?cnt_ratings)
            WHERE {
                GRAPH ${ADMIN_GRAPH} {
                    <${resourceURI}> ids:hasRating ?rating .
                    ?rating ids:ratingValue ?ratingValue
                }
            }`;

            let query_url = mongodb_handlerURL + '/proxy/selectQuery';

            const myHeaders = new Headers();
            myHeaders.append('Content-type', 'application/json')

            if (token) {
                myHeaders.append('x-auth-token', token)
            }

            fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: AVG_RATING_SPARQL_QUERY })
                .then(res => {
                    if (res.ok) {
                        return res.blob();
                    } else {
                        throw new Error("An unexpected error");
                    }
                })
                .then(resBlob => {
                    const reader = new FileReader();
                    reader.readAsText(resBlob);
                    reader.addEventListener("loadend", event => {
                        const queryResult = event.srcElement.result;
                        setQueryResult({ queryResult: queryResult });
                        let results = queryResult.split("\n")[1];
                        let resultsValues = results.split("\t");
                        const averageRating = resultsValues[0];
                        setAverageRatingValue(parseFloat(averageRating));
                        const cntRatings = resultsValues[1];
                        setNoOfRatings(parseInt(cntRatings));
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        }

    }, [resource, myRatingValue]);

    function setNewRatingValue(newValue) {
        console.log('new rating: ', newValue);
        if (newValue) {
            //two possible scenarios:
            //1. we are inserting a rating for the first time
            //2. we are updating the rating - in that case we need to delete previous rating and then to insert the new rating
            let INSERT_QUERY = "";
            if (isNaN(myRatingValue) || myRatingValue === -1) {
                INSERT_QUERY = `
                    PREFIX ids: <https://w3id.org/idsa/core/>
                    INSERT DATA {
                    GRAPH ${ADMIN_GRAPH} {
                        <${resource.resourceID}> ids:hasRating
                        [
                          ids:issuer "${user._id}";
                          ids:ratingValue ${newValue}
                        ]
                    }
                }`;
            } else {
                INSERT_QUERY = `
                PREFIX ids: <https://w3id.org/idsa/core/>
                WITH ${ADMIN_GRAPH}
                DELETE {
                    <${resource.resourceID}> ids:hasRating ?rating .
                    ?rating ids:issuer "${user._id}" .
                    ?rating ids:ratingValue ?ratingValue
                }
                INSERT {
                    <${resource.resourceID}> ids:hasRating
                    [
                        ids:issuer "${user._id}";
                        ids:ratingValue ${newValue}
                    ]
                }
                WHERE {
                    <${resource.resourceID}> ids:hasRating ?rating .
                    ?rating ids:issuer "${user._id}" .
                    ?rating ids:ratingValue ?ratingValue
                }
                `;
            }


            let query_url = mongodb_handlerURL + '/proxyadmin/updateQuery';

            const myHeaders = new Headers();
            myHeaders.append('Content-type', 'application/json')

            if (token) {
                myHeaders.append('x-auth-token', token)
            }

            fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: INSERT_QUERY })
                .then(res => {
                    if (res.ok) {
                        return res.blob();
                    } else {
                        throw new Error("An unexpected error");
                    }
                })
                .then(resBlob => {
                    const reader = new FileReader();
                    reader.readAsText(resBlob);
                    reader.addEventListener("loadend", event => {
                        setMyRatingValue(newValue);
                        setQueryResult({ queryResult: event.srcElement.result });
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    const prepareResource = () => {
        let resourceId = decodeURIComponent(props.location.search);
        if (process.env.REACT_APP_USE_SPARQL === 'true') {
            let validResourceId;
            //extracting the resource ID
            if (resourceId !== null && resourceId !== "") {
                resourceId = resourceId.split("=")[1];
                validResourceId = resourceId;
            }
            //getting a resource based on the ID
            getResource(token, validResourceId).then(data => {
                setResource(data);
            });
        } else {
            let validResourceId;
            // The id of the resource will be appended in the url. eg.., https://<hostname>/resources/resource?id=https%3A%2F%2Fiais.fraunhofer.de%2Feis%2Fids%2FsomeBroker%2Fcatalog541260824%2F1091662930%2F1213443818
            if (resourceId !== null && resourceId !== "") {
                //split the above url to get only the resource id
                resourceId = resourceId.split("=")[1];
                // The id's of the object will contain unique paths added by the elastic search. Here in the resourceId: https://iais.fraunhofer.de/eis/ids/someBroker/catalog541260824/1091662930/1213443818, the valid resource id excludes the last path. So the valid url is: https://iais.fraunhofer.de/eis/ids/someBroker/catalog541260824/1091662930
                validResourceId = resourceId;
                console.log(validResourceId)
            }
            //find and get the respective validResourceId in Elastic search

            axios.get(targetURI + "resources/_search?pretty&size=1000", {  // .get(targetURI + "/resources/_search?size=1000&pretty", {
                data: {
                    query: {
                        term: {
                            _id: validResourceId
                        }
                    }
                }
            })
                .then(response => {
                    console.log(response)

                    if (response.status === 200) {
                        const resVal = response.data.hits.hits.find(({ _id }) => _id === validResourceId);


                        if (resVal !== null)
                            setResource(resVal._source)
                    }
                })
                .catch(err => {
                    console.log("An error occured: " + err);
                })
        }
    }


    let resource_title = resource.mainTitle || resource.title_en || resource.title || resource.title_de;
    let resource_description = resource.description_en || resource.description_de || resource.description;

    //function to display field/URI based on 'div' classname
    function displayField(fieldLabel, fieldVal, col, className) {
        return (
            <Grid item md={col} xs={12} className={className}>
                <Typography className="attr-title" variant="body2" gutterBottom>{fieldLabel}</Typography>
                <Typography className="attr-content" gutterBottom>{fieldVal}</Typography>
            </Grid>
        );
    }

    function displayURI(fieldLabel, fieldVal, col) {
        return (
            <Grid item md={col} xs={12}>
                <Typography className="attr-title" variant="body2" gutterBottom>{fieldLabel}</Typography>
                <Typography className="attr-content" gutterBottom><a rel="noopener noreferrer" href={`${fieldVal}`} target="_blank">{fieldVal}</a></Typography>
            </Grid>
        );
    }

    function displayRefURI(fieldLabel, fieldVal, col) {
        let absoluteUriPart = "" // use relative path for now

        return (
            <Grid item md={col} xs={12}>
                <Typography className="attr-title" variant="body2" gutterBottom>{fieldLabel}</Typography>
                <Typography className="attr-content" gutterBottom><a rel="noopener noreferrer" href={`${absoluteUriPart}/connector/connector?id=${fieldVal}`} target="_self">{fieldVal}</a></Typography>
            </Grid>
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

    /*
    The following properties may exist or may not.
    But, for an unkown reason, if they exist, they are an array containing only one item (object).

    - resource.contract
    - resource.contract[0].contractPermission
    - resource.representation
    */

    function firstArrayItem(arr, prop) {
        if(!arr || arr.length < 1)
            return undefined
        else if (!prop)
            return arr[0]
        else if (!arr[0].hasOwnProperty(prop))
            return undefined

        return arr[0][prop]
    }

    let firstContract = firstArrayItem(resource.contract)
    let permissionAction = firstContract ? firstArrayItem(firstContract.contractPermission, 'permissionAction') : ""
    let representationStandard = firstArrayItem(resource.representation, 'representationStandard')

    return (
        <div>
            <Container className="resource-view">
                {
                    props.showBackButton ?
                        <Link to="/resources"><IconButton aria-label="go back" 
                            style={{
                                color: "black",
                                padding: 0,
                                marginBottom: 10
                            }}
                            size="medium">
                            <img src={ArrowBack} alt="Back" width="25" />
                        </IconButton></Link> : ""
                }
                <Typography className="connector-title" variant="h4" component="h1" display="block" gutterBottom>
                    {resource_title ? resource_title : "Unknown Resource"}
                </Typography>
                <div>
                    <Grid container className="main-container">
                        {
                            resource.description ? displayField("Description", resource.description.join(", "), 12, "attr-description") : ""
                        }
                        {
                            resource.originURI ? displayURI("Original ID", resource.originURI, 12) : ""
                        }
                        {
                            resource.connectorID ? displayRefURI("Internal Connector ID", resource.connectorID, 12) : ""
                        }
                    </Grid>

                    <Grid container className="rounded-borders">
                        {
                            resource.sovereign ? displayURI("Data Owner", resource.sovereign, 6) : ""
                        }
                        {
                            resource.keyword ? displayField("Keywords", resource.keyword.join(", "), 6) : ""
                        }
                        {
                            resource.publisher ? displayURI("Data Publisher", resource.publisher, 6) : ""
                        }
                        {
                            firstContract && firstContract.contractEnd ? displayField("Expiry date", firstContract.contractEnd.split("T")[0], 6) : ""
                        }
                        {
                            resource["mobids:DataCategory"] ? displayField("Data Category", resource["mobids:DataCategory"].join(", "), 6) : ""
                        }
                        {
                            permissionAction ? displayField("Permission Action", permissionAction.join(", "), 6) : ""
                        }
                        {
                            /*
                            resource.labelStandardLicense ? displayURI("Standard License", resource.labelStandardLicense, 3) : ""
                            */
                        }
                    </Grid>

                    <Button className={clsx("expandButton", openSecondary && "expanded")} variant="contained" onClick={() => { setOpenSecondary(!openSecondary); }}>
                        {openSecondary ? "Show less" : "Show more"}
                    </Button>
                    {openSecondary ? <div className="secondaryView">
                        <Typography className="secondary-subtitle" variant="body2" gutterBottom align="left">Resource Meta Data</Typography>
                        <Grid container>      
                            {
                                resource.language ? displayField("Language", resource.language.join(", "), 4) : ""
                            }                                                  
                            { displayField("Trust level", trustLevel, 4) }
                            {
                                resource.version ? displayField("Version", resource.version, 4) : ""
                            }
                            { displayField("Data Model", "TODO", 4) }
                            {
                                resource["mobids:transportMode"] ? displayField("Transport Mode", resource["mobids:transportMode"].join(", "), 3) : ""
                            }
                            {
                                resource["mobids:geoReferenceMethod"] ? displayField("Geo Reference Method", resource["mobids:geoReferenceMethod"].join(", "), 4) : ""
                            }
                            {
                                 /*
                                resource.contentStandard ? displayURI("Content Standard", resource.contentStandard, 4) : ""
                                 */
                            }
                            {
                                representationStandard ? displayURI("Standard", representationStandard , 6) : ""
                            }
                        </Grid>
                        
                        {/*<div className="rounded-borders">
                            
                            {
                                resource["mobids:DataCategoryDetail"] ? displayField("Data Category Detail", resource["mobids:DataCategoryDetail"].join(", "), 3) : ""
                            }
                            {
                                resource["mobids:roadNetworkCoverage"] ? displayField("Road Network Coverage", resource["mobids:roadNetworkCoverage"].join(", "), 3) : ""
                            }
                            
                            {
                                resource["mobids:nutsLocation"] ? displayField("NUTS Code", resource["mobids:nutsLocation"].join(", "), 3) : ""
                            }
                    
                            {
                                resource.contentType ? displayField("Content Type", resource.contentType, 3) : ""
                            }
                            {
                                resource.paymentModality ? displayURI("Payment Modality", resource.paymentModality, 3) : ""
                            }
                            {
                                resource.sample ? displayURI("Sample Resource", resource.sample, 3) : ""
                            }
                            {
                                resource.temporalCoverages && resource.temporalCoverages.length !== 0 ?
                                    <React.Fragment>
                                        {resource.temporalCoverages.map(resTempInterval => (
                                            resTempInterval.temporalCoverageInterval ? displayField("Temporal Coverage of the Content", `Begin: ${resTempInterval.temporalCoverageInterval.begin.split("T")[0]} End: ${resTempInterval.temporalCoverageInterval.end.split("T")[0]}`, 3) : ""
                                        ))
                                        }
                                    </React.Fragment> : ""
                            }
                        </div>*/}
                        
                        {
                            resource.representation ?
                                <div className="rounded-borders">
                                    <Typography className="secondary-subtitle" variant="body2" gutterBottom align="left">Representation</Typography>
                                    {resource.representation.map(rep => (
                                        <Grid container>
                                            {
                                                rep.instance ?
                                                    rep.instance.map(instance => (
                                                            <React.Fragment>
                                                                {
                                                                    instance.filename ? displayURI("File Name", instance.filename, 12) : ""
                                                                }
                                                                {
                                                                    instance.creation ? displayField("Created", instance.creation.split("T")[0], 4) : ""
                                                                }
                                                                {
                                                                    instance.bytesize ? displayField("File Size", getByteSize(instance.bytesize), 4) : ""
                                                                }
                                                            </React.Fragment>
                                                        )) : ""
                                            }
                                            {
                                                rep.labelMediatype ? displayField("MimeType", rep.labelMediatype, 4) : ""
                                            }
                                            {/*
                                                rep.representationVocab ? displayURI("Domain Vocabulary", rep.representationVocab, 4) : ""
                                            */}
                                        </Grid>
                                    ))}
                                </div> : ""
                        }

                        {/*user !== null && (
                            <div className="rounded-borders">
                                <Typography variant="body2" gutterBottom align="left">Average rating</Typography>
                                <Rating
                                    name="simple-controlled"
                                    value={averageRatingValue}
                                    precision={0.05}
                                    readOnly
                                />
                                <Typography variant="body2" gutterBottom align="left">(based on {noOfRatings} ratings)</Typography>

                                <Typography variant="body2" gutterBottom align="left">My rating</Typography>
                                <Rating
                                    name="simple-controlled"
                                    value={myRatingValue}
                                    onChange={(event, newValue) => {
                                        setNewRatingValue(newValue);
                                    }}
                                    onChangeActive={(event, newHover) => {
                                        setHover(newHover);
                                    }}
                                />
                                {averageRatingValue !== null && <Box ml={2}>{labels[hover !== -1 ? hover : '']}</Box>}
                            </div>
                                )*/}

                        {/*
                            resource.endpoints ?
                                <div className="rounded-borders">
                                    <Typography variant="body2" gutterBottom align="left">Resource Endpoints</Typography>
                                    {resource.endpoints.map(endpoint => (
                                        <React.Fragment>
                                            {/* {
                                                                endpoint.Path ? displayField("Path", endpoint.Path, 3) : ""
                                                            } */}
                                            {/*
                                                endpoint.inboundPath ? displayField("Inbound Path", endpoint.inboundPath, 3) : ""
                                            }
                                            {
                                                endpoint.outboundPath ? displayField("Outbound Path", endpoint.outboundPath, 3) : ""
                                            }
                                            {
                                                endpoint.endpointArtifacts ?
                                                    <span>
                                                        {endpoint.endpointArtifacts.map(artifact => (
                                                            <React.Fragment>
                                                                {
                                                                    artifact.creation ? displayField("Created", artifact.creation.split("T")[0], 3) : ""
                                                                }
                                                                {
                                                                    artifact.bytesize ? displayField("Size", getByteSize(artifact.bytesize), 3) : ""
                                                                }
                                                                {
                                                                    artifact.filename ? displayField("File name", artifact.filename, 3) : ""
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
                                                                    host.protocol ? displayField("Protocol", host.protocol, 3) : ""
                                                                }
                                                                {
                                                                    host.accessURL ? displayURI("URL", host.accessURL, 3) : ""
                                                                }
                                                            </React.Fragment>
                                                        ))}
                                                    </span> : ""
                                            }
                                            <Divider />
                                        </React.Fragment>
                                    ))}
                                </div> : ""
                                        */}

                        {
                            resource.contract ?
                                <div className="rounded-borders">
                                    {resource.contract.map(contract => (
                                        <React.Fragment>
                                            <Typography variant="body2" gutterBottom align="left">Attached Usage Policy</Typography>
                                            <Grid container>
                                                {
                                                    contract.contractProvider ? displayURI("Provider", contract.contractProvider, 12) : ""
                                                }
                                                {/*
                                                    contract.contractConsumer ? displayURI("Consumer", contract.contractConsumer, 3) : ""
                                                */}
                                                {/*
                                                    contract.contractRefersTo ? displayField("Refers to", contract.contractRefersTo, 3) : ""
                                                */}
                                                {
                                                    contract.contractDate ? displayField("Date of signing", contract.contractDate.split("T")[0], 4) : ""
                                                }
                                                {
                                                    contract.contractStart ? displayField("Start date", contract.contractStart.split("T")[0], 4) : ""
                                                }
                                                {
                                                    contract.contractEnd ? displayField("End date", contract.contractEnd.split("T")[0], 4) : ""
                                                }
                                                {/*
                                                    contract.contractDocument && contract.contractDocument.docTitle ? displayField("Contract Title", contract.contractDocument.docTitle.join(", "), "flow-attributes") : ""
                                                }
                                                {
                                                    contract.contractDocument && contract.contractDocument.docDesc ? displayField("Contract Description", contract.contractDocument.docDesc.join(", "), "flow-attributes") : ""
                                                */}
                                            </Grid>
                                            {/*
                                                contract.contractObligation ?
                                                    <span>
                                                        {contract.contractObligation.map(oblige => (
                                                            <React.Fragment>
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
                                                                    oblige.dutyAction ? displayField("Duty Action", oblige.dutyAction.join(", "), 3) : ""
                                                                }
                                                            </React.Fragment>
                                                        ))}
                                                    </span> : ""
                                                            */}
                                            {/*
                                                contract.contractPermission ?
                                                    <span>
                                                        {contract.contractPermission.map(permission => (
                                                            <React.Fragment>
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
                                                                    permission.permissionAction ? displayField("Permission Action", permission.permissionAction.join(", "), 3) : ""
                                                                }
                                                            </React.Fragment>
                                                        ))}
                                                    </span> : ""
                                            */}
                                            {/*
                                                contract.contractProhibition ?
                                                    <span>
                                                        {contract.contractProhibition.map(prohibit => (
                                                            <React.Fragment>
                                                                {
                                                                    prohibit.prohibitionConstraint ?
                                                                        <span>
                                                                            {prohibit.prohibitionConstraint.map(constraint => (
                                                                                <React.Fragment>
                                                                                    {
                                                                                        constraint.leftOperand || constraint.operator || constraint.rightOperand ? displayField("Prohibition Constraint", constraint.leftOperand + " " + constraint.operator + " " + constraint.rightOperand, "flow-attributes") : ""
                                                                                    }
                                                                                </React.Fragment>
                                                                            ))}
                                                                        </span>
                                                                        : ""
                                                                }
                                                                {
                                                                    prohibit.prohibitionAction ? displayField("Prohibition Action", prohibit.prohibitionAction.join(", "), 3) : ""
                                                                }
                                                            </React.Fragment>
                                                        ))}
                                                    </span> : ""
                                                            */}
                                        </React.Fragment>
                                    ))}
                                </div> : ""
                        }
                    </div> : ""}
                    <Button className={clsx("expandButton", open && "expanded")} variant="contained" 
                    onClick={() => { setOpen(!open); }}>
                        {open ? "Hide JSON-LD" : "Show JSON-LD"}
                    </Button>
                    {
                        open ?
                            <div style={{ margin: "20px" }}>
                                {
                                    resource.resourceAsJsonLd ? displayResourceRdf(resource.resourceAsJsonLd) : ""
                                }
                            </div>
                            : ""
                    }
                </div>
                <br />

                <br />

            </Container>
        </div>
    );
}
