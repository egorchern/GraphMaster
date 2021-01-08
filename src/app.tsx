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

// resolves x and y  coordinates by angle meassured from positive y-axis
function resolve_coordinates_by_angle(start_x, start_y, distance, angle){
    if(angle === 360){
        angle = 0;
    }
    if(angle > 360){
        return resolve_coordinates_by_angle(start_x, start_y, distance, angle - 360);
    }
    if(angle < 0){
        return resolve_coordinates_by_angle(start_x, start_y, distance, angle + 360);
    }
    if(angle === 0){
        return {
            x: start_x,
            y: start_y - distance
        }
    }
    else if(angle > 0 && angle < 90){
        angle = to_radians(angle);
        let o = Math.sin(angle) * distance;
        let a = Math.sqrt(Math.pow(distance, 2) - Math.pow(o, 2));
        return {
            x: start_x + o,
            y: start_y - a
        }
    }
    else if(angle === 90){
        return {
            x: start_x + distance,
            y: start_y
        }
    }
    else if(angle > 90 && angle < 180){
        angle = 180 - angle;
        angle = to_radians(angle);
        let o = Math.sin(angle) * distance;
        let a = Math.sqrt(Math.pow(distance, 2) - Math.pow(o, 2));
        return {
            x: start_x + o,
            y: start_y + a
        }
    }
    else if(angle === 180){
        return {
            x: start_x,
            y: start_y + distance
        }
    }
    else if(angle > 180 && angle < 270){
        angle = angle - 180;
        angle = to_radians(angle);
        let o = Math.sin(angle) * distance;
        let a = Math.sqrt(Math.pow(distance, 2) - Math.pow(o, 2));
        return {
            x: start_x - o,
            y: start_y + a
        }
    }
    else if(angle === 270){
        return {
            x: start_x - distance,
            y: start_y
        }
    }
    else if(angle > 270 && angle < 360){
        angle = 360 - angle;
        angle = to_radians(angle);
        let o = Math.sin(angle) * distance;
        let a = Math.sqrt(Math.pow(distance, 2) - Math.pow(o, 2));
        return {
            x: start_x - o,
            y: start_y - a
        }
    }
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
        x_distance_between_nodes = 32 * n;
        let center_x = canvas.width / 2;
        let center_y = canvas.height / 2;
        
        let local_node_list = [];
        
        let angle_increment = 360 / n;
        let angles = [0];
        
        for(let i = 0; i < n; i += 1){
            let last_angle = angles[angles.length - 1];
            angles.push(last_angle + angle_increment);
        }
        for(let i = 0; i < n; i += 1){
            let angle = angles[i];
            /*
            angle = to_radians(angle);
            angle = angle - pi/2;
            if (angle > pi){
                angle -= 2 * pi;
            }
            let temp = find_x_and_y(x_distance_between_nodes, center_x, center_y, angle);
            let x = temp[0];
            let y = temp[1];
            */
            let coroordinates = resolve_coordinates_by_angle(center_x, center_y, x_distance_between_nodes, angle);
            let x = coroordinates.x;
            let y = coroordinates.y;
            console.log();
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
            "Kk": {},
            "RR": {},
            "QE": {},
            
            
            
            
            
            
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