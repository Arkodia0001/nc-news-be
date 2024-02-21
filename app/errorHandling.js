exports.pathNotFound = (req, res, next) => {
    res.status(404).send({msg: 'path not found'});
}
exports.badRequestError = (error, req, res, next) =>{
    if(error.code === '23502' || error.code === '22P02'){
        res.status(400).send({msg: 'Bad Request'});
    } else { 
       next(error);
    }
}

exports.customError = (error, req, res, next) => {
    if(error.status && error.msg){
        res.status(error.status).send({msg: error.msg});
    } else { 
       next(error) 
    }
};
