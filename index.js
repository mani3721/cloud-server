const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000 * 1000 * 1000 * 2 } // 2GB limit
});

// Ensure the uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Home page with upload form and list of files
app.get('/', (req, res) => {
    fs.readdir('uploads', (err, files) => {
        if (err) {
            files = [];
        }
        res.render('index', { files: files, request: req });
    });
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    res.redirect('/');
});

// Endpoint to generate shareable link
app.get('/share/:filename', (req, res) => {
    const fileName = req.params.filename;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    res.render('share', { fileUrl: fileUrl });
});

// Endpoint for file preview and download page
app.get('/file/:filename', (req, res) => {
    const fileName = req.params.filename;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    const ext = path.extname(fileName).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    res.render('file', { fileName: fileName, fileUrl: fileUrl, isImage: isImage });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
