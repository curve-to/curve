import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import * as crypto from 'crypto';
import * as _ from 'underscore';
import fetch from 'node-fetch';
import { Context } from 'koa';
import { collections } from '../../config/database';
import config from '../../config';
import { THIRD_PARTY_URLS } from '../../config/constants';
import { decodeJwt } from '../../middleware/auth';

const schema = new mongoose.Schema(
  {
    username: String,
    password: String,
    role: Number,
    createdAt: String,
    email: String,
    openid: String,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Generate virtual field 'id' that returns _id.toString()
schema.virtual('uid').get(function () {
  return this._id;
});

export const UserModel = collections.model('users', schema);

/**
 * validate email address
 * @param email email address
 */
const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Register as new user
 * @param username username
 * @param hashedPassword required when using username && password as login method
 * @param email required when using username && password as login method
 */
const registerAsNewUser = async ({
  username = '',
  hashedPassword = null,
  email = '',
  openid = '',
} = {}) => {
  let data: genericObject = {
    role: 0, // 0 normal user, 1 administrator
    createdAt: moment().unix(),
  };

  // register with username and password
  if (!openid) {
    data = {
      username: username.toLowerCase(),
      password: hashedPassword,
      email,
      ...data,
    };
  } else {
    // register with WeChat open id
    data = {
      openid,
      ...data,
    };
  }

  const newUser = new UserModel(data);
  await newUser.save();
};

/**
 * Generate JWT token
 * @param username
 * @param role
 * @param uid
 */
const generateJWTToken = (user: genericObject) => {
  const { role, uid } = user;
  const token = jwt.sign({ role, uid }, config.database.SECRET, {
    expiresIn: config.tokenExpiration,
  });

  const { exp: expiredAt } = <genericObject>jwt.decode(token);

  const result = {
    token,
    user: _.omit(user.toJSON(), ['_id', '__v', 'password']),
    expiredAt,
  };

  return result;
};

/**
 * Register
 * @param ctx Context
 */
export const register = async (ctx: Context): Promise<void> => {
  if (!config.registrationIsOpen) {
    ctx.throw(403, 'registration is not open');
  }

  const { username, password, email } = ctx.request.body;

  if (!validateEmail(email)) {
    ctx.throw(403, 'invalid email address');
  }

  const _user = await UserModel.findOne({
    username: username.toLowerCase(),
  });

  if (_user) {
    ctx.throw(403, 'the username has been taken');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  await registerAsNewUser({ username, hashedPassword });

  ctx.body = `user ${username} has successfully registered`;
};

/**
 * Login
 * @param ctx Context
 */
export const login = async (ctx: Context): Promise<void> => {
  const { username, password } = ctx.request.body;

  // search user from database
  const _user = await UserModel.findOne({
    username: username.toLowerCase(),
  });

  // validate password
  let hasUser = false;
  const validateUser = () => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, _user['password'], (err, result) => {
        if (err) reject(err);
        hasUser = result;
        resolve(!!hasUser);
      });
    });
  };

  if (_user) {
    await validateUser();

    // generate token if account info matches
    if (hasUser) {
      const result = generateJWTToken(_user);
      ctx.body = result;
      return;
    }
  }

  ctx.throw(403, 'username and password mismatch');
};

/**
 * Change password
 * @param ctx Context
 */
export const changePassword = async (ctx: Context): Promise<void> => {
  const { username, password, email } = ctx.request.body;

  if (!validateEmail(email)) {
    ctx.throw(403, 'invalid email address');
  }

  const _user = await UserModel.findOne({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
  });

  if (_user) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const update = { password: hashedPassword };
    await UserModel.findOneAndUpdate({ username }, update);
    ctx.body = 'ok';
  } else {
    ctx.throw(
      403,
      `user ${username} is not found or the email given and username mismatch`
    );
  }
};

/**
 * Sign in with WeChat
 * @param ctx Context
 */
export const signInWithWeChat = async (ctx: Context): Promise<void> => {
  const { code } = ctx.query;

  const appId = ctx.get('appid');
  const appSecret = config['appIds'][appId];

  if (!appId || !appSecret) {
    ctx.throw(
      403,
      'App Id is not found. Make sure your app has been registered.'
    );
  }

  const query = `?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
  const code2Session = `${THIRD_PARTY_URLS.WECHAT_LOGIN}${query}`;
  const response = await fetch(code2Session);

  const { errcode, errmsg, openid } = await response.json();

  if (!openid) {
    ctx.throw(403, `Login failed. errcode: ${errcode}. ${errmsg}`);
  }

  const user = await UserModel.findOne({ openid });
  // If user is not found, create a new one
  if (!user) {
    await registerAsNewUser({ openid });
  }

  const _user = user || (await UserModel.findOne({ openid }));
  const result = generateJWTToken(_user);
  ctx.body = result;
};

/**
 * Update WeChat user info
 * @param ctx Context
 */
export const updateWeChatUserInfo = async (ctx: Context): Promise<void> => {
  const { userInfo } = ctx.request.body;
  const { uid } = decodeJwt(ctx);

  console.log('uid - ', uid);

  if (!uid) {
    ctx.throw(403, 'You have to sign in to use this feature.');
  }

  const update: genericObject = [
    {
      $set: Object.assign(userInfo, {
        updatedAt: moment().unix(),
        updatedBy: uid,
      }),
    },
  ];

  await UserModel.updateOne({ _id: uid }, update);
  const user = await UserModel.findOne({ _id: uid });
  ctx.body = _.omit(user.toJSON(), ['_id', '__v', 'password']);
};
