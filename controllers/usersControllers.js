const User = require('../models/User')
const Note = require ('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const { json } = require('express')

// @

const getAllUser = asyncHandler (async (req, res)=>{
    const users = await User.find().select('-password').lean()
    if (!users){
        return res.status(400).json({message: 'No usersfound'})
    }
    res.json(users)
})
const createNewUser = asyncHandler (async (req, res)=>{
    const {username, password, roles} = req.body

    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'All fields required'})
    }
    //check for duplicate
    const duplicate = await User.findOne({username}).lean().exec()

    if(duplicate){
        return res.status(409).json({message: 'Duplicate Username'})
    }

    //Hash Password
    const hashedPwd = await bcrypt.hash(password, 10) //salt rounds

    const userObject = {username, "password": hashedPwd, roles}

    //create and store new users

    const user = await User.create(userObject)

    if (user) {
        res.status(201).json({message: `New ${username} created`})
    } else {
        res.status(400).json({message: 'Invalid user data received'})
    }
})
const updateUser = asyncHandler (async (req, res)=>{
    const {id, username, roles, active, password} = req.body
    //confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !=='boolean') {
        return res.status(400).json({message: 'All fields required'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message: 'user not found'})
    }

    const duplicate = await User.findOne({username}).lean().exec()

    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'duplicate usernam'})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }

    const updateUser = await user.save()

    res.json ({message: `${updateUser.username} updated` })
})

const deleteUser = asyncHandler (async (req, res)=>{
    const {id} = res.body

    if (!id) {
        return res.status(400).json({message: 'User ID required'})
    }

    const note = await Note.findOne({user: id}).lean().exec()

    if(note) {
        return res.status(400).json({message: 'User has assigned notes'})
    }

    const user = await User.findOne(id).lean().exec()

    if (!user) {
        return res.status(400).json({message: 'User not found'})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUser,
    createNewUser,
    updateUser,
    deleteUser
}