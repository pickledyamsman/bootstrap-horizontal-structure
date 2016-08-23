var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    index: true, // allows email to be indexed, useful if it will be queried a lot
    match: /.+\@.+\..+/ //makes sure email matches regrex name@email.com
  },
  username: {
    type: String,
    trim: true,
    unique: true, //makes sure username is unique in db
    required: true // it is required before mongoose will save it to the db
  },
  password: {
    type: String,
    validate: [ // checks condition length >= 6 if false sends error message
      function(password) {
        return password.length >= 6;
      },
      'Password should be longer'
    ]
  },
  created: {
    type: Date,
    default: Date.now
  },
  website: {
    type: String,
    get: function(url) { // assigns http:// to url if not assigned
      if (!url) {
        return url;
      } else{
        if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
          url = 'http://' + url;
        }

        return url;
        }
    }
  }
});

mongoose.model('User', UserSchema);
UserSchema.set('toJSON', { getters: true });
