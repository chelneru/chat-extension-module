const framework = require('./framework');
const fs = require('fs');
const path = require('path');
exports.LoadConfig = () => {
    global.sharedData = {};
    const appRoot = require('app-root-path').toString();
    if (fs.existsSync(path.join(appRoot, 'settings.json'))) {
        try {
        let rawdata = fs.readFileSync(path.join(appRoot,'settings.json'));

        global.moduleConfig = JSON.parse(rawdata.toString());
        }catch (e) {
            console.log('Invalid settings file for chat extension.',e.toString());
            global.moduleConfig = {};
            exports.SaveConfig();
        }
    } else {
        global.moduleConfig = {};
        exports.SaveConfig();
    }
}
exports.SaveConfig = async () => {
    const appRoot = require('app-root-path').toString();
    return fs.writeFile(path.join(appRoot, 'settings.json'), JSON.stringify(global.moduleConfig), (err) => {
        if (err) {
            console.log('Error saving config file:', err.toString());
        }
    });
}

exports.SendMessage = async (sender, recipient, message, time) => {
    let data = {
        sender: sender,
        recipient: recipient,
        message: message,
        time: time
    };
   return framework.SendMessage(data);

}
exports.RetrieveMessage = async () => {

    return framework.RetrieveMessages();

}

