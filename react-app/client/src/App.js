import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';
import './footer.css';

const App = () => (
  <div className='container mt-4'>
    <h4 className='display-4 text-center mb-4'>
      <i className='fas fa-atom' /> Online Object Detector
    </h4>

    <p>
    Web based tool for object detection using the YOLO (You Only Look Once) algorithm. It allows users to upload images or videos and detects objects present within them. By leveraging deep learning and computer vision techniques, the application accurately identifies and localizes multiple objects in real-time. 
    </p>
    

    <FileUpload />

    <footer>
		<div class="wrap-footer-content">
			<div class="coppy-right-box">
				<div class="container">
					<div class="coppy-right-item item-left">
						<p class="coppy-right-text">Copyright © 2023</p>
					</div>
          <div class="coppy-right-item item-right">
						<div class="wrap-nav horizontal-nav">
							<ul>
								<li class="menu-item"><a href="privacy-policy.html" class="link-term">Repository</a></li>
								<li class="menu-item"><a href="return-policy.html" class="link-term">Notebook</a></li>								
                <li class="menu-item"><a href="terms-conditions.html" class="link-term">Dataset</a></li>
              </ul>
						</div>
					</div>
					<div class="clearfix"></div>
				</div>
			</div>
		</div>
	</footer>

  </div>
);

export default App;
