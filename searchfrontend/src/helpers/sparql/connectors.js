

import { mongodb_handlerURL } from '../../urlConfig';

//namespaces
const IDS_PREFIX = '<https://w3id.org/idsa/core/';
const IDSC_PREFIX = '<https://w3id.org/idsa/code/';
const OWL_PREFIX = '<http://www.w3.org/2002/07/owl#';

const RESOURCE_CATALOG_URI = "<https://w3id.org/idsa/core/resourceCatalog>";
const OFFERED_RESOURCE_URI = "<https://w3id.org/idsa/core/offeredResource>";

//security profiles: TODO: change real values
const BASE_SECURITY_PROFILE = "BASE_CONNECTOR_SECURITY_PROFILE";
const TRUST_SECURITY_PROFILE = "TRUST_CONNECTOR_SECURITY_PROFILE";
const TRUST_PLUS_SECURITY_PROFILE = "TRUST_PLUS_CONNECTOR_SECURITY_PROFILE";

const CONNECTOR_PROPERTIES = [
    "title",
    "description",
    "originURI",
    "securityProfile",
    "outboundModelVersion",
    "originURI",
    "lastChanged",
    "inboundModelVersions",
    "connectorLocation"
];

const CONNECTOR_ARRAY_PROPERTIES = [
    "title",
    "description",
    "inboundModelVersions"
];

const PROVIDER_PROPERTIES = [
    "curator",
    "maintainer"
];

//based on the BrokerConnectorViewComponent visualization - mobids missing
const RESOURCE_PROPERTIES = [
    "title", //array of strings
    "description", //array of strings
    "originURI",
    "sovereign",
    "publisher",
    "labelStandardLicence",
    "keyword", //array of strings
    "version",
    "language", // array of strings
    "contentType",
    "contentStandard",
    "paymentModality",
    "sample",
    "temporalCoverage", //array of objects
    "endpoints", //array of objects
    "representation", //array of objects
    "contract", // array of objects
    "resourceAsJsonLd"

];

const RESOURCE_ARRAY_STRINGS_PROPERTIES = [
    "title",
    "description",
    "keyword",
    "language"
];

const RESOURCE_ARRAY_OBJECTS_PROPERTIES = [
    "temporalCoverage",
    "endpoints",
    "representation",
    "contract"
]

//temporal coverage object properties
const TEMPORAL_COVERAGE_PROPERTIES = [
    "begin",
    "end"
];

const TEMPORAL_COVERAGE_OBJECT_PROPERTIES = [
    "begin",
    "end"
];

//for both begin and end
const INSTANT_PROPERTIES = [
    "dateTime"
];

//endpoint properties
const ENDPOINT_PROPERTIES = [
    "inboundPath",
    "outboundPath",
    "endpointArtifact",
    "endpointHost"
];

const ENDPOINT_ARRAY_OBJECTS_PROPERTIES = [
    "endpointArtifact",
    "endpointHost"
]


const ENDPOINT_ARTIFACT_PROPERTIES = [
    "creation",
    "bytesize",
    "filename"
];

const ENDPOINT_HOST_PROPERTIES = [
    "protocol",
    "accessURL"
];

const REPRESENTATION_PROPERTIES = [
    "labelMediatype",
    "representationVocab",
    "representationStandard",
    "instance"
];

const REPRESENTATION_ARRAY_OBJECTS_PROPERTIES = [
    "instance"
]

const INSTANCE_PROPERTIES = [
    "creation",
    "bytesize",
    "filename"
];

const CONTRACT_PROPERTIES = [
    "contractProvider",
    "contractConsumer",
    "contractRefersTo",
    "contractDate",
    "contractStart",
    "contractEnd",
    "contractDocument",
    "contractObligation",
    "contractPermission",
    "contractProhibition"
];

const CONTRACT_ARRAY_OBJECTS_PROPERTIES = [
    "contractObligation",
    "contractPermission",
    "contractProhibition"
]

const CONTRACT_OBJECT_PROPERTIES = [
    "contractDocument"
]

const CONTRACT_GENERIC_PROPERTIES = [
    "constraint", // array of objects
    "action", //array of strings
    "assignee", // array of objects
    "assigner" // array of objects
]

const CONTRACT_CONSTRAINT_PROPERTIES = [
    "leftOperand",
    "operator",
    "rightOperand"
];

const CONTRACT_ASSIGNEE_PROPERTIES = [
    "id"
];

const CONTRACT_ASSIGNER_PROPERTIES = [
    "id"
]

const CONTRACT_DOCUMENT_PROPERTIES = [
    "docTitle",
    "docDesc"
];

export const getConnectors = (token) => {
    let GET_CONNECTORS = `
        PREFIX ids: <https://w3id.org/idsa/core/>
        PREFIX idsc: <https://w3id.org/idsa/code/>
        SELECT ?connector ?title ?description ?securityProfile ?inboundModelVersion ?outboundModelVersion
        WHERE {
            GRAPH ?graph {
                ?connector a ids:BaseConnector .
                ?connector ids:title ?title . 
                ?connector ids:description ?description .
                ?connector ids:securityProfile ?securityProfile .
                ?connector ids:inboundModelVersion ?inboundModelVersion .
                ?connector ids:outboundModelVersion ?outboundModelVersion
            }
        }`;

    let query_url = mongodb_handlerURL + '/proxy/selectQuery';

    const myHeaders = new Headers();
    myHeaders.append('Content-type', 'application/json')

    if (token) {
        myHeaders.append('x-auth-token', token)
    }

    fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: GET_CONNECTORS })
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
                prepareConnectorsFormat(queryResult);
            });
        })
        .catch(error => {
            console.log(error);
        });
}

