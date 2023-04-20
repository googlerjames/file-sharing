const path = require('path');
const {google} = require('googleapis');


/*
 * Gets the auth for accessing Google
 * @param {String} user the user's email address to impersonate
 */ 
const getAuth = async (user) => {
    const jwtClient = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname ,'.','privatekey.json'),
        scopes: [
            'https://www.googleapis.com/auth/admin.directory.user',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/classroom.courses.readonly',
            'https://www.googleapis.com/auth/admin.directory.group'
        ],
        clientOptions: {
            subject: user
        },
      });

    return jwtClient  
    
}

module.exports = { getAuth }