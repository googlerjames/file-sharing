
 # THIS IS SAMPLE CODE
 
  Copyright 2022 Google
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
  http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  
  Authored by James Ferreira
 

# Project Description
The code is a script that checks the sharing permissions of documents in a Google Drive. It is used to make sure that offenders have the appropriate permission.

The script first lists all of the offenders and staff members in specific organizational units (OUs). It then lists all of the files that each staff member has access to. Finally, it checks the sharing permissions of each file to make sure that offenders are only able to view documents, and not edit or own them.

If the script finds any violations of the sharing policy, it will print a message to the console and take corrective action. For example, if it finds that an offender is an editor of a document, it will remove them from the editor role and give them the viewer role instead.

Here are some of the key functions in the code:

- listUsersInOu(): This function lists all of the users in an OU.
- listFilesByUser(): This function lists all of the files that a user has access to.
- getSharing(): This function checks the sharing permissions of a file.
- deletePermission(): This function deletes a permission for a given user and file.
- updatePermission(): This function updates a permission for a given user and file.

# Sharing Policies
The sharing policies are as follows:

- Multiple Offenders can only view shared documents. They cannot edit or own documents shared with other Offenders.
- Staff can edit and own documents.
- Class emails cannot be editors.
- If a document is owned by a staff member and has any offenders as editors, the offenders will be downgraded to viewers.

# Setup
- Clone the repo
- Create a GCP Project
- Enable Drive, Classroom and Admin SDK APIs
- Grant Domain Wide Auth in Workspace
- Allow API usage in Drive App
- download the privatekey.json and put it in the root
- Modify the Customer Settings at the beginning of the index.js file
```
npm install
run-func index.js checkSharing
```