export const getAllConnectors = (token) => {
    let GET_ALL_CONNECTORS = `
    PREFIX ids: <https://w3id.org/idsa/core/>
    PREFIX idsc: <https://w3id.org/idsa/code/>
    SELECT ?connector ?predicate ?object
    WHERE {
        GRAPH ?graph {
            ?connector a ids:BaseConnector .
            ?connector ?predicate ?object
        }
    }`;

    let query_url = mongodb_handlerURL + '/proxy/selectQuery';

    const myHeaders = new Headers();
    myHeaders.append('Content-type', 'application/json')

    if (token) {
        myHeaders.append('x-auth-token', token)
    }

    return fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: GET_ALL_CONNECTORS })
        .then(res => {
            if (res.ok) {
                return res.blob();
            } else {
                throw new Error("An unexpected error");
            }
        })
        .then(resBlob => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsText(resBlob);
                reader.addEventListener("loadend", event => {
                    const queryResult = event.srcElement.result;
                    let connectorsObject = prepareConnectorsObject(queryResult);
                    let connectorsArray = prepareConnectorsFormat(connectorsObject);
                    resolve(connectorsArray);
                });
            })
        })
        .catch(error => {
            console.log(error);
        });
}

export const prepareConnectorsObject = (queryResult) => {
    let connectors = {};
    let queryResultByLines = queryResult.split(/\n/);
    for (let i = 1; i < queryResultByLines.length - 1; i++) {
        // line is an array of three elements - connector, predicate, object
        let line = queryResultByLines[i].split(/\t/);
        let connector = line[0];
        let predicate = line[1];
        let object = line[2];
        let value = {};
        if (!(connector in connectors)) {
            value[predicate] = object;
            value["originURI"] = connector;
        } else {
            value = connectors[connector];
            value[predicate] = object;
        }
        connectors[connector] = value;
    }
    console.log(connectors);
    return connectors;
}

const prepareConnectorsFormat = (connectors) => {
    let connectorsArray = [];
    let i = 0;
    for (const connector in connectors) {
        let connectorProperties = connectors[connector];
        let j = 0;
        for (const property in connectorProperties) {
            //initialize connectorsArray[i]
            if (j === 0) {
                connectorsArray[i] = {
                    connector: {},
                    provider: {},
                    resources: []
                }
            }

            //get value for a property
            let value = connectorProperties[property];
            value = formatValue(value);

            // for now, we will process only properties that are from IDS namespace. M.P.
            if (property.startsWith(IDS_PREFIX)) {
                let new_property = property.substr(IDS_PREFIX.length);
                new_property = new_property.substr(0, new_property.length - 1);
                if (CONNECTOR_PROPERTIES.includes(new_property)) {
                    if (CONNECTOR_ARRAY_PROPERTIES.includes(new_property)) {
                        if (!(new_property in connectorsArray[i]["connector"])) {
                            connectorsArray[i]["connector"][new_property] = [];
                        }
                        connectorsArray[i]["connector"][new_property].push(value);
                    } else {
                        connectorsArray[i]["connector"][new_property] = value;
                    }
                } else if (PROVIDER_PROPERTIES.includes(new_property)) {
                    connectorsArray[i]["provider"][new_property] = value;
                } else if (new_property in RESOURCE_PROPERTIES) {
                    //TODO
                }
            } else if (property === 'originURI') {
                connectorsArray[i]["connector"][property] = value;
            }
            j++;
        }
        i++;
    }
    console.log(connectorsArray);
    return connectorsArray;
}

export const getConnector = (token, id) => {
    let GET_CONNECTOR = `
    PREFIX ids: <https://w3id.org/idsa/core/>
    PREFIX idsc: <https://w3id.org/idsa/code/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    SELECT *
    WHERE {
        GRAPH <${id}> {
            ?subject ?predicate ?object
        }
    }`;

    let query_url = mongodb_handlerURL + '/proxy/selectQuery';

    const myHeaders = new Headers();
    myHeaders.append('Content-type', 'application/json')

    if (token) {
        myHeaders.append('x-auth-token', token)
    }

    return fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: GET_CONNECTOR })
        .then(res => {
            if (res.ok) {
                return res.blob();
            } else {
                throw new Error("An unexpected error");
            }
        })
        .then(resBlob => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsText(resBlob);
                reader.addEventListener("loadend", event => {
                    const queryResult = event.srcElement.result;
                    resolve(queryResult);
                });
            })
        })
        .catch(error => {
            console.log(error);
        });
}

//from a query result in string form prepare a connector object
const prepareConnectorObject = (queryResult) => {
    let connector = {};
    let queryResultByLines = queryResult.split(/\n/);
    for (let i = 1; i < queryResultByLines.length - 1; i++) {
        // line is an array of three elements - subject, predicate, object
        let line = queryResultByLines[i].split(/\t/);
        let subject = line[0];
        let predicate = line[1];
        let object = line[2];
        let value = {};
        if (!(subject in connector)) {
            value[predicate] = [];
            value[predicate].push(object);
            //TODO
            value["originURI"] = [];
            value["originURI"].push(subject);
        } else {
            value = connector[subject];
            if (!(predicate in value)) {
                value[predicate] = [];
            }
            value[predicate].push(object);
        }
        connector[subject] = value;
    }
    return connector;
}

