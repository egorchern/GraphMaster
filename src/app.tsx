import * as React from "react";
import { render } from "react-dom";

let root = document.querySelector("#root");

class App extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <h1>Hello world!</h1>
        )
    }
}

render(<App/>, root);