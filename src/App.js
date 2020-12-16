import React, { Component } from 'react';
import './App.css';

import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/theme/dracula';

const filesize = require('filesize') 
class App extends Component {

  constructor() {
    super();

    this.state = {
      problemName: "LAB-4 SDA 2020",
      code: "",
      buttonDisabled: false,
      data: [],
      showIO: []
    }
  }

  onChange = (newValue) => {
    this.setState({ code: newValue });
  }

  checkCode = (recordName) => {
    fetch(process.env.REACT_APP_API_URL + '/checksubmit', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        recordName: recordName
      })
    }).then(resp => resp.json())
    .then(data => {
      if (data.failed) {
        throw new Error(data.failedmsg);
      }
      let showIO = Array.from(this.state.showIO);
      for (let i = 0; i < data.result.length - showIO.length; ++i) showIO.push(false);
      this.setState({ data: data.result, showIO: showIO });
      if (data.finished) {
        this.setState({ buttonDisabled: false });
      } else {
        setTimeout(() => this.checkCode(recordName), 1000);
      }
    }).catch(err => {
      this.setState({ buttonDisabled: false });
      alert(err.message);
    })
  }

  submitCode = () => {
    this.setState({ buttonDisabled: true });
    fetch(process.env.REACT_APP_API_URL + '/submitcode', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        problemName: this.state.problemName,
        code: this.state.code
      })
    }).then(resp => resp.json())
    .then(data => {
      if (data === "failed") {
        this.setState({ buttonDisabled: false });
        alert("Submit Failed");
      } else {
        this.setState({ showIO: [] });
        this.checkCode(data.recordName);
      }
    }).catch(err => {
      this.setState({ buttonDisabled: false });
      alert("Submit Failed");
    });
  }

  toggleIO = (index) => {
    let showIO = Array.from(this.state.showIO);
    showIO[index] ^= true;
    this.setState({ showIO: showIO });
  }

  funcCopy = (elemId) => () => {
    const copyText = document.createElement('textarea');
    copyText.value = this.state.data[elemId].input;
    copyText.setAttribute('readonly', '');
    copyText.style.position = 'absolute';
    copyText.style.left = '-9999px';
    document.body.appendChild(copyText);
    copyText.select();
    copyText.setSelectionRange(0, 100000);
    document.execCommand('copy');
    document.body.removeChild(copyText);
    alert("Input copied!");
  }

  getIOResult = () => {
    let index = 0;
    return this.state.data.map(value => {
      let idx = ++index;
      return (
        <div key={ idx } className="container">
          <div className="row">
            <div className="col">
              <h3 className="text-center">Test Case { idx }</h3>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="d-flex justify-content-between align-items-end">              
                {
                  value.isAccepted === "AC" ?
                    <h4>Status: <span style={{ color: "#a3ffa3" }}>AC</span></h4>
                  :
                    <h4>Status: <span style={{ color: "#fa7979" }}>{value.isAccepted}</span></h4>
                }
                <span className="text-right">
                  { value.runningTime/1000000 }s { filesize(value.memoryUsage) }
                </span>
              </div>
              {
                this.state.showIO[idx] ?
                <button type="button" className="btn btn-dark show-btn w-100" onClick={() => this.toggleIO(idx)}>
                  Hide Input/Output
                </button>
                :
                <button type="button" className="btn btn-dark show-btn w-100" onClick={() => this.toggleIO(idx)}>
                  Show Input/Output
                </button>
              }
            </div>            
          </div>
          {
            this.state.showIO[idx] ?
              <div className="row pt-2">
                <div className="col-lg-4">
                  Input: <button onClick={ this.funcCopy(idx - 1) } className="btn btn-secondary copy-btn">Copy</button>
                  <div className="card card-body">{value.input}</div>
                </div>
                <div className="col-lg-4">
                  Expected Output:
                  <div className="card card-body">{value.expectedOutput}</div>
                </div>
                <div className="col-lg-4">
                  Program Output:
                  <div className="card card-body">{value.programOutput.stdout}</div>
                </div>
              </div>
            :
              <span></span>
          }
        </div>
      )
    });
  }

  render() {
    return (
      <div className="App container">
        {/* <a href={ process.env.REACT_APP_API_URL + '/login' }>Login</a> */}
        <div className="row">
          <div className="col">
            <h2 className="title">AlghiJudge</h2>
            <div className="problem-name">
              <div className="dropdown">
                <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {this.state.problemName}
               
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <button className="dropdown-item" onClick={() => this.setState({ problemName: "LAB-3 SDA 2020"})}>LAB-4 SDA 2020</button>
                  <button className="dropdown-item" onClick={() => this.setState({ problemName: "TP-2 SDA 2020"})}>TP-2 SDA 2020</button>
                  <button className="dropdown-item" onClick={() => this.setState({ problemName: "LAB-3 SDA 2020"})}>LAB-3 SDA 2020</button>
                  <button className="dropdown-item" onClick={() => this.setState({ problemName: "LAB-2 SDA 2020"})}>LAB-2 SDA 2020</button>
                  <button className="dropdown-item" onClick={() => this.setState({ problemName: "TP-1 SDA 2020"})}>TP-1 SDA 2020</button>
                </div>
              </div>
            </div>
            <div className="text-editor">
              <AceEditor
                showPrintMargin={false}
                mode="java"
                theme="dracula"
                onChange={this.onChange}
                fontSize={16}
                width="100%"
                name="text-editor"
                editorProps={{$blockScrolling: true}}
                value={this.state.code}
              />
            </div>
            <div className="row bottom">
              <div className="col-md-6 text-left">
                <a className="tc-link" href="https://github.com/prajnapras19/alghijudge-api/tree/master/static">Test Cases</a>
              </div>
              <div className="col-md-6 text-right">
                {
                  this.state.buttonDisabled ?
                    <button type="button" className="btn btn-dark submit-btn" disabled>Loading...</button>
                  :
                    <button type="button" className="btn btn-dark submit-btn" onClick={this.submitCode}>Submit</button>
                }
              </div>
            </div>
            <div className="hasil">
              {
                this.state.data === [] ?
                  <span></span>
                :
                  this.getIOResult()
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default App;