//transforming a Security Profile in a string
const prepareSecurityProfileValue = (value) => {
    let idsc_prefix = IDSC_PREFIX.slice(1);
    if (value === (idsc_prefix + BASE_SECURITY_PROFILE)) {
        value = "Base security profile"
    } else if (value === (idsc_prefix + TRUST_SECURITY_PROFILE)) {
        value = "Trust security profile";
    } else if (value === (idsc_prefix + TRUST_PLUS_SECURITY_PROFILE)) {
        value = "Trust plus security profile";
    }
    return value;
}

//checking if a value is an URI / check for double quotes
const formatValue = (value) => {
    if (value[0] === '<' && value[value.length - 1] === '>') {
        value = value.slice(1, value.length - 1);
    } else if (value[0] === '"' && value[value.length - 1] === '"') {
        value = value.slice(1, value.length - 1);
    }
    return value;
}

const formatValues = (values) => {
    let formattedValues = [];
    for (let i = 0; i < values.length; i++) {
        formattedValues.push(formatValue(values[i]));
    }
    return formattedValues;
}

const getConnectorAndProvider = (connectorProperties, connector) => {
    for (const property in connectorProperties) {
        // values is an array, usually it will contain only one value but when we have multiple objects for the same predicate then we will have arrays with multiple values
        let values = connectorProperties[property];
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            value = formatValue(value);
            // for now, we will process only properties that are from IDS namespace. M.P. + originURI
            if (property.startsWith(IDS_PREFIX)) {
                let new_property = property.substr(IDS_PREFIX.length);
                new_property = new_property.substr(0, new_property.length - 1);
                if (new_property === 'inboundModelVersion') {
                    new_property = 'inboundModelVersions';
                }
                //a check whether a property belongs to CONNECTOR_PROPERTIES | PROVIDER_PROPERTIES | RESOURCE_PROPERTIES 
                if (CONNECTOR_PROPERTIES.includes(new_property)) {
                    if (CONNECTOR_ARRAY_PROPERTIES.includes(new_property)) {
                        if (!(new_property in connector["connector"])) {
                            connector["connector"][new_property] = [];
                        }
                        connector["connector"][new_property].push(value);
                    } else {
                        if (new_property === 'securityProfile') {
                            value = prepareSecurityProfileValue(value);
                        }
                        connector["connector"][new_property] = value;
                    }
                } else if (PROVIDER_PROPERTIES.includes(new_property)) {
                    connector["provider"][new_property] = value;
                }
            } else if (property === 'originURI') {
                connector["connector"][property] = value;
            }
        }
    }
    return connector;
}



const setTemporalCoverages = (connectorObject, resource, temporalCoverages) => {
    resource.temporalCoverages = [];
    for (let i = 0; i < temporalCoverages.length; i++) {
        let temporalCoverage = connectorObject[temporalCoverages[i]];
        for (const property in temporalCoverage) {
            let value = temporalCoverage[property];
            if (property.startsWith(IDS_PREFIX)) {
                let new_property = property.substr(IDS_PREFIX.length);
                new_property = new_property.substr(0, new_property.length - 1);
                if (!resource.temporalCoverages[i]) {
                    resource.temporalCoverages[i] = {
                        "temporalCoverageInterval": {}
                    };
                }
                if (TEMPORAL_COVERAGE_PROPERTIES.includes(new_property)) {
                    if (TEMPORAL_COVERAGE_OBJECT_PROPERTIES.includes(new_property)) {
                        //begin/end
                        let timeInterval = connectorObject[value];
                        for (const timeIntervalProperty in timeInterval) {
                            let timeIntervalValue = timeInterval[timeIntervalProperty];
                            if (timeIntervalProperty.startsWith(IDS_PREFIX)) {
                                let new_timeIntervalProperty = timeIntervalProperty.substr(IDS_PREFIX.length);
                                new_timeIntervalProperty = new_timeIntervalProperty.substr(0, new_timeIntervalProperty.length - 1);
                                if (INSTANT_PROPERTIES.includes(new_timeIntervalProperty)) {
                                    //string value
                                    resource.temporalCoverages[i]["temporalCoverageInterval"][new_property] = formatValue(timeIntervalValue[0]);
                                }
                            }
                        }
                    } else {
                        //string value
                        resource.temporalCoverages[i][new_property] = formatValue(value[0]);
                    }
                }
            }
        }
    }
}

