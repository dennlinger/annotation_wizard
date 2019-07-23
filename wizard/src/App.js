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

  onItemClick = function (event) {
    event.currentTarget.style.backgroundColor = '#ccc';
  }


  render() {
    console.log("Hello World");
    console.log(this.state.sentence);
    if (this.state.isLoaded) {
      var items = this.state.sentence.map((item) =>
        <li onClick={this.onItemClick}>{item}</li>
      );
    }
    return (
      <div className="App">
        <p className="group">{this.state.group}</p>
        <div className="sentence">
          {this.state.sentence &&
          <ul>
            {items}
          </ul>
          }
        </div>
      </div>
    );
  }
}

export default App;
