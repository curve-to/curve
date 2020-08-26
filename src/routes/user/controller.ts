import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import * as crypto from 'crypto';
import { Context } from 'koa';
import { user } from '../../config/database';
import { secret } from '../../config';

const schema = new mongoose.Schema({
  username: String,
  password: String,
  role: Number,
  uid: String,
  createdAt: String,
  email: String,
});

const UserModel = user.model('user', schema);

/**
 * validate email address
 * @param email email address
 */
const validateEmail = (email: string) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Register
 * @param ctx Context
 */
export const register = async (ctx: Context) => {
  const { username, password, email } = ctx.request.body;

  if (!validateEmail(email)) {
    ctx.throw(401, 'invalid email address');
  }

  const _user: any = await UserModel.findOne({
    username: username.toLowerCase(),
  });

  if (_user) {
    ctx.throw(401, 'the username has been taken');
  }

  const uid = crypto.randomBytes(12).toString('hex');
  const hashedPassword = bcrypt.hashSync(password, 10);

  const data = {
    username: username.toLowerCase(),
    password: hashedPassword,
    role: 0, // 0 normal user, 1 administrator
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    uid,
    email,
  };

  const newUser = new UserModel(data);
  await newUser.save();

  ctx.body = `user ${username} has successfully registered`;
};

/**
 * Login
 * @param ctx Context
 */
export const login = async (ctx: Context) => {
  const { username, password } = ctx.request.body;

  // search user from database
  const _user: any = await UserModel.findOne({
    username: username.toLowerCase(),
  });

  // validate password
  let hasUser = false;
  const validateUser = () => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, _user.password, (err, result) => {
        if (err) reject(err);
        hasUser = result;
        resolve();
      });
    });
  };

  if (_user) {
    await validateUser();

    // generate token if account info matches
    if (hasUser) {
      const { username, role, uid } = _user;
      const token = jwt.sign({ username, role, uid }, secret, {
        expiresIn: '365d',
      });

      const result = { token, user: { name: username, role, uid } };
      ctx.body = result;
      return;
    }
  }

  ctx.throw(401, 'username and password mismatch');
};

/**
 * Change password
 * @param ctx Context
 */
export const changePassword = async (ctx: Context) => {
  const { username, password, email } = ctx.request.body;

  if (!validateEmail(email)) {
    ctx.throw(401, 'invalid email address');
  }

  const _user: any = await UserModel.findOne({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
  });

  if (_user) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const update = { password: hashedPassword };
    await UserModel.findOneAndUpdate({ username }, update);
    ctx.body = 'ok';
  } else {
    ctx.throw(401, `user ${username} is not found`);
  }
};