const setRepresentations = (connectorObject, resource, representations) => {
    resource.representation = [];
    for (let i = 0; i < representations.length; i++) {
        let representation = connectorObject[representations[i]];
        for (const property in representation) {
            let value = representation[property];
            if (property.startsWith(IDS_PREFIX)) {
                let new_property = property.substr(IDS_PREFIX.length);
                new_property = new_property.substr(0, new_property.length - 1);
                if (!resource.representation[i]) {
                    resource.representation[i] = {
                        instance: []
                    };
                }
                if (new_property === 'mediaType') {
                    new_property = 'labelMediatype';
                }
                if (REPRESENTATION_PROPERTIES.includes(new_property)) {
                    if (REPRESENTATION_ARRAY_OBJECTS_PROPERTIES.includes(new_property)) {
                        //instance 
                        let instances = value;
                        for (let j = 0; j < instances.length; j++) {
                            let instance = connectorObject[instances[j]];
                            for (const instanceProperty in instance) {
                                let instanceValue = instance[instanceProperty];
                                if (instanceProperty.startsWith(IDS_PREFIX)) {
                                    let new_instanceProperty = instanceProperty.substr(IDS_PREFIX.length);
                                    new_instanceProperty = new_instanceProperty.substr(0, new_instanceProperty.length - 1);
                                    if (!resource.representation[i].instance[j]) {
                                        resource.representation[i].instance[j] = [];
                                    }
                                    if (new_instanceProperty === 'byteSize') {
                                        new_instanceProperty = 'bytesize';
                                    } else if (new_instanceProperty === 'creationDate') {
                                        new_instanceProperty = 'creation'
                                    } else if (new_instanceProperty === 'fileName') {
                                        new_instanceProperty = 'filename';
                                    }
                                    if (INSTANCE_PROPERTIES.includes(new_instanceProperty)) {
                                        //string value
                                        resource.representation[i].instance[j][new_instanceProperty] = formatValue(instanceValue[0]);
                                    }
                                }
                            }
                        }
                    } else {
                        //string value
                        resource.representation[i][new_property] = formatValue(value[0]);
                    }
                }
            }
        }
    }
}

