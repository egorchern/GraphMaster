import * as React from "react";
import { render } from "react-dom";

let root = document.querySelector("#root");
let canvas, ctx;
let node_raidus = 27;
let x_distance_between_nodes;
let node_edge_angle = 150;
let edge_width = 1.5;
const pi = Math.PI;

//convert degrees to radians
function to_radians(degrees){
    return degrees * (pi / 180);
}

// return true position of mouse on canvas;
function getMousePos(evt, canv) {
    
    var rect = canv.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canv.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canv.height
    };
}

// resolves x any y coordinates based on angle from positive x-axis. -Pi to Pi range
function find_x_and_y(radius, start_x, start_y, angle) {
    
    let x;
    let y;
    // if in right top quadrant
    if (angle >= -pi / 2 && angle < 0) {
        angle = Math.abs(angle);
        x = Math.cos(angle) * radius + start_x;
        y = start_y + (radius - Math.sin(angle) * radius);
    }
    // if in right bottom quadrant
    else if (angle >= 0 && angle <= pi / 2) {
        x = Math.cos(angle) * radius + start_x;
        y = start_y + (Math.sin(angle) * radius + radius);
    }
    // if in left top quadrant
    else if (angle < -pi / 2 && angle >= -pi) {
        angle = Math.abs(angle);
        x = start_x + Math.cos(angle) * radius
        
        y = start_y + (radius - Math.sin(angle) * radius);


    }
    // if in left bottom quadrant
    else if(angle > pi/2 && angle <= pi){
        x = start_x + Math.cos(angle) * radius
        y = start_y + (Math.sin(angle) * radius + radius);
    }
    
    return [x, y];


}
/*
function resolve_coordinates_by_angle(start_x, start_y, radius, angle){
    if(angle === 90){
        return {
            x: start_x + radius,
            y: start_y

        }
    }
    let scoped_angle = Math.abs(90 - angle);
    let temp = Math.sin(to_radians(scoped_angle)) * radius;
    
    let y_coord;
    if(angle < 90){
        y_coord = start_y - temp;
    }
    else{
        y_coord = start_y + temp;
    }
    let x_coord = Math.sqrt(Math.pow(radius, 2) - Math.pow(temp, 2));
    
    return {
        x: x_coord,
        y: y_coord
    }
}
*/
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
       
        ctx.beginPath();
        ctx.save();
        // draw node circle
        ctx.fillStyle = "hsl(0, 0%, 10%)"
        ctx.arc(this.center_x, this.center_y, node_raidus, 0, to_radians(360));
        ctx.fill();
        // draw node name
        ctx.font = "40px Lato";
        ctx.textAlign = "center";
        ctx.fillStyle = "hsl(0, 0%, 100%)";
        ctx.textBaseline = "middle";
        ctx.fillText(this.name ,this.center_x /*- node_raidus * 0.50*/, this.center_y /*+ node_raidus * 0.50*/, node_raidus);
    }
}


class Canvas_mouse_position_tracker extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div id="mouse_tracker">
                <span>X: {this.props.x}</span>
                <span>Y: {this.props.y}</span>
            </div>
        )
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
    populate_node_list(){
        let node_names = Object.keys(this.graph);
        
        let n = node_names.length;
        x_distance_between_nodes = 35 * n;
        let center_x = canvas.width / 2;
        let center_y = canvas.height / 2 - x_distance_between_nodes;
        
        let local_node_list = [];
        
        let angle_increment = 360 / n;
        let angles = [0];
        
        for(let i = 0; i < n; i += 1){
            let last_angle = angles[angles.length - 1];
            angles.push(last_angle + angle_increment);
        }
        for(let i = 0; i < n; i += 1){
            let angle = angles[i];
            angle = to_radians(angle);
            angle = angle - pi/2;
            if (angle > pi){
                angle -= 2 * pi;
            }
            let temp = find_x_and_y(x_distance_between_nodes, center_x, center_y, angle);
            let x = temp[0];
            let y = temp[1];
            console.log(angle);
            local_node_list.push(new Node(x, y, node_names[i]));
        }
        
        
        
        
        this.node_list = local_node_list;
    }
    draw_nodes(){
        this.node_list.forEach(node => {
            node.draw();
        })
    }
    componentDidMount(){
        canvas = document.querySelector("#canvas");
        ctx = canvas.getContext('2d');
        this.populate_node_list();
        this.draw_nodes();
    }
    render(){
        return(
            <canvas id="canvas" width="1000" height="800" onMouseMove={this.props.onMouseMove}>

            </canvas>
        )
    }
}

class App extends React.Component{
    canvas_x: number;
    canvas_y: number;
   
    
    constructor(props){
        super(props);
        this.state = {
            canvas_mouse_pos: {
                x: 0,
                y: 0
            }
        }
        
    }
    on_canvas_mouse_move = (e) => {
        let pos = getMousePos(e, canvas);
        this.setState({
            canvas_mouse_pos: {
                x: pos.x,
                y: pos.y
            }
        })
    }
    render(){
        let graph = {
            "A": {"B": 4, "C": 12},
            "B": {"D": 13, "A": 4},
            "C": {"A": 12, "D": 8, "F": 14, "G": 15},
            "D": {"B": 13, "C": 8},
            "F": {"C": 14},
            "G": {"C": 15},
            "GT":{},
            "GTO": {},
            "KTO" : {},
            "GGG": {}
            
            
            
        }
        return(
            <div>
                <Canvas_mouse_position_tracker x={this.state.canvas_mouse_pos.x} y={this.state.canvas_mouse_pos.y}/>
                <Graph graph={graph} onMouseMove={this.on_canvas_mouse_move}/>
            </div>
        )
    }
}

render(<App/>, root);