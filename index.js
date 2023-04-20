/*
 * THIS IS SAMPLE CODE
 *
 * Copyright 2022 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Authored by James Ferreira
 */

var gAuth = require('./googleAuth');
const {google} = require('googleapis');

/**
 * Lists the in an OU.
 *
 * @param {String} ouPath the path of the OU 
 */
async function listUsersInOu(ouPath) {

    const auth = await gAuth.getAuth()
    const service = google.admin({version: 'directory_v1', auth});
    var ouUsers = [];
    let NextPageToken = "";
    do {
        const res = await service.users.list({
            customer: 'C03drr2ko',
            maxResults: 500,
            orderBy: 'email',
            query: "orgUnitPath='"+ouPath+"'",
            pageToken: NextPageToken || "",
        });

        const users = res.data.users;
        if (!users || users.length === 0) {
            console.log('No users found.');
            return;
        }
    
        //console.log('Users:');
        users.forEach((user) => {
            ouUsers.push(user.primaryEmail);
        });

        NextPageToken = res.data.nextPageToken;
    } while (NextPageToken);
    return ouUsers
  }

async function listFilesByUser(userEmail){

    const auth = await gAuth.getAuth(userEmail)
    const service = google.drive({version: 'v3', auth});
    const files = [];
    let NextPageToken = "";
    do {
        try {
            const res = await service.files.list({
                //q: "name = 'A Test File'",
                fields: 'nextPageToken, files(id, name, owners, permissions)',
                //spaces: 'drive',
                pageToken: NextPageToken || "",
                maxResults: 100
            });
            res.data.files.forEach(function(file) {
                //console.log('Found file:', file.name, file.id);
                //console.log(file)
                files.push(file)
            });
            
            NextPageToken = res.data.nextPageToken;
        } catch (err) {
            // TODO(developer) - Handle error
            throw err;
        }
        
    } while (NextPageToken);    

    return files
}

async function getGroupMembers(groupKey){
    const auth = await gAuth.getAuth()
    const service = google.admin({version: 'directory_v1', auth});
    var groupMembers = [];
    let NextPageToken = "";
    do {
        const res = await service.members.list({
            groupKey: "offenders.in.fmc@chrome.drc.ohio.gov",
            pageToken: NextPageToken || "",
        });

        const members = res.data.members;
        if (!members || members.length === 0) {
            console.log('No members found.');
            return groupMembers;
        }
    
        //console.log('Users:');
        members.forEach((member) => {
            groupMembers.push(member.email);
        });

        NextPageToken = res.data.nextPageToken;
    } while (NextPageToken);
    return groupMembers
}

async function getClassEmails(user){
    const auth = await gAuth.getAuth(user)
    const service = google.classroom({version: 'v1', auth});
    var classMembers = [];
    let NextPageToken = "";
    do {
        const res = await service.courses.list({
            pageToken: NextPageToken || "",
        });

        const courses = res.data.courses;
        if (!courses || courses.length === 0) {
            console.log('No courses found.');
            return classMembers;
        }
        console.log('Courses:');
        courses.forEach((course) => {
            classMembers.push(course.courseGroupEmail);
        });

        NextPageToken = res.data.nextPageToken;
    } while (NextPageToken);
    return classMembers

}

async function deletePermission(fileId, permissionId, ownerEmail){
    try{
        const auth = await gAuth.getAuth(ownerEmail)
        const service = await google.drive({version: 'v3', auth});
        await service.permissions.delete({
            'fileId': fileId,
            'permissionId': permissionId,
        })
        //console.log('Permission removed')
        return 200
    }catch(e){
        console.log(e)
        return 500
    }
}

async function updatePermission(fileId, permissionId, ownerEmail, role){
    try{
        const auth = await gAuth.getAuth(ownerEmail)
        const service = await google.drive({version: 'v3', auth});
        await service.permissions.update({
            'fileId': fileId,
            'permissionId': permissionId,
            'resource': {'role': role}
        })
        //console.log('Permission updated')
        return 200
    }catch(e){
        console.log(e)
        return 500
    }
}


/*
 * Test the sharing of Documents by Offender
 * @param {String} docId the id of a doc
 * @param {Array} staff all of the Teachers
 * @param {Array} offenders 
 * @param {Array} classEmails for the current staff
 * @returns {Object} sharring : {String} the message, fileName : {String} name of doc 
 */