const setEndpoints = (connectorObject, resource, endpoints) => {
    resource.endpoints = [];
    for (let i = 0; i < endpoints.length; i++) {
        let endpoint = connectorObject[endpoints[i]];
        for (const property in endpoint) {
            let value = endpoint[property];
            if (property.startsWith(IDS_PREFIX)) {
                let new_property = property.substr(IDS_PREFIX.length);
                new_property = new_property.substr(0, new_property.length - 1);
                if (!resource.endpoints[i]) {
                    resource.endpoints[i] = {
                        endpointArtifacts: [],
                        endpointHost: []
                    };
                }
                if (ENDPOINT_PROPERTIES.includes(new_property)) {
                    if (ENDPOINT_ARRAY_OBJECTS_PROPERTIES.includes(new_property)) {
                        if (new_property === 'endpointArtifact') {
                            let endpointArtifacts = value;
                            for (let j = 0; j < endpointArtifacts.length; j++) {
                                let endpointArtifact = connectorObject[endpointArtifacts[j]];
                                for (const endpointArtifactProperty in endpointArtifact) {
                                    let endpointArtifactValue = endpointArtifact[endpointArtifactProperty];
                                    if (endpointArtifactProperty.startsWith(IDS_PREFIX)) {
                                        let new_endpointArtifactProperty = endpointArtifactProperty.substr(IDS_PREFIX.length);
                                        new_endpointArtifactProperty = new_endpointArtifactProperty.substr(0, new_endpointArtifactProperty.length - 1);
                                        if (!resource.endpoints[i].endpointArtifacts[j]) {
                                            resource.endpoints[i].endpointArtifacts[j] = [];
                                        }
                                        if (new_endpointArtifactProperty === 'byteSize') {
                                            new_endpointArtifactProperty = 'bytesize';
                                        } else if (new_endpointArtifactProperty === 'creationDate') {
                                            new_endpointArtifactProperty = 'creation'
                                        } else if (new_endpointArtifactProperty === 'fileName') {
                                            new_endpointArtifactProperty = 'filename';
                                        }
                                        if (ENDPOINT_ARTIFACT_PROPERTIES.includes(new_endpointArtifactProperty)) {
                                            //string value
                                            resource.endpoints[i].endpointArtifacts[j][new_endpointArtifactProperty] = formatValue(endpointArtifactValue[0]);
                                        }
                                    }
                                }
                            }
                        } else if (new_property === 'endpointHost') {
                            let endpointHosts = value;
                            for (let j = 0; j < endpointHosts.length; j++) {
                                let endpointHost = connectorObject[endpointHost[j]];
                                for (const endpointHostProperty in endpointHost) {
                                    let endpointHostValue = endpointHost[endpointHostProperty];
                                    if (endpointHostProperty.startsWith(IDS_PREFIX)) {
                                        let new_endpointHostProperty = endpointHostProperty.substr(IDS_PREFIX.length);
                                        new_endpointHostProperty = new_endpointHostProperty.substr(0, new_endpointHostProperty.length - 1);
                                        if (!resource.endpoints[i].endpointHost[j]) {
                                            resource.endpoints[i].endpointHost[j] = [];
                                        }
                                        if (ENDPOINT_HOST_PROPERTIES.includes(new_endpointHostProperty)) {
                                            //string value
                                            resource.endpoints[i].endpointHost[j][new_endpointHostProperty] = formatValue(endpointHostValue[0]);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        //string value
                        resource.endpoints[i][new_property] = formatValue(value[0]);
                    }
                }
            }
        }
    }
}

const setContracts = (connectorObject, resource, contracts) => {
    resource.contract = [];
    for (let i = 0; i < contracts.length; i++) {
        let contract = connectorObject[contracts[i]];
        for (const property in contract) {
            let value = contract[property];
            if (property.startsWith(IDS_PREFIX)) {
                let new_property = property.substr(IDS_PREFIX.length);
                new_property = new_property.substr(0, new_property.length - 1);

                if (new_property === 'provider') {
                    new_property = 'contractProvider';
                } else if (new_property === 'consumer') {
                    new_property = 'contractConsumer';
                } else if (new_property === 'obligation') {
                    new_property = "contractObligation";
                } else if (new_property === 'permission') {
                    new_property = "contractPermission";
                } else if (new_property === 'prohibition') {
                    new_property = "contractProhibition";
                }

                if (!resource.contract[i]) {
                    resource.contract[i] = {
                        contractDocument: {},
                        contractObligation: [],
                        contractPermission: [],
                        contractProhibition: []
                    };
                }
                if (CONTRACT_PROPERTIES.includes(new_property)) {
                    if (CONTRACT_ARRAY_OBJECTS_PROPERTIES.includes(new_property)) {
                        //array of objects value - contractObligation or contractPermission or contractProhibition 
                        let contractObjects = value;
                        for (let j = 0; j < contractObjects.length; j++) {
                            let contractObject = connectorObject[contractObjects[j]];
                            for (const contractObjectProperty in contractObject) {
                                let contractObjectValue = contractObject[contractObjectProperty];
                                if (contractObjectProperty.startsWith(IDS_PREFIX)) {
                                    let new_contractObjectProperty = contractObjectProperty.substr(IDS_PREFIX.length);
                                    new_contractObjectProperty = new_contractObjectProperty.substr(0, new_contractObjectProperty.length - 1);

                                    //get obligation/permission/prohibition
                                    let type = new_property.slice("contract".length);
                                    type = type.charAt(0).toLowerCase() + type.slice(1);
                                    if (type === 'obligation') {
                                        type = 'duty;'
                                    }
                                    //let name = "contract" + new_property.charAt(0).toUpperCase() + new_property.slice(1);
                                    if (!resource.contract[i][new_property][j]) {
                                        resource.contract[i][new_property][j] = {};

                                        resource.contract[i][new_property][j][`${type}Constraint`] = [];
                                        resource.contract[i][new_property][j][`${type}Action`] = [];
                                        resource.contract[i][new_property][j][`${type}Assignee`] = [];
                                        resource.contract[i][new_property][j][`${type}Assigner`] = [];

                                    }
                                    if (CONTRACT_GENERIC_PROPERTIES.includes(new_contractObjectProperty)) {
                                        if (new_contractObjectProperty === 'constraint' || new_contractObjectProperty === 'assignee' || new_contractObjectProperty === 'assigner') {
                                            // array of objects value
                                            if (new_contractObjectProperty === 'constraint') {
                                                let constraintObjects = contractObjectValue;
                                                for (let k = 0; k < constraintObjects.length; k++) {
                                                    let constraintObject = connectorObject[constraintObjects[k]];
                                                    for (const constraintProperty in constraintObject) {
                                                        let constraintValue = constraintObject[constraintProperty];
                                                        if (constraintProperty.startsWith(IDS_PREFIX)) {
                                                            let new_constraintProperty = constraintProperty.substr(IDS_PREFIX.length);
                                                            new_constraintProperty = new_constraintProperty.substr(0, new_constraintProperty.length - 1);
                                                            if (!resource.contract[i][new_property][j][`${type}Constraint`][k]) {
                                                                resource.contract[i][new_property][j][`${type}Constraint`][k] = {};
                                                            }
                                                            if (CONTRACT_CONSTRAINT_PROPERTIES.includes(new_constraintProperty)) {
                                                                //string value
                                                                resource.contract[i][new_property][j][`${type}Constraint`][k][new_constraintProperty] = formatValue(constraintValue[0]);
                                                            }
                                                        }
                                                    }
                                                }
                                            } else if (new_contractObjectProperty === 'assignee') {
                                                let assigneeObjects = contractObjectValue;
                                                for (let k = 0; k < assigneeObjects.length; k++) {
                                                    let assigneeObject = connectorObject[assigneeObjects[k]];
                                                    for (const assigneeProperty in assigneeObject) {
                                                        let assigneeValue = assigneeObject[assigneeProperty];
                                                        if (assigneeProperty.startsWith(IDS_PREFIX)) {
                                                            let new_assigneeProperty = assigneeProperty.substr(IDS_PREFIX.length);
                                                            new_assigneeProperty = new_assigneeProperty.substr(0, new_assigneeProperty.length - 1);
                                                            if (!resource.contract[i][new_property][j][`${type}Assignee`][k]) {
                                                                resource.contract[i][new_property][j][`${type}Assignee`][k] = {};
                                                            }
                                                            if (CONTRACT_ASSIGNEE_PROPERTIES.includes(new_assigneeProperty)) {
                                                                //string value
                                                                resource.contract[i][new_property][j][`${type}Assignee`][k][new_assigneeProperty] = formatValue(assigneeValue[0]);
                                                            }
                                                        }
                                                    }
                                                }
                                            } else if (new_contractObjectProperty === 'assigner') {
                                                let assignerObjects = contractObjectValue;
                                                for (let k = 0; k < assignerObjects.length; k++) {
                                                    let assignerObject = connectorObject[assignerObjects[k]];
                                                    for (const assignerProperty in assignerObject) {
                                                        let assignerValue = assignerObject[assignerProperty];
                                                        if (assignerProperty.startsWith(IDS_PREFIX)) {
                                                            let new_assignerProperty = assignerProperty.substr(IDS_PREFIX.length);
                                                            new_assignerProperty = new_assignerProperty.substr(0, new_assignerProperty.length - 1);
                                                            if (!resource.contract[i][new_property][j][`${type}Assigner`][k]) {
                                                                resource.contract[i][new_property][j][`${type}Assigner`][k] = {};
                                                            }
                                                            if (CONTRACT_ASSIGNER_PROPERTIES.includes(new_assignerProperty)) {
                                                                //string value
                                                                resource.contract[i][new_property][j][`${type}Assigner`][k][new_assignerProperty] = formatValue(assignerValue[0]);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        } else {
                                            // array of strings value - action
                                            resource.contract[i][new_property][j][type + new_contractObjectProperty.charAt(0).toUpperCase() + new_contractObjectProperty.slice(1)] = formatValues(contractObjectValue);
                                        }
                                    }
                                }
                            }
                        }
                    } else if (CONTRACT_OBJECT_PROPERTIES.includes(new_property)) {
                        let contractDocumentObject = connectorObject[[value]];
                        for (const contractDocumentProperty in contractDocumentObject) {

                            let contractDocumentValue = contractDocumentObject[contractDocumentProperty];

                            if (contractDocumentProperty.startsWith(IDS_PREFIX)) {
                                let new_contractDocumentProperty = contractDocumentProperty.substr(IDS_PREFIX.length);
                                new_contractDocumentProperty = new_contractDocumentProperty.substr(0, new_contractDocumentProperty.length - 1);

                                if (new_contractDocumentProperty === 'title') {
                                    new_contractDocumentProperty = "docTitle";
                                }
                                else if (new_contractDocumentProperty === 'description') {
                                    new_contractDocumentProperty = 'docDesc';
                                }

                                if (CONTRACT_DOCUMENT_PROPERTIES.includes(new_contractDocumentProperty)) {
                                    resource.contract[i][new_property][new_contractDocumentProperty] = formatValues(contractDocumentValue);
                                }
                            }
                        }
                    } else {
                        //string value - all the rest
                        resource.contract[i][new_property] = formatValue(value[0]);
                    }
                }
            }
        }
    }
}

const prepareResource = (resource, resourceId, connectorObject) => {
    //get resource properties - each key (property) in this object should be: from IDS namespace, type or originURI(which is added artificially) 
    let resourceProperties = connectorObject[resourceId];
    for (const property in resourceProperties) {
        let value = resourceProperties[property];
        if (property.startsWith(IDS_PREFIX)) {
            let new_property = property.substr(IDS_PREFIX.length);
            new_property = new_property.substr(0, new_property.length - 1);

            if (new_property === 'resourceEndpoint') {
                new_property = 'endpoints';
            } else if (new_property === 'contractOffer') {
                new_property = 'contract';
            }

            // we are only considering properties from predefined list
            if (RESOURCE_PROPERTIES.includes(new_property)) {
                if (RESOURCE_ARRAY_OBJECTS_PROPERTIES.includes(new_property)) {
                    // 4 possibilities - temporal coverages, endpoint, representation, contract
                    if (new_property === 'temporalCoverage') {
                        setTemporalCoverages(connectorObject, resource, value);
                    } else if (new_property === 'representation') {
                        setRepresentations(connectorObject, resource, value);
                    } else if (new_property === 'endpoints') {
                        setEndpoints(connectorObject, resource, value);
                    } else if (new_property === 'contract') {
                        setContracts(connectorObject, resource, value);
                    }
                } else if (RESOURCE_ARRAY_STRINGS_PROPERTIES.includes(new_property)) {
                    if (!(new_property in resource)) {
                        resource[new_property] = [];
                    }
                    resource[new_property].push(formatValues(value));
                } else {
                    //values are strings - we will have only one value, therefore we take value[0]
                    resource[new_property] = formatValue(value[0]);
                }
            }
        } else if (property === 'originURI') {
            resource[property] = formatValue(value[0]);
        }
    }
    return resource;
}


const getResources = (connectorObject, connectorId) => {
    let resources = [];
    let connectorProperties = connectorObject[connectorId];

    //get resourceCatalog with resources - TODO - check if there is only one catalog id per connector
    if(connectorProperties[RESOURCE_CATALOG_URI] === undefined){
        return resources;
    }
    let resourceCatalogId = connectorProperties[RESOURCE_CATALOG_URI][0];
    let resourceCatalog = connectorObject[resourceCatalogId];
    debugger;
    //get resources from resourceCatalog
    let resourcesArray = resourceCatalog[OFFERED_RESOURCE_URI];
    if (resourcesArray === undefined) {
        return [];
    }

    for (let i = 0; i < resourcesArray.length; i++) {
        let resource = {};
        let resourceId = resourcesArray[i];

        resource = prepareResource(resource, resourceId, connectorObject, connectorId);

        resources.push(resource);
    }
    return resources;
}


export const prepareConnectorFormat = (data, connectorId) => {

    let connectorURI = '<' + connectorId + '>';

    let connector = {
        connector: {},
        provider: {},
        resources: []
    };
    // we will receive an object that has multiple keys, one of the keys is the connector itself, others are related to the objects in the connector
    let connectorObject = prepareConnectorObject(data);

    // connectorProperties will contain predicate:object entries, we are getting properties concerning only connector - connector and provider
    let connectorProperties = connectorObject[connectorURI];
    //preparing connector and provider details
    connector = getConnectorAndProvider(connectorProperties, connector);

    //preparing resources detail
    let resources = getResources(connectorObject, connectorURI);
    connector.resources = resources;

    return connector;
    
}



export const getAllResources = (token) => {
    let GET_ALL_RESOURCES = `
    PREFIX ids: <https://w3id.org/idsa/core/>
    PREFIX idsc: <https://w3id.org/idsa/code/>
    SELECT ?graph ?resource ?predicate ?object
    WHERE {
        GRAPH ?graph {
            ?subject ids:offeredResource ?resource .
            ?resource ?predicate ?object
        }
    }`;

    let query_url = mongodb_handlerURL + '/proxy/selectQuery';

    const myHeaders = new Headers();
    myHeaders.append('Content-type', 'application/json')

    if (token) {
        myHeaders.append('x-auth-token', token)
    }

    return fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: GET_ALL_RESOURCES })
        .then(res => {
            if (res.ok) {
                return res.blob();
            } else {
                throw new Error("An unexpected error");
            }
        })
        .then(resBlob => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsText(resBlob);
                reader.addEventListener("loadend", event => {
                    const queryResult = event.srcElement.result;
                    let resourcesObject = prepareResourcesObject(queryResult);
                    let resourcesArray = prepareResourcesFormat(resourcesObject);
                    resolve(resourcesArray);
                });
            })
        })
        .catch(error => {
            console.log(error);
        });
}

const prepareResourcesObject = (queryResult) => {
    let resources = {};
    let queryResultByLines = queryResult.split(/\n/);
    for (let i = 1; i < queryResultByLines.length - 1; i++) {
        // line is an array of three elements - connector, predicate, object
        let line = queryResultByLines[i].split(/\t/);
        let connector = line[0];
        let resource = line[1];
        let predicate = line[2];
        let object = line[3];
        let value = {};
        if (!(resource in resources)) {
            value[predicate] = object;
            value["resourceID"] = resource;
            value["connectorURI"] = connector;
        } else {
            value = resources[resource];
            value[predicate] = object;
        }
        resources[resource] = value;
    }
    console.log(resources);
    return resources;
}

const prepareResourcesFormat = (resources) => {
    let resourcesArray = [];
    let i = 0;
    for (const resource in resources) {
        let j = 0;
        let resourceProperties = resources[resource];
        for (const property in resourceProperties) {
            //initialize resourcesArray[i]
            if (j === 0) {
                resourcesArray[i] = {
                }
            }
            //get value for a property
            let value = resourceProperties[property];
            value = formatValue(value);

            // for now, we will process only properties that are from IDS namespace. M.P.
            if (property.startsWith(IDS_PREFIX)) {
                let new_property = property.substr(IDS_PREFIX.length);
                new_property = new_property.substr(0, new_property.length - 1);
                if (RESOURCE_PROPERTIES.includes(new_property)) {
                    if (RESOURCE_ARRAY_STRINGS_PROPERTIES.includes(new_property)) {
                        if (!(new_property in resourcesArray[i])) {
                            resourcesArray[i][new_property] = [];
                        }
                        resourcesArray[i][new_property].push(value);
                    } else {
                        resourcesArray[i][new_property] = value;
                    }
                }
            } else if (property === 'resourceID' || property === 'connectorURI') {
                resourcesArray[i][property] = value;
            }
            j++;
        }
        i++;
    }
    console.log(resourcesArray);
    return resourcesArray;
}

const getConnectorURIFromResource = (queryResult) => {
    let queryResultByLines = queryResult.split(/\n/);
    let line = queryResultByLines[1].split(/\t/);
    let connector = line[0];
    return connector;
}

export const getConnectorURI = (queryResult) => {
    let queryResultByLines = queryResult.split(/\n/);
    let line = queryResultByLines[1].split(/\t/);
    let ConnectorURI = line[0];
    return ConnectorURI;
}

export const getResource = (token, id) => {
    let GET_RESOURCE = `
    PREFIX ids: <https://w3id.org/idsa/core/>
    PREFIX idsc: <https://w3id.org/idsa/code/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    SELECT ?g ?p ?o
    WHERE {
        GRAPH ?g {
            ?subject ids:offeredResource <${id}> .
            <${id}> ?p ?o
        }
    }`;

    let query_url = mongodb_handlerURL + '/proxy/selectQuery';

    const myHeaders = new Headers();
    myHeaders.append('Content-type', 'application/json')

    if (token) {
        myHeaders.append('x-auth-token', token)
    }

    return fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: GET_RESOURCE })
        .then(res => {
            if (res.ok) {
                return res.blob();
            } else {
                throw new Error("An unexpected error");
            }
        })
        .then(resBlob => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsText(resBlob);
                reader.addEventListener("loadend", event => {
                    const queryResult = event.srcElement.result;
                    let connectorURI = getConnectorURIFromResource(queryResult);

                    // remove "<" and ">"
                    connectorURI = connectorURI.substr(1, connectorURI.length - 2);

                    //get connector with information about all resources, including this one
                    getConnector(token, connectorURI).then((queryResult) => {
                        let connectorObject = prepareConnectorObject(queryResult);
                        let resource = {};
                        let resourceID = '<' + id + '>';

                        //prepare resource info
                        resource = prepareResource(resource, resourceID, connectorObject);
                        //set resource id
                        resource.resourceID = id;
                        resolve(resource);
                    })
                });
            })
        })
        .catch(error => {
            console.log(error);
        });
}

