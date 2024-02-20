exports.pathNotFound = (req, res, next) => {
    res.status(404).send({msg: 'path not found'});
}

exports.customError = (error, req, res, next) => {
    if(error.status && error.msg){
        res.status(error.status).send({msg: error.msg});
    } else { 
       next(error) 
    }
};