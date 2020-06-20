const axios = require('axios');
const internal = require('./internal');
const path = require('path');

exports.GetIdentity = () => {
    axios.interceptors.response.use(
        function (response) {
            global.connected = true;
            return response;
        },
        function (err) {
            if (err.code === "ECONNREFUSED") {
                //we cannot reach the framework.
                console.log('Cannot reach framework.')
            }

            return Promise.reject(err);
        }
    );
    axios.post('http://localhost:3000/extension/identity', {
        name: 'chat',
    })
        .then(async (res) => {
            if (res.data.status === true) {
                let new_identity = {
                    name: res.data.identity.name,
                    email: res.data.identity.email,
                };

                global.moduleConfig.identity = new_identity; //update new identity
                internal.SaveConfig();
                console.log('Retrieved identity for chat successfully!');

                console.log('done initializing chat extension');
            } else {
                console.log('Failed to get valid identity information.');

            }
        })
        .catch((error) => {
            console.error('Error getting identity information:', error.toString());
            if (global.connected === false) {
                setTimeout(function () {
                    exports.GetIdentity();
                }, 3000);
            }
            else {
                // we are connected, retrieve online users.
                //retrieve people information
                exports.RetrieveSharedData();
            }
        })

};

exports.RetrieveSharedData = () => axios.post('http://localhost:3000/extension/retrieve-shared-data', {
        name: 'chat',
    }
)
    .then((res) => {
        if (res.data.status) {
            global.sharedData = res.data.content;
            return {status:true,content:global.sharedData}
        }
    })
    .catch((error) => {
        console.error('Error retrieving shared data for chat:',error.toString());
    })

exports.SendMessage = (data) => axios.post('http://localhost:3000/extension/publish-data', {
            name: 'chat',
            data: data,
        }
    )
        .then((res) => {
            if (res.data.status) {
                console.log('Sent message successfully!');
            }
            else {
                console.log('Error sending the message',res.data.status);
            }
            return {status:res.data.status};

        })
        .catch((error) => {
            console.error('Error sending message: ',error.toString());
            return {status:false};

        });


exports.RetrieveMessages = () => axios.post('http://localhost:3000/extension/update-data', {
        name: 'chat',
    }
)
    .then((res) => {
        if (res.data.status) {
            // console.log('Retrieved messages successfully!');
        }
        return {status: res.data.status, content: res.data.content}

    })
    .catch((error) => {
        console.error('Error retrieving message: ', error.toString());
        return {status: false, content: null}

    })
