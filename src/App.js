import React, { Component } from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import aws from 'aws-sdk';
import aws_config from '../aws_config.json';
import VisualRecognitionV3 from 'watson-developer-cloud/visual-recognition/v3';
import watson_config from '../watson_config.json';


import './App.css';
console.log(VisualRecognitionV3)
aws.config.update(aws_config);

class App extends Component {
  constructor(props) {
    super(props);
    this.confidenceFormatter = this.confidenceFormatter.bind(this);
    this.WatsonClassifyImage = this.WatsonClassifyImage.bind(this);
    this.state = {}
  }

  WatsonClassifyImage(image) {
    let visual_recognition = new VisualRecognitionV3({
      api_key: watson_config.api_key,
      version_date: '2016-05-19'
    });

    visual_recognition.classify({images_file: image}, function(err, res) {
      if (err)
        console.log(err);
      else
        console.log(JSON.stringify(res, null, 2));
    });
    return true;
  }

  handleImageChange(e) {
    console.log("file changed");
    e.preventDefault();

    let file = e.target.files[0];
    let reader = new FileReader();

    reader.readAsDataURL(file);

    let that = this;

    reader.onloadend = () => {
      let bucket = new aws.S3({params: {Bucket: aws_config.bucket}});
      let params = {Key: file.name, ContentType: file.type, Body: file};
      that.setState({photo: reader.result});

      bucket.upload(params, (err, data) => {
        console.log(err, data);
        this.WatsonClassifyImage(data)
        // let rekognition = new aws.Rekognition();
        //
        // var params = {
        //   Image: { /* required */
        //     S3Object: {
        //       Bucket: data.Bucket,
        //       Name: data.Key
        //     }
        //   },
        //   MinConfidence: 0.0
        // };
        // rekognition.detectLabels(params, (err, data) => {
        //   if (err) console.log(err, err.stack); // an error occurred
        //   else {
        //     console.log(data);
        //     that.setState({labels: data.Labels})
        //   }
        // });
      });
    }
  }

  confidenceFormatter(cell, row) {
    return (
      Math.round(cell * 100) / 100 + '%'
    );
  }

  render() {
    let labels = this.state.labels?this.state.labels:[];

    return (
      <div className="App">
        <div className="App-header">
          <h2>AWS Rekognition playground</h2>
            <p>Upload an image or take a photo (if you're on mobile) to see what's in it:</p>
            <form className="form-group">
              <label className="btn btn-primary btn-file btn-lg">
                Add photo
                <input type="file"  className="fileInput"
                  style={{ display: 'none' }} onChange={(e)=>this.handleImageChange(e)} />
              </label>
            </form>
        </div>
        <div>
          <img className="photo" src={ this.state.photo } alt=""/>
        </div>
        <div>
          <BootstrapTable ref='table' data={ labels }>
            <TableHeaderColumn dataField='Name' isKey>Label Name</TableHeaderColumn>
            <TableHeaderColumn ref='Confidence' dataField='Confidence' dataFormat={ this.confidenceFormatter }>Confidence</TableHeaderColumn>

          </BootstrapTable>
        </div>
      </div>
    );
  }
}

export default App;
