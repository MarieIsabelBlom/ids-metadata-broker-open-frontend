const express = require('express');
const router = express.Router({ mergeParams : true });
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');


require('dotenv/config')

const resourcemessage = process.env.RESOURCEMESSAGE;
const connectormessage = process.env.CONNECTORMESSAGE;
const formData = new FormData();
const url = 'http://localhost:8080/infrastructure';



//router.get('/clean/resource/:uri', auth, admin, async (req, res) => {
router.get('/clean/resource/:uri(*)', async (req, res) => {

    try {
        const ResourceURI = req.params.uri;
        
        // Simple validation
        if(!ResourceURI) {
          return res.status(400).json({
            msg: 'Please enter Resource URI'
          })
       
      };
        console.log ('cleaning request for Resource', ResourceURI)
        res.send(ResourceURI);
        
        // fs.readFile('./messages/ResourceUnavailable.json', (err,data)  =>{
       fs.readFile(resourcemessage, (err, data) => {
          if (err) throw err;
          if(data != null){
           
          let ResourceUnavailable = JSON.parse(data);
          ResourceUnavailable['ids:affectedResource']['@id'] = ResourceURI;
       

        fs.writeFile(resourcemessage, JSON.stringify(ResourceUnavailable,null,4), (err) => {
          if (err) {
            console.log(err);
          } else {
        console.log('ResourceID is successfully added');
        


formData.append('header', JSON.stringify(ResourceUnavailable));

const config = {
    method: 'POST',
    url: url,
    headers: {
        ...formData.getHeaders()
    },
    data: formData
};
try {
    let response = axios(config);
    res.status(response.status).json(response.data);
    console.log(ResourceURI, 'is successfully deleted');
} catch (err) {
    res.status(400).send({ error: "Bad request" });
    console.log(err);
}
          }; 
        }); 
      };
    }); 
      } catch (err) {
                res.status(500).json({ msg: 'Network error'});
            }
        
        });
   
      

  router.get('/clean/connector/:uri(*)', async (req, res) => {

    try {
        const ConnectorURI = req.params.uri;
        console.log(ConnectorURI);
        // Simple validation
        if(!ConnectorURI) {
          return res.status(400).json({
            msg: 'Please enter Connector URI'
          })
       
      };
        console.log ('cleaning request for Connector', ConnectorURI)
        res.send(ConnectorURI);
       
          fs.readFile(connectormessage, (err, data) => {
            if (err) throw err;
            if(data != null){
             
            let ConnectorUnavailable = JSON.parse(data);
            ConnectorUnavailable['ids:issuerConnector']['@id'] = ConnectorURI; 
            ConnectorUnavailable['ids:affectedConnector']['@id'] = ConnectorURI;
         
  
          fs.writeFile(connectormessage, JSON.stringify(ConnectorUnavailable,null,4), (err) => {
            if (err) {
              console.log(err);
            } else {
          console.log('successfully added');
  
formData.append('header', JSON.stringify(ConnectorUnavailable));

const config = {
    method: 'POST',
    url: url,
    headers: {
        ...formData.getHeaders()
    },
    data: formData
};
try {
    let response = axios(config);
    res.status(response.status).json(response.data);
    console.log(ConnectorURI, 'is successfully deleted');
} catch (err) {
    res.status(400).send({ error: "Bad request" });
    console.log(err);
}
          }; 
        }); 
      };
    }); 
      } catch (err) {
                res.status(500).json({ msg: 'Network error'});
            }
        
        });

  module.exports = router;