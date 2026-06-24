const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

module.exports = new BaseModel('Caregiver', {
  id: Joi.number(),
  password: Joi.string().required() 
});