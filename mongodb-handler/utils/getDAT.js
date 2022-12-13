const fs = require('fs');
const axios = require('axios');
const https = require('https');
const jks = require('jks-js');
const jwt = require('jsonwebtoken');
const x509 = require('@peculiar/x509');

const keyStorePath = process.env.KEYSTORE_PATH;
const jksPassword = process.env.JKS_PASSWORD;
const privateKeyPassword = process.env.PRIVATE_KEY_PASSWORD;

async function getDAT() {

    //connect to keystore and get cert and private key
    const keystore = jks.toPem(
        fs.readFileSync(keyStorePath),
        jksPassword,
        privateKeyPassword
    );

    const { cert, key: privateKey } = keystore['1'];

    //get SKI and AKI from Certificate and form clientId=SKI:keyid:AKI
    const x509Certificate = new x509.X509Certificate(cert);

    const SKI = x509Certificate.getExtension("2.5.29.14").keyId;
    const AKI = x509Certificate.getExtension("2.5.29.35").keyId;

    let formattedSKI = "";
    let formattedAKI = "";
    for (let i = 0; i < SKI.length - 1; i = i + 2) {
        const pieceSKI = SKI[i] + SKI[i + 1];
        const pieceAKI = AKI[i] + AKI[i + 1];

        formattedSKI += pieceSKI;
        formattedAKI += pieceAKI;

        if (i !== SKI.length - 2) {
            formattedSKI += ":";
            formattedAKI += ":";
        }
    }
    const clientId = formattedSKI.toUpperCase() + ":keyid:" + formattedAKI.toUpperCase();

    const currentTime = new Date();
    const expireTime = currentTime.setSeconds(currentTime.getSeconds() + 60);

    //create payload for JWT
    const payload = {
        iss: clientId,
        sub: clientId,
        aud: "idsc:IDS_CONNECTORS_ALL",
        exp: Math.round(expireTime / 1000)
    }

    //create JWT
    const token = jwt.sign(
        payload,
        privateKey,
        {
            "algorithm": "RS256"
        });

    //creating a request to get DAPS token (DAT)
    const dapsResponse = await axios.post(
        'https://daps.aisec.fraunhofer.de/v3/token',
        {
            grant_type: 'client_credentials',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: token,
            scope: 'idsc:IDS_CONNECTOR_ATTRIBUTES_ALL'
        },
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        }
    );
    return dapsResponse.data.access_token;
}

module.exports = getDAT;