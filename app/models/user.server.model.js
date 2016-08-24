var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    //index: true,- allows email to be indexed, useful if it will be queried a lot
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
        return password && password.length >= 6;
      }, 'Password should be longer'
    ]
  },
  salt: { // hashes password
    type: String
  },
  provider: { // indicate strategy used to register the user
    type: String,
    required: 'Provider is required'
  },
  providerId: String, // indicates user identifier for authentication strategy
  providerData: {}, // store user object retrieved from OAuth provider
  created: {
    type: Date,
    default: Date.now
  }
});

UserSchema.virtual('fullName').get(function() {
  return this.firstName + ' ' + this.lastName;
}).set(function(fullName) {
  var splitName = fullName.split(' ');
  this.firstName = splitName[0] || '';
  this.lastName = splitName[1] || '';
});

UserSchema.pre('save', function(next) { // hashes users' passwords
  if (this.password) {
    this.salt = new
      Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

UserSchema.methods.hashPassword = function(password) { // replaces password with hashed version
  return crypto.pbkdf2Sync(password, this.salt, 10000,
    64).toString('base64');
};

UserSchema.methods.authenticate = function(password) { // accepts string, hashes it, compares to hashed password
  return this.password === this.hashPassword(password);
};

UserSchema.statics.findUniqueUsername = function(username, suffix,
  callback) { // finds available unique username for new users
  var _this = this;
  var possibleUsername = username + (suffix || '');

  _this.findOne({
    username: possibleUsername
  }, function(err, user) {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) +
          1, callback);
      }
    } else {
      callback(null);
    }
  });
};

UserSchema.set('toJSON', {
  getters: true,
  virtuals: true
});

mongoose.model('User', UserSchema);
