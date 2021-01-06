import * as React from "react";
import { render } from "react-dom";

let root = document.querySelector("#root");
let canvas, ctx;
let node_raidus = 30;
let x_distance_between_nodes = 40;
let node_edge_angle = 150;
let edge_width = 1.5;
const pi = Math.PI;

function to_radians(degrees){
    return degrees * (pi / 180);
}

//gives random integer between min(inclusive) and max(inclusive)
function get_random_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Node{
    center_x: any;
    center_y: any;
    name: any;
    constructor(center_x, center_y, name){
        this.center_x = center_x;
        this.center_y = center_y;
        this.name = name;
    }
    draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.save();
        ctx.fillStyle = "hsl(0, 0%, 10%)"
        ctx.arc(this.center_x, this.center_y, node_raidus, 0, to_radians(360));
        ctx.fill();
        ctx.font = "40px Lato";
        ctx.textAlign = "center";
        ctx.fillStyle = "hsl(0, 0%, 100%)";
        ctx.textBaseline = "middle";
        ctx.fillText(this.name ,this.center_x /*- node_raidus * 0.50*/, this.center_y /*+ node_raidus * 0.50*/, node_raidus);
    }
}

class Graph extends React.Component{
    graph: any;
    node_list: any[];
    constructor(props){
        super(props);
        this.graph = this.props.graph;
        this.node_list = [];
    }
    
    componentDidMount(){
        canvas = document.querySelector("#canvas");
        ctx = canvas.getContext('2d');
        let test_node = new Node(360, 360, "N");
        test_node.draw();
    }
    render(){
        return(
            <canvas id="canvas" width="1000" height="800">

            </canvas>
        )
    }
}

class App extends React.Component{
    graph: { A: { B: number; C: number; }; B: { D: number; A: number; }; C: { A: number; D: number; F: number; G: number; }; D: { B: number; C: number; }; F: { C: number; }; G: { C: number; }; };
    
    constructor(props){
        super(props);
        this.graph = {
            "A": {"B": 4, "C": 12},
            "B": {"D": 13, "A": 4},
            "C": {"A": 12, "D": 8, "F": 14, "G": 15},
            "D": {"B": 13, "C": 8},
            "F": {"C": 14},
            "G": {"C": 15}
        }
    }
    render(){
        return(
            <Graph graph={this.graph}/>
        )
    }
}

render(<App/>, root);