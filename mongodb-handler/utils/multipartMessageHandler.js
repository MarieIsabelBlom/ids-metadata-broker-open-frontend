
const getBoundary = (response) => {
    return response.headers["content-type"].split(";")[1].substr(10);
}

const getResponseMessages = (response, boundary) => {
    return response.data.split("--" + boundary).filter(part => part !== '').filter(part => part !== '--\r\n');
}

const parseHeaderMessage = (message) => {
    const headerMessageParts = message.split('\r\n').filter(part => part !== '');
    // Content-Disposition [0]
    // Content-Type [1]
    // Content-Length [2]
    // JSON LD Message [3]

    const headerMessageContent = JSON.parse(headerMessageParts[3]);

    return {
        contentDisposition: headerMessageParts[0],
        contentType: headerMessageParts[1],
        contentLength: headerMessageParts[2],
        content: headerMessageContent
    }
}

const parsePayloadMessage = (message) => {
    const payloadMessageParts = message.split('\r\n').filter(part => part !== '');
    // Content-Disposition [0]
    // Content-Type [1]
    // Content-Length [2]
    // Message [3]

    return {
        contentDisposition: payloadMessageParts[0],
        contentType: payloadMessageParts[1],
        contentLength: payloadMessageParts[2],
        content: payloadMessageParts[3]
    }
}


module.exports = {
    getBoundary,
    getResponseMessages,
    parseHeaderMessage,
    parsePayloadMessage
}