//DASHBOARD PAGE

export const getCntResourcesByKeyword = (token) => {
    let GET_CNT_RESOURCES_BY_KEYWORD = `
    PREFIX ids: <https://w3id.org/idsa/core/> 
    PREFIX idsc: <https://w3id.org/idsa/code/> 

    SELECT ?keyword (COUNT(?resource) as ?cnt_resources)
    WHERE {GRAPH ?g {
        ?resourceCatalog ids:offeredResource ?resource .
        ?resource ids:keyword ?keyword .
    }
    }
    GROUP BY ?keyword
    `;

    let query_url = mongodb_handlerURL + '/proxy/selectQuery';

    const myHeaders = new Headers();
    myHeaders.append('Content-type', 'application/json')

    if (token) {
        myHeaders.append('x-auth-token', token)
    }

    return fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: GET_CNT_RESOURCES_BY_KEYWORD })
        .then(res => {
            if (res.ok) {
                return res.blob();
            } else {
                throw new Error("An unexpected error");
            }
        })
        .then(resBlob => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsText(resBlob);
                reader.addEventListener("loadend", event => {
                    const queryResult = event.srcElement.result;

                    let buckets = [];
                    let queryResultByLines = queryResult.split(/\n/);
                    for (let i = 1; i < queryResultByLines.length - 1; i++) {

                        // line is an array of two elements - keyword and cnt_resources
                        let line = queryResultByLines[i].split(/\t/);

                        let keyword = formatValue(line[0]);
                        let cnt_resources = line[1];

                        buckets.push({ key: keyword, doc_count: cnt_resources })
                    }
                    resolve(buckets);
                });
            })
        })
        .catch(error => {
            console.log(error);
        });
}

