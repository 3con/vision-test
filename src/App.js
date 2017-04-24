import React, { Component } from 'react';
import aws from 'aws-sdk';
import aws_config from '../aws_config.json';

import './App.css';

aws.config.update(aws_config);

class App extends Component {
  constructor() {
    super();

    this.state = {};
  }

  handleImageChange(e) {
    console.log("file changed");
    e.preventDefault();

    let file = e.target.files[0];
    let reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      this.setState({image: reader.result})
      console.log(file, reader);
    }
  }

  render() {
    if (this.state.image) {
      let rekognition = new aws.Rekognition();

      var params = {
        Image: { /* required */
          Bytes: this.state.image,
        },
        MaxLabels: 0,
        MinConfidence: 0.0
      };

      rekognition.detectLabels(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
    }

    return (
      <div className="App">
        <div className="App-header">
          <h2>AWS Rekognition playground</h2>
            <p>Upload an image to see what's in it:</p>
            <form>
              <input className="fileInput"
                type="file"
                onChange={(e)=>this.handleImageChange(e)} />
            </form>
        </div>
      </div>
    );
  }
}

export default App;
