const moment = require('moment');

const { sendServerError, authError } = require('../functions/errors');
const models = require('../models/models');

const uploadBreak = 10;
const maxNameLength = 40;

const checkAuth = (req, res, next) => {
    if(req.isAuthenticated()){
        next()
    } else {
        return authError(res)
    }
}

const getTime = () => {return Math.floor(Date.now()/1000)}
const getTimeSince = (time) => {
    if(time) return getTime() - time
    else return null
}

const templateAccessAuth = (res, user, temp, cb) => {
    try {        
        if(user.id == temp.author.id || user.permissions === 'all'){
            cb()
        } else {
            res.status(401).json({ msg: 'Not authorized' })
        }
    } catch (err) {
        sendServerError(res, err)
    }
}

const createTemplate = (req, res) => {
    const user = req.user;
    const template = req.body;

    if(!template.name) return res.status(400).json({msg: "No template data."})

    const timeSinceLastUpload = getTimeSince(user.lastUploadTimestamp)
    if(timeSinceLastUpload && timeSinceLastUpload < uploadBreak)
        return res.status(401).json({msg: "A bit slower, please."})

    if(template.name.length > maxNameLength)
        return res.status(401).json({msg: `Template name too long (max ${maxNameLength}).`})

    let autoSaveObj = {}
    const isAutoSave = template.autoSave;
    if(isAutoSave){
        autoSaveObj = { private: true }
    }

    models.Templates.create({
        ...template,
        ...autoSaveObj,
        author: {
            id: user.id,
            name: user.login
        }
    }, (err, createdTemp) => {
        if(err) return sendServerError(res, err);

        lastUploadTimestamp = getTime();

        let userUpdateObj = {
            '$push': {
                'templates': createdTemp.id
            }
        };

        if(isAutoSave){
            userUpdateObj.autoSave = createdTemp.id;
        } else { 
            userUpdateObj.lastUploadTimestamp = lastUploadTimestamp;
        }

        models.Users.updateOne({_id: user.id},
            {
                ...userUpdateObj,
            },

            (err, updatedUser) => {
                if(err) return console.log(err);

                res.json(createdTemp)
            }
        )
    })
}

const updateTemplate = (req, res) => {
    const { user, body } = req;
    const { mode, autoSave } = body;

    try {
        let tempIdToSearchBy = null;
        
        if(autoSave){
            tempIdToSearchBy = user.autoSave;
        }
        else tempIdToSearchBy = req.params.id;

        models.Templates.findById(tempIdToSearchBy, (err, temp) => {
            if(err) return sendServerError(res, err)

            if(!temp && autoSave){
                createTemplate(req, res)
            } else if(autoSave){
                models.Templates.updateOne({_id: user.autoSave},
                    {
                        template: body.template,
                        timestamp: Date.now()
                    },
                    (err, updatedTemp) => {
                        if(err) console.log(err);
                        // console.log(updatedTemp.n)
                    }
                )

                models.Templates.find(
                    {autoSave: true, 'author.id': user.id},
                ).sort({timestamp: 'asc'})
                    .exec((err, saves) => {
                        if(err) console.log(err);
                        // console.log(saves);
                    })
            } else {
                templateAccessAuth(res, user, temp, () => {
                    const updateUser = (updatingTempValue = null, send = true) => {
                        return new Promise((resolve, reject) => {
                            models.Users.updateOne({_id: user.id},
                                {updatingTemplate: updatingTempValue},
                                (err) => {
                                    if(err){
                                        if(send) sendServerError(res, err)
                                        reject(err);
                                    }
                                    if(send) res.status(200).json(temp)
                                    resolve(temp)
                                })
                        })
                    }

                    if(mode === 'init'){
                        return updateUser(temp.id)
                    } else if(mode === 'cancel'){
                        return updateUser()
                    } else if(mode === 'save'){
                        const updateUserPromise = updateUser(null, false);
                        const { template, name, private } = body;
                        let propsToEdit = {}

                        if(name && name.length < maxNameLength) propsToEdit.name = name;
                        
                        const updateTempPromise = new Promise((resolve, reject) => {
                            models.Templates.updateOne({_id: req.params.id},
                                { template, private, ...propsToEdit },
                                (err, data) => {
                                    if(err) reject(err)
                                    resolve({msg: `Updated ${temp.name}`})
                                }
                            )
                        })

                        Promise.all([updateUserPromise, updateTempPromise]).then(vals => {
                            const msg = vals[1].msg;
                            return res.status(200).json({ msg });
                        }).catch(err => {
                            return sendServerError(res, err)
                        })
                    } else return res.status(400).json({msg: 'Mode not specified'})
                })
            }
        })
    } catch(err) {
        return sendServerError(res, err)
    }
}

module.exports = app => {
    app.get('/', (req, res) => {
        res.send('bot backend')
    })
    
    app.get('/templates', (req, res) => {
        try {
        const query = req.query;
        const user = req.user;
        
        let searchParams = {}

        if(req.user){
            if(query.myTemplates == true) searchParams['author.name'] = req.user.login;
        }
        if(query.search) searchParams.name = new RegExp(query.search, 'i');
        
        models.Templates.find(searchParams)  
            .sort({timestamp: -1})
            .lean()
            .exec((err, data) => {
                if(err) return sendServerError(res, err);

                for(let i=0; i<data.length; i++){
                    let template = data[i];
                    
                    if(template.private && (!user || (user && template.author.id !== user.id))){
                        data[i] = null
                    } else {
                        const createdAt = moment(template.timestamp, 'YYYYMMDD').fromNow();
                        template.timestamp = createdAt;
                    }
                }
                
                res.json(data)
            })
        } catch (err) {
            sendServerError(res, err)
        }
    })
    
    app.post('/templates', checkAuth, createTemplate)

    app.post('/templates/autoSave', checkAuth, updateTemplate)

    app.delete('/templates/:id', checkAuth, (req, res) => {
        models.Templates.findById(req.params.id, (err, temp) => {
            if(err) return sendServerError(res, err);
            
            const author = temp.author;
            const user = req.user;
            
            if(temp && author && user.id === author.id || user.permissions === 'all'){
                temp.remove((err, data) => {
                    if(err) return sendServerError(res, err);
                    res.status(200).json(data)
                })
            } else {
                return res.status(401).json({
                    msg: 'Not allowed.'
                })
            }
        })
    })

    app.delete('/temptestdel', (req, res) => {
        models.Templates.deleteMany({name: '__autosave__'}, (err, data) => {
            if(err) return sendServerError(res, err);
            
            res.status(200).json(data)
        })
    })
    
    app.get('/templates/:id', (req, res) => {
        models.Templates.findById(req.params.id, (err, data) => {
            if(err) return sendServerError(res, err);
            res.json(data)
        })
    })

    app.put('/templates/:id', checkAuth, updateTemplate)
}