export const getCntResourcesByLanguage = (token) => {
    let GET_CNT_RESOURCES_BY_LANGUAGE = `
    PREFIX ids: <https://w3id.org/idsa/core/> 
    PREFIX idsc: <https://w3id.org/idsa/code/> 

    SELECT ?language (COUNT(?resource) as ?cnt_resources)
    WHERE {GRAPH ?g {
        ?resourceCatalog ids:offeredResource ?resource .
        ?resource ids:language ?language .
    }
    }
    GROUP BY ?language
    `;

    let query_url = mongodb_handlerURL + '/proxy/selectQuery';

    const myHeaders = new Headers();
    myHeaders.append('Content-type', 'application/json')

    if (token) {
        myHeaders.append('x-auth-token', token)
    }

    return fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: GET_CNT_RESOURCES_BY_LANGUAGE })
        .then(res => {
            if (res.ok) {
                return res.blob();
            } else {
                throw new Error("An unexpected error");
            }
        })
        .then(resBlob => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsText(resBlob);
                reader.addEventListener("loadend", event => {
                    const queryResult = event.srcElement.result;

                    let buckets = [];
                    let queryResultByLines = queryResult.split(/\n/);
                    for (let i = 1; i < queryResultByLines.length - 1; i++) {

                        // line is an array of two elements - language and cnt_resources
                        let line = queryResultByLines[i].split(/\t/);

                        let language = formatValue(line[0]);
                        let cnt_resources = line[1];

                        buckets.push({ key: language, doc_count: cnt_resources })
                    }
                    resolve(buckets);
                });
            })
        })
        .catch(error => {
            console.log(error);
        });
}

