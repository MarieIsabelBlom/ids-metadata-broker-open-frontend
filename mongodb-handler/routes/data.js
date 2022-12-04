const express = require('express');
const router = express.Router({ mergeParams: true });
const Deletion = require('../models/Deletion');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const jwt = require('jsonwebtoken');



require('dotenv/config')

const secret = process.env.JWT_SECRET;
const resourcemessage = process.env.RESOURCEMESSAGE;
const connectormessage = process.env.CONNECTORMESSAGE;
const formData = new FormData();
const url = 'http://localhost:8080/infrastructure';


//router.use(auth, admin);

//Route for Sending a Deletion Message to Delete a Connector to the Broker
router.get('/clean/resource/:uri(*)', auth, admin, async (req, res) => {
console.log(req.user)
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
        
       
       fs.readFile(resourcemessage, (err, data) => {
          if (err) throw err;
          if(data != null){
           
          let ResourceUnavailable = JSON.parse(data);
          console.log(ResourceUnavailable);
          ResourceUnavailable['ids:affectedResource']['@id'] = ResourceURI;
       

        fs.writeFile(resourcemessage, JSON.stringify(ResourceUnavailable,null,4), async (err) => {
          if (err) {
            console.log(err);
          } else {
        console.log('ResourceID is successfully added');        
//console.log(ResourceUnavailable)
formData.append('header', JSON.stringify(ResourceUnavailable));

const config = {
    method: 'POST',
    url: url,
    headers: {
        ...formData.getHeaders()
    },
    data: formData
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

//console.log(config)
/*try {
    let response = await axios(config);
    res.status(response.status).json(response.data);
    console.log(ResourceURI, 'is successfully deleted');
} catch (err) {
    res.status(400).send({ error: "Bad request" });
    console.log(err);
}*/
          }; 
        }); 
      };
    }); 
      } catch (err) {
                res.status(500).json({ msg: 'Network error'});
            }
        
        });
   
      
//Route for Sending a Deletion Message to Delete a Connector to the Broker
  router.get('/clean/connector/:uri(*)', auth, admin, async (req, res) => {

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
         
  
          fs.writeFile(connectormessage, JSON.stringify(ConnectorUnavailable,null,4), async (err) => {
            if (err) {
              console.log(err);
            } else {
          console.log('ConnectorID successfully added');
  
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

//Route for Saving the Reason for Deletion in MongoDB

router.post('/addreason', auth, admin, async (req, res) => {
          try {
              const { id, reason } = req.body;
        
              // Simple validation
              if(!id || !reason) {
                return res.status(400).json({
                  msg: 'Please enter a valid Reason'
                })
              }
                  new Deletion(req.body).save()
                    .then(dbdata => {
                      res.json(dbdata)
                    })
          } catch (err) {
              res.status(500).json({ msg: 'Network error'});
          }
        })
        

        router.get('/', auth, (req, res) => {
          Deletion.find(function(err, dbdata) {
              if (err) {
                  console.log(err);
              }
              else {
                  // Response gets all existing data
                  res.json(dbdata);
              }
          });
      });

  module.exports = router;