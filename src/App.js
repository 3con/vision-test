import React, { Component } from 'react';
import aws from 'aws-sdk';
import aws_config from '../aws_config.json';

import './App.css';

aws.config.update(aws_config);

class App extends Component {
  constructor() {
    super();

    this.state = {}
  }

  handleImageChange(e) {
    console.log("file changed");
    e.preventDefault();

    let file = e.target.files[0];
    let reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      let bucket = new aws.S3({params: {Bucket: aws_config.bucket}});
      let params = {Key: file.name, ContentType: file.type, Body: file};
      bucket.upload(params, function (err, data) {
        console.log(err, data);
        let rekognition = new aws.Rekognition();

        var params = {
          Image: { /* required */
            S3Object: {
              Bucket: data.Bucket,
              Name: data.Key
            }
          },
          MinConfidence: 0.0
        };

        rekognition.detectLabels(params, (err, data) => {
          if (err) console.log(err, err.stack); // an error occurred
          else {
            console.log(data);
            // this.setState({labels: data})
          }
        });
      });
    }
  }

  render() {
    let labels = this.state.labels;

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
        <div>
          <pre>
            {labels}
          </pre>
        </div>
      </div>
    );
  }
}

export default App;
