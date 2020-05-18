const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const templatesSchema = new Schema({
    name: String,
    author: Object,
    timestamp: {
        type: Date,
        default: Date.now
    },
    template: Object,
    private: {
        type: Boolean,
        default: false
    },
    autoSave: {
        type: Boolean,
        default: false
    }
})

templatesSchema.pre(['remove'], function(next){
    setTimeout(() => {
        Users.updateOne({_id: this.author.id},
            { '$pull': { templates: this._id } },
            (err, pullInfo) => {
                if(err) next(err)
                if(!pullInfo.n) next(`Cannot remove ${this.name} from 'templates' of user`)
                else next()
            }
        )
    }, 1000)
})

const Templates = mongoose.model('Templates', templatesSchema)


const usersSchema = new Schema({
    login: {
        type: String,
        unique: true
    },
    password: String,
    permissions: String, // all or standard
    lastUploadTimestamp: Number,
    templates: [{ type: ObjectId, ref: 'Templates'}],
    autoSave: { type: ObjectId, ref: 'Templates'},
    updatingTemplate: ObjectId
})

usersSchema.plugin(uniqueValidator)

const Users = mongoose.model('Users', usersSchema, 'users')

module.exports = {
    Templates,
    Users
}