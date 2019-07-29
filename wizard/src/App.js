import React, { Component } from 'react';
import './App.css';

function Token(props) {
  return (
      <button className="token" onClick={props.click}>
        {props.text}
      </button>
  );
}

class Paragraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokens: props.tokens,
      click: props.click
    };
  }

  renderToken(val, ind) {
    return (
      <Token text={val} click={(event) => this.state.click(event, ind)} />
    )
  }

  render() {
    return (
      <ul>{this.state.tokens.map((val, ind) => {
        return <li key={ind}>{this.renderToken(val, ind)}</li>
      })}</ul>
    );
  }

}


class App extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      isLoaded: false,
      group: null,
      sentence: null,
      annotations: null,
      numAnnotated: 0,
    };
  }


  componentDidMount() {
    this.callBackendAPI()
      .then(res => {
        this.setState({group: res.group,
                       sentence: res.sentence,
                       numAnnotated: res.numAnnotated,
                       annotations: Array(res.sentence.length).fill(0),
                       isLoaded: true,
                     });
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


  handleClick(event, i) {
    const annotations = this.state.annotations.slice();
    annotations[i] = 1-annotations[i];
    this.setState({annotations: annotations});
    if (annotations[i] === 1) {
      event.currentTarget.style.backgroundColor = 'rgb(0, 32, 58)';
    } else {
      event.currentTarget.style.backgroundColor = 'rgb(71, 92, 112)';
    }
    console.log(annotations.slice(0,20));
  }

  // Successfully annotated sentence will be sent back to the server
  // and then immediately a new sentence is requested.
  sendResponseAndUpdate() {
    // send back the current sample
    console.log("Send results");
    fetch('/receive', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        annotations: this.state.annotations,
      })
    });
    this.setState({isLoaded: false});
    // And then print new stuff after short delay.
    // Delay is necessary from server-side async problems.
    setTimeout(() => {

    console.log("Send request for new data");
    this.callBackendAPI()
      .then(res => {
        console.log("New data received.")
        this.setState({group: res.group,
                       sentence: res.sentence,
                       numAnnotated: res.numAnnotated,
                       annotations: Array(res.sentence.length).fill(0),
                       isLoaded: true,
                     });
        console.log("Finished setting state.")
      })
      .catch(err => console.log(err));
    }, 500)
  }

  // Sometimes we just want to skip a sentence. Still needs to send a post request,
  // since it otherwise won't increase the counter.
  sendSkipAndUpdate() {
    // send back the current sample
    console.log("Send results");
    fetch('/skip', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        annotations: this.state.annotations,
      })
    });
    this.setState({isLoaded: false});
    // and then print new stuff after short delay
    setTimeout(() => {

    console.log("Send request for new data");
    this.callBackendAPI()
      .then(res => {
        console.log("New data received.")
        this.setState({group: res.group,
                       sentence: res.sentence,
                       numAnnotated: res.numAnnotated,
                       annotations: Array(res.sentence.length).fill(0),
                       isLoaded: true,
                     });
        console.log("Finished setting state.")
      })
      .catch(err => console.log(err));
    }, 500)
  }

  render() {
    return (
      <div className="App">
        <div className="logo">Annotation Wizard</div>
        <div className="wrapper">
          <p className="group">Group phrase: "{this.state.group}"</p>
          <div className="sentence">
            {this.state.isLoaded &&
            <Paragraph tokens={this.state.sentence} click={this.handleClick} />
            }
          </div>
          <button className="next" onClick={() => this.sendResponseAndUpdate()}>Next sentence</button>
          <button className="skip" onClick={() => this.sendSkipAndUpdate()}>Skip</button>
          <p className="numAnnotated">Annotated samples: {this.state.numAnnotated}</p>
        </div>
      </div>
    );
  }
}

export default App;
