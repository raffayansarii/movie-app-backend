const Joi = require('joi');
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});
const movieSchema = Joi.object({
  title: Joi.string().required(),
  publishing_date: Joi.date().required(),
  description: Joi.string().required()
});
module.exports ={
  loginSchema,
  signupSchema,
  movieSchema
}
