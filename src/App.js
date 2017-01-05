import React from 'react';
import { getDatabase } from './database'

var connectedRef = getDatabase().ref(".info/connected");

const validity = {
  expire15: 1000 * 60 * 15 * -1,
  expire45: 1000 * 60 * 45 * -1,
  expire1h15: 1000 * 60 * 75 * -1,
  valid5: 1000 * 60 * 5,
  valid30: 1000 * 60 * 30,
  valid1h: 1000 * 60 * 60,
};

class App extends React.Component {
  constructor() {
    super();
    this.db = getDatabase();
    this.connectedRef = getDatabase().ref(".info/connected");
    this.handleValidityChange = this.handleValidityChange.bind(this);
    this.state = {
      isConnected: false,
      carpark: "",
      carplate: "",
      lotNo: "",
      validityOption: "expire15",
      parking: ""
    }
  }

  componentDidMount() {
    connectedRef.on("value", (snap) => {
      if (snap.val()) {
        this.setState({isConnected: true});
      } else {
        this.setState({isConnected: false});
      }
    });
  }

  renderConnectionInfo() {
    if (this.state.isConnected) {
      return (
        <h1> Connected </h1>
      )
    }
    else {
      return (
        <h1> Connecting to Firebase </h1>
      )
    }
  }

  handleSubmit(event) {
    console.log("Carplate is", this.state.carplate);
    this.setState({parking: "Parking..."})
    this.handleParkCar();
  }

  handleValidityChange(event) {
    console.log(event.target.value)
    this.setState({
      validityOption: event.target.value
    });
  }

  handleParkCar() {
    console.log("trying dict", validity[this.state.validityOption]);
    let expiry = Date.now() + validity[this.state.validityOption];
    let trimmedCarplate = this.state.carplate.replace(/\s+/g, '');
    let lotNo = parseInt(this.state.lotNo);

    this.db.ref(`/${this.state.carpark.toUpperCase()}/${trimmedCarplate.toUpperCase()}`).set({
      validTill: expiry,
      lotNo
    })
    .then(() => {
      this.setState({parking: "Completed"})
    })
  }

  render() {
    return (
      <div>
        {this.renderConnectionInfo()}
        <form className="form-inline">
            Carpark:
            <input className="form-control" type="text" onChange={carpark => {
              this.setState({carpark: carpark.target.value.toUpperCase()});
            }} />
          <br/>
            Lot No.:
            <input className="form-control" type="number" onChange={lotNo => {
              this.setState({lotNo: lotNo.target.value});
            }} />
          <br/>
            Carplate:
            <input className="form-control" type="text" onChange={carplate => {
              this.setState({carplate: carplate.target.value});
            }} />
            <button onClick={this.handleSubmit.bind(this)} type="button" disabled={this.state.carplate === "" || this.state.carpark === "" || this.state.lotNo === ""}
              className="btn btn-primary">
              Park!
            </button>
            {this.state.parking}
        </form>
        <div>
          <h2>
            Validity
          </h2>
          <form>
            <h3> Expired </h3>
            <label><input type="radio" name="validity" value="expire15" checked={this.state.validityOption === "expire15"} onChange={this.handleValidityChange}/> Expired 15 mins </label><br/>
            <label><input type="radio" name="validity" value="expire45" checked={this.state.validityOption === "expire45"} onChange={this.handleValidityChange}/> Expired 45 mins </label><br/>
            <label><input type="radio" name="validity" value="expire1h15" checked={this.state.validityOption === "expire1h15"} onChange={this.handleValidityChange}/> Expired 1hr 15 mins</label><br/>
            <h3> Valid </h3>
            <label><input type="radio" name="validity" value="valid5" checked={this.state.validityOption === "valid5"} onChange={this.handleValidityChange}/> Park for 5 mins </label><br/>
            <label><input type="radio" name="validity" value="valid30" checked={this.state.validityOption === "valid30"} onChange={this.handleValidityChange}/> Park for 30 mins</label><br/>
            <label><input type="radio" name="validity" value="valid1h" checked={this.state.validityOption === "valid1h"} onChange={this.handleValidityChange}/> Park for 1 hr </label><br/>
          </form>
        </div>
      </div>
    );
  }
}

export default App;
