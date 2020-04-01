const moment = require('moment')

const { sendServerError, authError } = require('../functions/errors')
const models = require('../models/models')

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

const templateAccessAuth = (user, temp, cb) => {
    try {        
        if(user.id == temp.author.id || user.permissions === 'all'){
            cb()
        } else {
            res.status(401).json({ msg: 'Not authorized' })
        }
    } catch (err) {
        console.log(err);
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
    
    app.post('/templates', checkAuth, (req, res) => {
        const uploadBreak = 0;
        const maxNameLength = 20

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
        }, (err, data) => {
            if(err) return sendServerError(res, err);

            lastUploadTimestamp = getTime();

            let updateObj = {};
            if(isAutoSave){
                updateObj = {autoSave: data.id};

                models.Templates.find({'author.id': user.id, autoSave: true})
                .sort({timestamp: -1})
                .exec((err, autoSaves) => {
                    if(err) return console.log(err);
                    
                    if(autoSaves.length){ // if there is at least one autosave
                        const autoSave = autoSaves[1] // choose oldest autosave
                        if(autoSave && autoSave.name){
                            autoSave.remove((err, autoSaves) => {
                                if(err) return console.log(err);
                            })
                        }
                    }
                })
            } else { 
                updateObj = {
                    '$push': {
                        'templates': data.id
                    }
                }
            }

            models.Users.updateOne({_id: user.id},
                {
                    lastUploadTimestamp, 
                    ...updateObj,
                },
                //todo push to autosave array
                //todo   and pull (remove) when deleted
                (err, data) => {
                    if(err) return console.log(err);
                }    
            )

            res.json(data)
        })
    })

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

    app.put('/templates/:id', checkAuth, (req, res) => {
        try {
            models.Templates.findById(req.params.id, (err, temp) => {
                if(err) return sendServerError(res, err)
                const { user, body } = req;
                const mode = body.mode;

                templateAccessAuth(user, temp, () => {
                    const updateUser = (updatingTempValue = null, send = true) => {
                        return new Promise((resolve, reject) => {
                            models.Users.updateOne({_id: user.id},
                                {updatingTemplate: updatingTempValue},
                                (err) => {
                                    if(err){
                                        if(send) sendServerError(res, err)
                                        reject(err);
                                    }
                                    if(send) res.status(200).json({ name: temp.name })
                                    resolve({name: temp.name})
                                })
                        })
                    }
                    
                    if(mode === 'init'){
                        return updateUser(temp.id)
                    } else if(mode === 'cancel'){
                        return updateUser()
                    } else if(mode === 'save'){
                        const updateUserPromise = updateUser(null, false);
                        
                        const updateTempPromise = new Promise((resolve, reject) => {
                            models.Templates.updateOne({_id: req.params.id},
                                {template: body.template},
                                (err, data) => {
                                    if(err) reject(err)
                                    resolve({msg: `Updated ${temp.name}`})
                                }
                            )
                        })

                        Promise.all([updateUserPromise, updateTempPromise]).then(vals => {
                            const [{msg}] = vals;
                            return res.status(200).json({ msg });
                        }).catch(err => {
                            return sendServerError(res, err)
                        })
                    } else return res.status(400).json({msg: 'Mode not specified'})
                })
            })
        } catch(err) {
            return sendServerError(res, err)
        }
    })
}