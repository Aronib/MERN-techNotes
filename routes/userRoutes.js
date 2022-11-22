const express = require('express')
const { post } = require('./root')
const router = express.Router()
const usersController = require('../controllers/usersControllers')

router.route('/')
    .get(usersController.getAllUser)
    .post(usersController.createNewUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

module.exports = router