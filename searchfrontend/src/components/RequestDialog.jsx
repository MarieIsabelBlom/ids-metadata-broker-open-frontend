import React, { useEffect, useState } from "react";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from "@material-ui/core/Select";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import "../css/Jsonld.css";	
import Jsonld from "./Jsonld";

import { mongodb_handlerURL } from "../urlConfig";

const getModalStyle = () => {
  const top = 48;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
    overflow: "auto",	
    height: "100%",	
    display: "block",
  };
};

const styles = (theme) => ({
  paper: {
    height: "auto",
    position: "absolute",
    width: theme.spacing(100),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],

    padding: theme.spacing(4),
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "80ch",
    },
    "& .loginButtonWrapper": {
      width: "100%",
      float: "left",
      margin: theme.spacing(1),
    },
    "& .login-message": {
      color: "#B22222",
    },
  },
  button: {
    color: "#FFF",
    fontWeight: "bold",
    borderRadius: 32,
    boxShadow: "none",
    backgroundColor: "#3f51b5",
    "&:hover": {
      backgroundColor: "#3f51b5",
      color: "#FFF",
      boxShadow: "none",
    },
  },
  formControl: {
    marginTop: theme.spacing(6),
    margin: theme.spacing(1),
  },
  selectEmpty: {
    marginTop: theme.spacing(6),
  },
});

