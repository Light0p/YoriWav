const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(/function isValidPresence\(data\) \{[\s\S]*?\}/, `function isValidPresence(data) {
      return data.keys().hasAll(['uid', 'displayName', 'photoUrl', 'joinedAt'])
        && data.keys().size() == 4
        && data.uid is string && data.uid.size() <= 128 && data.uid == request.auth.uid
        && data.displayName is string && data.displayName.size() <= 128
        && data.photoUrl is string && data.photoUrl.size() <= 500
        && data.joinedAt is number
       ;
    }`);

fs.writeFileSync('firestore.rules', code);
