import React, { Fragment, useState, useEffect } from 'react';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';
import { MultiSelectComponent } from '@syncfusion/ej2-react-dropdowns';
import { Button } from 'reactstrap';

const Spinner = () => {
  return <div className="spinner"></div>;
};

const FileUpload = () => {
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [uploadedFile, setUploadedFile] = useState({});
  const [detectedFile, setDetectedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDetect, setIsDetect] = useState(false);
  const [detect_objects, setObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const onObjectSelection = (e) => {
    setSelectedObjects(e.value);
  };

  useEffect(() => {
    setIsLoading(isDetecting);
  }, [isDetecting]);

  const onChange = (e) => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const onUpload = async (e) => {
    e.preventDefault();
    
    setIsDetecting(false);
    setIsUploading(true);
    setIsDetect(false);
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const res = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          setUploadPercentage(
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          );
        },
        onDownloadProgress: (progressEvent) => {
          setUploadPercentage(
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          );
        },
      });
  
      setTimeout(() => setUploadPercentage(0), 10000);
  
      const { fileName, filePath, objects } = res.data;
      setUploadedFile({ fileName, filePath });
      setSelectedFile(filePath);
      setObjects(objects);
      setMessage('File Uploaded');
  
      setDetectedFile({});
    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.msg);
      }
      setUploadPercentage(0);
    } finally {
      setIsUploading(false);
    }
  };
  
  const onDetect = async (e) => {
    e.preventDefault();
    
    setIsUploading(false);
    setIsDetecting(true);
    setIsDetect(true);
  
    const objectsToDetect = [...selectedObjects];
  
    try {
      const response = await fetch(uploadedFile.filePath);
      const fileData = await response.blob();
  
      const mimeType = uploadedFile.filePath.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
      const newFile = new File([fileData], uploadedFile.fileName, { type: mimeType });
  
      const formData = new FormData();
      formData.append('file', newFile);
      formData.append('objects', JSON.stringify(objectsToDetect));
  
      const res = await axios.post('/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          setUploadPercentage(
            parseInt((progressEvent.loaded * 100) / progressEvent.total)
          );
        },
      });
  
      setTimeout(() => setUploadPercentage(0), 10000);
  
      const { fileName, filePath } = res.data;
  
      setDetectedFile({ fileName, filePath });
      setSelectedFile(filePath);
      setMessage('Objects Detected');
    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.msg);
      }
      setUploadPercentage(0);
    } finally {
      setIsDetecting(false);
    }
  };
  
  const renderFilePreview = (filePath) => {
    if (filePath.toLowerCase().endsWith('.mp4')) {
      return (
        <video key={filePath} style={{ width: '100%' }} controls>
          <source src={filePath} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <img style={{ width: '100%' }} src={filePath} alt="" />
      );
    }
  };
  

  const renderFileOverview = (filePath) => {
    const handleClick = () => {
      setIsUploading(false);
      setIsDetecting(false);
      setSelectedFile(filePath);
    };

    const isActive = selectedFile === filePath;

    const containerStyle = {
      width: '100%',
      transition: 'opacity 0.3s',
      opacity: isActive ? '1' : '0.5'
    };

    if (filePath.toLowerCase().endsWith('.mp4')) {
      return (
        <video
          style={containerStyle}
          muted
          onClick={handleClick}
        >
          <source src={filePath} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <img
          style={containerStyle}
          src={filePath}
          alt=""
          onClick={handleClick}
        />
      );
    }
  };

  return (
    <Fragment>
      {message ? <Message msg={message} /> : null}
      <form onSubmit={onUpload}>
        <div className="custom-file mb-2">
          <input
            type="file"
            className="custom-file-input"
            id="customFile"
            onChange={onChange}
          />
          <label className="custom-file-label" htmlFor="customFile">
            {filename}
          </label>
        </div>

        {isUploading && <Progress percentage={uploadPercentage} />}

        <Button
          type="submit"
          block
          className="mt-2 button-31"
          disabled={isUploading || isDetecting}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>

      {uploadedFile && Object.keys(uploadedFile).length !== 0 ? (
        <div className="row mt-4">

<div className="col-md-8 mt-2 file-preview">
            <div className="spinner-container">
              {isLoading ? (
                <Spinner />
              ) : selectedFile ? (
                renderFilePreview(selectedFile)
              ) : detectedFile && Object.keys(detectedFile).length !== 0 ? (
                renderFilePreview(detectedFile.filePath)
              ) : uploadedFile && Object.keys(uploadedFile).length !== 0 ? (
                renderFilePreview(uploadedFile.filePath)
              ) : null}
            </div>
          </div>

          <div className="col-md-4">
           

            <div className="row list mt-2 mb-3">
              {!isDetect ? (
                <div className="col-md-12 col-sm-12 col-12 col-lg-12 uploaded active">
                  <label htmlFor="" className="mb-2">Uploaded file</label>
                  {renderFileOverview(uploadedFile.filePath)}
                </div>
              ) : isDetect ? (
                <Fragment>
                  <div className={`col-md-6 col-sm-6 col-6 col-lg-6 uploaded ${selectedFile === uploadedFile.filePath ? 'active' : ''}`}>
                    <label htmlFor="" className="mb-2">Uploaded file</label>
                    {renderFileOverview(uploadedFile.filePath)}
                  </div>
                  <div className={`col-md-6 col-sm-6 col-6 col-lg-6 detected ${selectedFile === detectedFile.filePath ? 'active' : ''}`}>
                    <label htmlFor="" className="mb-2">Detected file</label>
                    {isLoading ? (
                      <div className="spinner-container">
                        <Spinner />
                      </div>
                    ) : detectedFile && Object.keys(detectedFile).length !== 0 ? (
                      renderFileOverview(detectedFile.filePath)
                    ) : null}
                  </div>
                </Fragment>
              ) : null}
            </div>

            <form onSubmit={onDetect}>
              <div style={{ margin: 0, width: '100%' }}>
                <label htmlFor="objectsToDetect" className="mb-3">
                  Objects to Detect
                </label>

                <MultiSelectComponent
                  id="objectsToDetect"
                  placeholder="Select objects"
                  dataSource={detect_objects}
                  fields={{ value: 'id', text: 'name' }}
                  onChange={onObjectSelection}
                  value={selectedObjects}
                ></MultiSelectComponent>
              </div>
              <Button
                type="submit"
                block
                className="mt-4 button-4"
                disabled={isDetecting || isUploading}
              >
                {isDetecting ? 'Processing...' : 'Detect'}
              </Button>
            </form>

          </div>
         
        </div>
      ) : null}
    </Fragment>
  );
};

export default FileUpload;