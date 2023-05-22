const { aws } = require('../config');
const awsSdk = require('aws-sdk');

const s3 = new awsSdk.S3({
    accessKeyId: aws.access_key,
    secretAccessKey: aws.secret_key,
    signatureVersion: 'v4',
    region: 'ap-south-1',
});

module.exports = {
    uploadToS3: async (file_name, file_content) => {
        const params = {
            Bucket: aws.bucket_name,
            Key: file_name,
            Body: file_content,
        };

        return new Promise((resolve, reject) => {
            s3.upload(params, (error, data) => {
              if (error) {
                const { code } = error;
                reject({ error: 'file upload', reason: code });
              }
              resolve({ status_code: 200, status_message: 'Upload file successful', result: data });
            });
          }).catch((error) => {
            return { status_code: 500, error: 'file upload', reason: error };
          });
    },

    
  deleteFileFromS3: async (file_name) => {
    
    const params = {
      Bucket: aws.bucket_name,
      Key: file_name,
    };

    try {
      s3.deleteObject(params, function (error, data) {
        if (error) {
          return { status_code: 500, status_message: error };
        }
        return { status_code: 200, status_message: 'Delete successful' };
      });
    } catch (error) {
      return { status_code: 500, status_message: error };
    }
  },

  dowloadFileFromS3: async (filePath) => {
    
    const download_params = {
      Bucket: aws.bucket_name,
      Key: filePath,
    };

    try {
      const { Body } = await s3.getObject(download_params).promise();
      return Body;
    } catch (error) {
      return { status_code: 500, status_message: error };
    }
  },

  getPreSignedUrl: async (filePath) => {
    
    try {
      const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: aws.bucket_name,
        Key: filePath,
        Expires: 3600,
        ResponseContentType: 'image/png, image/jpg',
      });
      return url;
    } catch (error) {
      return { status_code: 500, status_message: error };
    }
  },
};