const RequestDialog = (props) => {
  //  console.log(props.fieldVal);
  let IDS_PREFIX = "http://vocol.fraunhofer.de/vmo/";
  const IDSVOCABULARY_URL = "https://demo3.iais.fraunhofer.de/mds/infrastructure/";

  const [msg, setmsg] = useState("");
  const [url, seturl] = useState(IDSVOCABULARY_URL);
  const [nodes, setnodes] = useState([]);
  const [modal, setModal] = useState(false);
  const [prefix, setPrefix] = useState(IDS_PREFIX);
  const [currentInstance, setCurrentInstance] = useState("");
  const [instanceList, setInstanceList] = useState([]);

  let payloadbody = {
    "@context": {
      ids: "https://w3id.org/idsa/core/",
      idsc: "https://w3id.org/idsa/code/",
      xsd: "http://www.w3.org/2001/XMLSchema#",
    },
    "@type": "ids:DescriptionRequestMessage",
    "@id":
      "http://industrialdataspace.org/1a421b8c-3407-44a8-aeb9-253f145c869a",
    "ids:issued": {
      "@value": "2021-05-25T15:35:34.589Z",
      "@type": "xsd:dateTimeStamp",
    },
    "ids:modelVersion": "4.0.0",
    "ids:senderAgent": {
      "@id": "https://localhost/agent",
    },
    "ids:issuerConnector": {
      "@id": "https://localhost/59a68243",
    },
    "ids:securityToken": {
      "@type": "ids:DynamicAttributeToken",
      "@id":
        "https://w3id.org/idsa/autogen/dynamicAttributeToken/2bd53efc-5995-d75590476820",
      "ids:tokenFormat": {
        "@id": "https://w3id.org/idsa/code/JWT",
      },
      "ids:tokenValue": "{{dat}}",
    },
    "ids:requestedElement": {
      "@id": prefix,
    },
  };
  
  //IDS_PREFIX + (props.fieldVal.replace(/\s/g, '')).replace(/(^\w|\s\w)/g, m => m.toLowerCase()),

  const [payload, setpayload] = useState(payloadbody);

  const parseInstance = (object) => {
    if (object) {
      const instanceSet = [];	
      if (object.head.vars[2] === "preferredNamespacePrefix") {	
        //for closed src vocol	
        for (let i = 0; i < object.results.bindings.length; i++) {	
          console.log(object.results.bindings[i]);	
          if (object.results.bindings[i].preferredNamespacePrefix) {	
            const ontologyMetadata = {	
              instance:	
                object.results.bindings[i].preferredNamespacePrefix.value,	
              uri: object.results.bindings[i].preferredNamespaceUri.value,	
              graph: object.results.bindings[i].graph.value,	
            };	
            let itemExists = instanceSet.some(	
              (item) => item.instance === ontologyMetadata.instance	
            );	
            if (!itemExists) {	
              instanceSet.push(ontologyMetadata);	
            }	
          }	
        }
        const instance = [...instanceSet];
        setInstanceList(instance);
      } else {
        //For open src vocol
        for (let i = 0; i < object.results.bindings.length; i++) {
          if (
            object.results.bindings[i].p.value.includes("preferredNamespaceUri")
          ) {
            const ontologyMetadata = {
              instance: object.results.bindings[i].s.value
                .split("/")
                .pop()
                .replace("#", ""),
              uri: object.results.bindings[i].o.value,
            };
            instanceSet.add(ontologyMetadata);
          }
        }
        const instance = [...instanceSet];
        setInstanceList(instance);
      }
    }
  };

  useEffect(() => {
    // Create function inside useEffect so that the function is only
    // created everytime the useEffect runs and not every render.
    const fetchData = async () => {
      let backendUrl = 'http://localhost:4000' + "/ids";
      try {
        let response = await fetch(backendUrl, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: url, payload: payload }),
        });
        if (response.ok) {
          let data = await response.json();
          let instance = parseJsonLd(data);
          parseInstance(instance);
          setPrefix("");
        } else {
          console.log(response);
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, [url]);

  const handleChange = (event) => {
    seturl(event.target.value);
  };

  const toggle = () => {
    setModal(!modal);
  };

  const onClear = (e) => {
    setmsg("");
  };
  const onChange = (e) => {
    const payload = JSON.parse(e.target.value);
    setpayload(payload);
  };

  useEffect(() => {
    setpayload(payloadbody);
  }, [currentInstance, prefix]);

  const changeInstance = (value) => {
    if (!value) {
      setCurrentInstance("");
      setPrefix("");
      return;
    }
    let item = instanceList.find((element) => element.uri === value);
    if (item) {
      setCurrentInstance(item.uri);
      setPrefix(item.uri + (props.fieldVal.replace(/\s/g, '')).replace(/(^\w|\s\w)/g, m => m.toLowerCase()));
    }
  };
  // IDS_PREFIX + (props.fieldVal.replace(/\s/g, '')).replace(/(^\w|\s\w)/g, m => m.toLowerCase()),
  const parseJsonLd = (payload) => {
    let splitted_msg = payload.split("\r\n");
    let boundary = splitted_msg[0];
    let targeted_payload = payload.split(boundary)[2].toString().split("\r\n");
    targeted_payload.splice(0, 5);
    targeted_payload.splice(-1);
    return JSON.parse(targeted_payload.toString());
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    let backendUrl = 'http://localhost:4000' + "/ids";
    try {
      let response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url, payload: payload }),
      });
      if (response.ok) {
        let data = await response.json();
        setnodes(parseJsonLd(data));
        setmsg(data);
      } else {
        setmsg("Bad request");
      }
    } catch (e) {
      setmsg("Bad request");
    }
  };

  		
  const config = {	
    w: 600,	
    h: 400,	
    maxLabelWidth: 250,	
    tipClassName: "tip-class",	
  };	
  const cardStyle = {	
    display: "block",	
    width: 630,	
    marginLeft: 7,	
  };	


  return (
    <div className={props.classes.loginForm}>
      {/* <Button
        color="primary"
        style={{ textTransform: "none" }}
        onClick={toggle}
      >
        {props.fieldVal}
      </Button> */}

      <span style={{cursor:'pointer'}} onClick={toggle}>
        {props.fieldVal}
      </span>

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={modal}
        onClose={toggle}
      >
        <div style={getModalStyle()} className={props.classes.paper}>
          <div>
            <TextField
              id="outlined-basic"
              label="Endpoint"
              variant="outlined"
              name="url"
              value={url}
              onChange={handleChange}
            />
            <TextField
              id="standard-payload-input"
              label="Header"
              type="textarea"
              autoComplete="current-password"
              variant="outlined"
              multiline
              minRows={2}
              maxRows={6}
              name="payload"
              value={JSON.stringify(payload, null, 2)}
              onChange={onChange}
            />
            <div className="loginButtonWrapper">
              <Button style={{backgroundColor:'#FFFF00'}}
                variant="contained"
                disabled={prefix === ""}
                // color="primary"
                onClick={onSubmit}
              >
                Send Request
              </Button>
              <Button
                style={{ marginLeft: "10px" }}
                variant="outlined"
                color="secondary"
                onClick={onClear}
              >
                Clear
              </Button>
              <FormControl
                variant="outlined"
                style={{ width: 200, marginLeft: 100 }}
              >
                <Select
                  labelId="demo-simple-select-filled-label"
                  id="demo-simple-select-filled"
                  value={currentInstance}
                  style={{ width: 200, marginLeft: 100, height: 40 }}
                  onChange={(event) => changeInstance(event.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {instanceList.length > 0 &&
                    instanceList.map((item, index) => {
                      return (
                        <MenuItem key={index} value={item.uri}>
                          {item.instance}
                        </MenuItem>
                      );
                    })}
                </Select>
                <FormHelperText
                  style={{ width: 200, marginLeft: 110, height: 40 }}
                >
                  Selected URI: {prefix}
                </FormHelperText>
              </FormControl>
            </div>
            <TextField
              id="standard-output"
              label="Output"
              type="textarea"
              variant="filled"
              multiline
              minRows={2}
              maxRows={12}
              name="output"
              value={msg}
              inputProps={{ readOnly: true }}
            />
            
            {Object.keys(nodes).length > 0 && (	
              <Card style={cardStyle}>	
                <CardContent>	
                  <Jsonld data={nodes} config={config}></Jsonld>	
                </CardContent>	
              </Card>	
            )}

          </div>
        </div>
      </Modal>
    </div>
  );
};
export default withStyles(styles)(RequestDialog);
