const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cd){
        cd(null, "./public/temp")
    },
    filename: function(req, file,cd){
        // We are using the filename that the user uploaded the file with
        cd(null, file.originalname)
    }

})
const upload = multer({storage: storage});
module.exports = {upload};