export const getCntResourcesByPublisher = (token) => {
    let GET_CNT_RESOURCES_BY_PUBLISHER = `
    PREFIX ids: <https://w3id.org/idsa/core/> 
    PREFIX idsc: <https://w3id.org/idsa/code/> 

    SELECT ?publisher (COUNT(?resource) as ?cnt_resources)
    WHERE {GRAPH ?g {
        ?resourceCatalog ids:offeredResource ?resource .
        ?resource ids:publisher ?publisher .
    }
    }
    GROUP BY ?publisher
    ORDER BY desc(?cnt_resources)
    `;

    let query_url = mongodb_handlerURL + '/proxy/selectQuery';

    const myHeaders = new Headers();
    myHeaders.append('Content-type', 'application/json')

    if (token) {
        myHeaders.append('x-auth-token', token)
    }

    return fetch(query_url.toString(), { method: "POST", headers: myHeaders, body: GET_CNT_RESOURCES_BY_PUBLISHER })
        .then(res => {
            if (res.ok) {
                return res.blob();
            } else {
                throw new Error("An unexpected error");
            }
        })
        .then(resBlob => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsText(resBlob);
                reader.addEventListener("loadend", event => {
                    const queryResult = event.srcElement.result;

                    let buckets = [];
                    let queryResultByLines = queryResult.split(/\n/);
                    for (let i = 1; i < queryResultByLines.length - 1; i++) {

                        // line is an array of two elements - publisher and cnt_resources
                        let line = queryResultByLines[i].split(/\t/);

                        let publisher = formatValue(line[0]);
                        let cnt_resources = line[1];

                        buckets.push({ key: publisher, doc_count: cnt_resources })
                    }
                    resolve(buckets);
                });
            })
        })
        .catch(error => {
            console.log(error);
        });
}