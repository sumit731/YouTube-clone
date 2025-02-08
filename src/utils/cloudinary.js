const cloudinary = require('cloudinary.v2');
const fs = require('fs');

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        });
        console.log("File is uploaded on cloudinary", response.url)
    }
    catch(error){
        fs.unlinkSync(localFilePath);//remove the locally saved temorary file after got file upload operation failed
        return null;
    }
}

module.exports = {uploadOnCloudinary}