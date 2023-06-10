const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();

app.use(fileUpload());

// Upload Endpoint
app.post('/upload', async (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;

  // Check if the uploaded file is an image or video
  if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
    return res.status(400).json({ msg: 'Only image or video files are allowed' });
  }

  file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  });

  try {
    const response = await axios.get('http://localhost:5000/getallobjects');
    const objects = response.data;
     // Display objects in the terminal
    res.json({
      fileName: file.name,
      filePath: `/uploads/${file.name}`,
      objects: objects,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }

});


// Upload Endpoint
app.post('/detect', async (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file Selected' });
  }

  const file = req.files.file;

  const { objects } = req.body;
  const selectedObjects = JSON.parse(objects);
  console.log(selectedObjects);


  // Check if the uploaded file is an image or video
  if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
    return res.status(400).json({ msg: 'Only image or video files are allowed' });
  }

  // Check if at least one object is selected
  if (!selectedObjects || selectedObjects.length === 0) {
    return res.status(400).json({ msg: 'Please select at least one object' });
  }

  try {
    // Send the file to the Flask API using form-data
    const formData = new FormData();
    formData.append('file', file.data, file.name);
    formData.append('objects', JSON.stringify(selectedObjects));

    const response = await axios.post('http://localhost:5000/', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      responseType: 'arraybuffer', // Set the response type to arraybuffer
    });


    const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');
const hours = String(currentDate.getHours()).padStart(2, '0');
const minutes = String(currentDate.getMinutes()).padStart(2, '0');
const seconds = String(currentDate.getSeconds()).padStart(2, '0');
const formattedDate = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

const processedFileName = `${formattedDate}_${file.name}`;
const processedFilePath = `${__dirname}/client/public/result/${processedFileName}`;


    // Create a new file from the response data
    fs.writeFileSync(processedFilePath, response.data, 'binary');

    res.json({ fileName: file.name, filePath: `/result/${processedFileName}`});
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

app.listen(6000, () => console.log('Server Started...'));
