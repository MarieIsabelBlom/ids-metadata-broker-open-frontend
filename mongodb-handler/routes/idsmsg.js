const express = require('express');
const axios = require('axios');
const router = express.Router();
const FormData = require('form-data');

router.post('/', async (req, res) => {
    const url = req.body.url;
    const payload = req.body.payload;

    const formData = new FormData();
    formData.append('header', JSON.stringify(payload));

    const config = {
        method: 'POST',
        url: url,
        headers: {
            ...formData.getHeaders()
        },
        data: formData
    };
    try {
        let response = await axios(config);
        res.status(response.status).json(response.data);
    } catch (err) {
        res.status(400).send({ error: "Bad request" });
    }
});

module.exports = router;