async function getSharing(file, staff, offenders, classEmails) {
    //var file = DriveApp.getFileById(docId)
    var editors = []
    var viewers = []
    var owners = []
    

    var acls = file.permissions
    //console.log(acls)
    acls.forEach(acl => {
        switch(acl.role) {
            case 'owner':
              owners.push({email:acl.emailAddress, id:acl.id})
              break;
            case 'writer':
              editors.push({email:acl.emailAddress, id:acl.id})
              break;
            default:
              viewers.push({email:acl.emailAddress, id:acl.id})
          }
    })
  
    // console.log('owners: '+ owners)
    // console.log("editors: "+ editors)
    // console.log("viewers: "+ viewers)

    var numberOfEditors = editors.length
    var staffIsEditor = 0;
    var offenderIsEditor = 0;
    var offenderIsViewer = 0;
    var offenderIsOwner = false;
    var staffIsOwner = false;
    var moreThanOneEditor = false;
    var testResult = {sharing:'No Sharing Issues', name: file.name};
  
  
    for(var e = 0; e < editors.length; e++){
         
        if(classEmails.indexOf(editors[e].email) !=-1){
            testResult.sharing = "Rule Violation. Class Email can't be an Editor"
            console.log(testResult)
            //Remove Editor 
            console.log('Deleting permission for: ', editors[e].email, ' id: '+editors[e].id)

            await deletePermission(file.id, editors[e].id, owners[0].email)
              
            return testResult       
        }    

        if(staff.indexOf(editors[e].email) !=-1){
            staffIsEditor +=1
        }
        if(offenders.indexOf(editors[e].email) !=-1){
            offenderIsEditor +=1
        }
        }
  
    for(var v = 0; v < viewers.length; v++){
      if(offenders.indexOf(viewers[v].email) !=-1){
        offenderIsViewer +=1
      }
    }
  
    if(staff.indexOf(owners[0].email) !=-1){
        staffIsOwner = true
      }
    if(offenders.indexOf(owners[0].email) !=-1){
      offenderIsOwner = true
    }

    var totalOffenders = offenderIsEditor + offenderIsViewer
    if((staffIsEditor >=1 || staffIsOwner) && (offenderIsEditor > 0 && totalOffenders > 1 || offenderIsOwner && totalOffenders >= 1)){
      testResult.sharing = 'Rule Violation. Documents with Teacher Ownership must be shared as View Only for Offenders'
      console.log(testResult)
      for(var e = 0; e < editors.length; e++){
        //Set Editor to Viewer
        if(offenders.indexOf(editors[0].email) !=-1){
            await updatePermission(file.id, editors[e].id, owners[0].email, 'reader')
                        
            console.log('Set view permission for: ', editors[e].email, ' id: '+editors[e].id)
        }    
      }
    }
  
    return testResult
  
  }

const checkSharing = async () => {
    console.log('Starting App '+ new Date().toISOString())
    
    const offenders = await listUsersInOu('/Edu.chrome.drc.ohio.gov/SB Inmate Internet/Users/Offenders')
    const staff = await listUsersInOu('/Edu.chrome.drc.ohio.gov/SB Inmate Internet/Users/Staff/ODRC Teachers/00SB Meetings SB/0SB2 Teachers Users')

    console.log('Count Offenders: '+ offenders.length)
    console.log('Count Staff: '+ staff.length)   

    for(var u = 0; u < staff.length; u++){ 
        var user = staff[u]
        console.log('+++++++++++++++++++')
        const classEmails = await getClassEmails(user)
        var userFiles = await listFilesByUser(user)
        console.log(userFiles.length +" Files for:" + user)
        userFiles.forEach(function(file){
            console.log('--------------')
            console.log('File Name: '+ file.name)
            console.log('File ID: '+ file.id)
            getSharing(file, staff, offenders, classEmails) 
        })
        //console.log(userFiles)
    }


    //Testing function
    // var userFiles = await listFilesByUser('scan.offender.files@chrome.drc.ohio.gov')
    // userFiles.forEach(function(file){
    //     console.log(file.name)
    // })
    
}

module.exports = { checkSharing }
