const Person = require('../models/person')

const getAll = () => {
    return Person.find({})
}

const get = (id) => {
    return Person.findById(id)
}

const remove = (id) => {
    return Person.findByIdAndDelete(id)
}


const add = person => {
  return person.save()
}


const update = (id, person) => {
  return Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query'})
}

module.exports = { getAll, get, add, remove, update }