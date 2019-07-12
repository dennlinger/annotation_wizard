import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    isLoaded: false,
    group: null,
    sentence: null
  };

  componentDidMount() {
    this.callBackendAPI()
      .then(res => {
        this.setState({group: res.group,
                       sentence: res.sentence,
                       isLoaded: true});
      })
      .catch(err => console.log(err));

  }

  callBackendAPI = async () => {
    const response = await fetch('/next');
    const body = await response.json();

    if (response.status !== 200) {
        throw Error(body.message)
    }

    return body;
  }

  render() {
    console.log("Hello World");
    console.log(this.state.sentence);
    if (this.state.isLoaded) {
      var items = this.state.sentence.map((item) =>
        <li>{item}</li>
      );
    } else {
      var items = []
    }
    return (
      <div className="App">
        <p className="group">{this.state.group}</p>
        <div className="sentence">
          <ul>
            {this.state.isLoaded ? items : <li>dummy</li>}
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
