const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const config = require('../config/s3.config');
const stream = require('stream');

const s3Client = new S3Client({
    region: config.AWS_REGION,
    credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    },
});

const uploadToS3 = async (buffer, bucket, key) => {
    const pass = new stream.PassThrough();
    pass.end(buffer);

    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: bucket,
            Key: key,
            Body: pass,
        },
    });

    try {
        await upload.done();
        console.log('Upload successful:', key);
    } catch (err) {
        console.error('Error uploading to S3:', err);
    }
};

const storage = multer.memoryStorage();

const upload = multer({
    storage,
}).fields([
    { name: 'singlefile', maxCount: 1 },
    { name: 'multiplefiles', maxCount: 5 },
]);

const handleFileUploads = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (req.files) {
            const uploadPromises = [];

            if (req.files.singlefile) {
                const file = req.files.singlefile[0];
                const key = `single/${file.originalname}`;
                uploadPromises.push(uploadToS3(file.buffer, config.AWS_BUCKET_NAME, key));
            }

            if (req.files.multiplefiles) {
                req.files.multiplefiles.forEach((file) => {
                    const key = `multiple/${file.originalname}`;
                    uploadPromises.push(uploadToS3(file.buffer, config.AWS_BUCKET_NAME, key));
                });
            }

            try {
                await Promise.all(uploadPromises);
                res.status(200).send('Files uploaded successfully');
            } catch (uploadError) {
                res.status(500).send('Error uploading files');
            }
        } else {
            res.status(400).send('No files uploaded');
        }
    });
};

module.exports = handleFileUploads;
