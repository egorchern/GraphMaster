import * as React from "react";
import { render } from "react-dom";

let root = document.querySelector("#root");
let canvas, ctx;
let node_raidus = 27;
let distance_multiple = 0.57;
let x_distance_between_nodes;
let edge_width = 1;
let directional_indicator_length = 16;
let directional_indicator_angle = 30;
const pi = Math.PI;


//convert degrees to radians
function to_radians(degrees) {
    return degrees * (pi / 180);
}

function to_degrees(radians){
    return radians * (180 / pi);
}

// return true position of mouse on canvas;
function getMousePos(evt, canv) {
    var rect = canv.getBoundingClientRect();
    return {
        x: ((evt.clientX - rect.left) / (rect.right - rect.left)) * canv.width,
        y: ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canv.height,
    };
}

// return angle of line created by points with positive y-axis
function resolve_angle_between_points(x1, y1, x2, y2){
    if(y1 === y2){
        if(x1 < x2){
            return 90;
        }
        else{
            return 270;
        }
    }
    else if(x1 === x2){
        if(y1 < y2){
            return 180;
        }
        else{
            return 0;
        }
    }
    let o = Math.abs(x1 - x2);
    let a = Math.abs(y1 - y2);
    
    let angle = to_degrees(Math.atan((o / a)));
    return angle;
}

// resolves x and y  coordinates by angle meassured from positive y-axis
function resolve_coordinates_by_angle(start_x, start_y, distance, angle) {
    if (angle === 360) {
        angle = 0;
    }
    if (angle > 360) {
        return resolve_coordinates_by_angle(
            start_x,
            start_y,
            distance,
            angle - 360
        );
    }
    if (angle < 0) {
        return resolve_coordinates_by_angle(
            start_x,
            start_y,
            distance,
            angle + 360
        );
    }
    if (angle === 0) {
        return {
            x: start_x,
            y: start_y - distance,
        };
    } else if (angle > 0 && angle < 90) {
        angle = to_radians(angle);
        let o = Math.sin(angle) * distance;
        let a = Math.sqrt(Math.pow(distance, 2) - Math.pow(o, 2));
        return {
            x: start_x + o,
            y: start_y - a,
        };
    } else if (angle === 90) {
        return {
            x: start_x + distance,
            y: start_y,
        };
    } else if (angle > 90 && angle < 180) {
        angle = 180 - angle;
        angle = to_radians(angle);
        let o = Math.sin(angle) * distance;
        let a = Math.sqrt(Math.pow(distance, 2) - Math.pow(o, 2));
        return {
            x: start_x + o,
            y: start_y + a,
        };
    } else if (angle === 180) {
        return {
            x: start_x,
            y: start_y + distance,
        };
    } else if (angle > 180 && angle < 270) {
        angle = angle - 180;
        angle = to_radians(angle);
        let o = Math.sin(angle) * distance;
        let a = Math.sqrt(Math.pow(distance, 2) - Math.pow(o, 2));
        return {
            x: start_x - o,
            y: start_y + a,
        };
    } else if (angle === 270) {
        return {
            x: start_x - distance,
            y: start_y,
        };
    } else if (angle > 270 && angle < 360) {
        angle = 360 - angle;
        angle = to_radians(angle);
        let o = Math.sin(angle) * distance;
        let a = Math.sqrt(Math.pow(distance, 2) - Math.pow(o, 2));
        return {
            x: start_x - o,
            y: start_y - a,
        };
    }
}

//gives random integer between min(inclusive) and max(inclusive)
function get_random_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Edge {
    start_x: any;
    end_x: any;
    start_y: any;
    end_y: any;
    weight: any;
    directional: boolean;
    constructor(start_x, end_x, start_y, end_y, weight, directional) {
        this.start_x = start_x;
        this.end_x = end_x;
        this.start_y = start_y;
        this.end_y = end_y;
        this.weight = weight;
        this.directional = directional;
    }
    draw() {
        let weight_number_offset = 13;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "hsl(0, 0%, 10%)";
        ctx.lineWidth = edge_width;
        ctx.moveTo(this.start_x, this.start_y);
        ctx.lineTo(this.end_x, this.end_y);
        ctx.stroke();
        let target_x = (Math.abs(this.start_x - this.end_x)) * distance_multiple;
        if(this.start_x < this.end_x){
            target_x = this.start_x + target_x + weight_number_offset;
        }
        else{
            target_x = this.start_x - target_x - weight_number_offset;
        }
        let target_y = (Math.abs(this.start_y - this.end_y)) * distance_multiple;
        if(this.start_y < this.end_y){
            target_y = this.start_y + target_y - weight_number_offset;
        }
        else{
            target_y = this.start_y - target_y + weight_number_offset;
        }
        
        ctx.font = "22px Lato";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.fillText(String(this.weight), target_x, target_y, 40);
        if(this.directional){
            let multiple = 0.85;
            target_x = (Math.abs(this.start_x - this.end_x)) * multiple;
            if(this.start_x < this.end_x){
                target_x = this.start_x + target_x;
            }
            else{
                target_x = this.start_x - target_x;
            }
            target_y = (Math.abs(this.start_y - this.end_y)) * multiple;
            if(this.start_y < this.end_y){
                target_y = this.start_y + target_y;
            }
            else{
                target_y = this.start_y - target_y;
            }
            let angle_between = resolve_angle_between_points(this.start_x, this.start_y, this.end_x, this.end_y);
            console.log(angle_between);
            let angles_of_indicators;
            if(this.start_x > this.end_x && this.start_y < this.end_y){
                angles_of_indicators = [angle_between - directional_indicator_angle, angle_between + directional_indicator_angle];
            }
            else if(this.start_x < this.end_x && this.start_y < this.end_y){
                angles_of_indicators = [360 - (angle_between - directional_indicator_angle), 360 - (angle_between + directional_indicator_angle)];
            }
            else if(this.start_x > this.end_x && this.start_y > this.end_y){
                angles_of_indicators = [(180 - angle_between) - directional_indicator_angle, (180 - angle_between) + directional_indicator_angle];
            }
            else if(this.start_x < this.end_x && this.start_y > this.end_y){
                angles_of_indicators = [360 - ((180 - angle_between) - directional_indicator_angle), 360 - ((180 - angle_between) + directional_indicator_angle)];
            }
            else if(this.start_x < this.end_x && this.start_y === this.end_y){
                angles_of_indicators = [270 - directional_indicator_angle, 270 + directional_indicator_angle];
            }
            else if(this.start_x === this.end_x && this.start_y < this.end_y){
                angles_of_indicators = [directional_indicator_angle, 360 - directional_indicator_angle];
            }
            else if(this.start_x > this.end_x && this.start_y === this.end_y){
                angles_of_indicators = [90 - directional_indicator_angle, 90 + directional_indicator_angle];
            }
            else if(this.start_x === this.end_x && this.start_y > this.end_y){
                angles_of_indicators = [180 - directional_indicator_angle, 180 + directional_indicator_angle];
            }
            for(let i = 0; i < angles_of_indicators.length; i += 1){
                let temp = resolve_coordinates_by_angle(target_x, target_y, directional_indicator_length, angles_of_indicators[i]);
                console.log(temp);
                let indicator_x = temp.x;
                let indicator_y = temp.y;
                ctx.beginPath();
                ctx.moveTo(target_x, target_y);
                ctx.lineTo(indicator_x, indicator_y);
                ctx.stroke();
            }
            
            
        }
        ctx.restore();
    }
}

class Node {
    center_x: any;
    center_y: any;
    name: any;
    constructor(center_x, center_y, name) {
        this.center_x = center_x;
        this.center_y = center_y;
        this.name = name;
    }
    draw() {
        ctx.beginPath();
        ctx.save();
        // draw node circle
        ctx.fillStyle = "hsl(0, 0%, 10%)";
        ctx.arc(this.center_x, this.center_y, node_raidus, 0, to_radians(360));
        ctx.fill();
        // draw node name
        ctx.font = "40px Lato";
        ctx.textAlign = "center";
        ctx.fillStyle = "hsl(0, 0%, 100%)";
        ctx.textBaseline = "middle";
        ctx.fillText(
            this.name,
            this.center_x /*- node_raidus * 0.50*/,
            this.center_y /*+ node_raidus * 0.50*/,
            node_raidus
        );
        ctx.restore();
    }
}

class Canvas_mouse_position_tracker extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div id="mouse_tracker">
                <span>X: {this.props.x}</span>
                <span>Y: {this.props.y}</span>
            </div>
        );
    }
}

class Graph extends React.Component {
    graph: any;
    node_list: any[];
    edge_list: any[];
    constructor(props) {
        super(props);
        this.graph = this.props.graph;
        this.node_list = [];
        this.edge_list = [];
    }
    is_edge_directional(start_node_name, end_node_name) {
        let end_node_edges = this.graph[end_node_name];
        let edge_nodes_names = Object.keys(end_node_edges);
        if (edge_nodes_names.includes(start_node_name)) {
            return false;
        }
        else {
            return true;
        }
    }
    populate_node_list() {
        let node_names = Object.keys(this.graph);

        let n = node_names.length;
        x_distance_between_nodes = 32 * n;
        if (n < 8) {
            x_distance_between_nodes += 15;
        }
        let center_x = canvas.width / 2;
        let center_y = canvas.height / 2;

        let local_node_list = [];

        let angle_increment = 360 / n;
        let angles = [0];

        for (let i = 0; i < n; i += 1) {
            let last_angle = angles[angles.length - 1];
            angles.push(last_angle + angle_increment);
        }
        for (let i = 0; i < n; i += 1) {
            let angle = angles[i];
            let coroordinates = resolve_coordinates_by_angle(
                center_x,
                center_y,
                x_distance_between_nodes,
                angle
            );
            let x = coroordinates.x;
            let y = coroordinates.y;

            local_node_list.push(new Node(x, y, node_names[i]));
        }
        console.log(local_node_list);
        this.node_list = local_node_list;
    }
    populate_edge_list() {
        let local_edge_list = [];
        let node_names = Object.keys(this.graph);
        let ignore_list = [];
        let mapper = {};
        for (let i = 0; i < node_names.length; i += 1) {
            let temp = this.node_list[i];
            let name = temp.name;
            mapper[name] = i;
        }
        console.log(mapper);
        for (let i = 0; i < node_names.length; i += 1) {

            let current_node_name = node_names[i];
            let edges_dict = this.graph[current_node_name];
            let edges_names = Object.keys(edges_dict);
            for (let j = 0; j < edges_names.length; j += 1) {
                let next_node_name = edges_names[j];
                let weight = edges_dict[next_node_name];
                let op = ignore_list.filter((e) => {
                    if (e.end === current_node_name && e.start === next_node_name) {
                        return true;
                    }
                    return false;
                });
                if(op.length === 0){
                    let directional = this.is_edge_directional(current_node_name, next_node_name);
                    ignore_list.push({
                        start: current_node_name,
                        end: next_node_name
                    });
                    let start_node_obj = this.node_list[mapper[current_node_name]];
                    let end_node_obj = this.node_list[mapper[next_node_name]];
                    
                    let edge_obj = new Edge(start_node_obj.center_x, end_node_obj.center_x, start_node_obj.center_y, end_node_obj.center_y, weight, directional);
                    local_edge_list.push(edge_obj);
                }
                
                
            
            }
            
        }
        console.log(local_edge_list);
        this.edge_list = local_edge_list;
    }
    draw_nodes() {
        this.node_list.forEach((node) => {
            node.draw();
        });
    }
    draw_edges() {
        this.edge_list.forEach((edge) => {
            edge.draw();
        });
    }
    componentDidMount() {
        canvas = document.querySelector("#canvas");
        ctx = canvas.getContext("2d");
        this.populate_node_list();
        this.populate_edge_list();
        this.draw_edges();
        this.draw_nodes();
        
    }
    render() {
        return (
            <canvas
                id="canvas"
                width="1000"
                height="800"
                onMouseMove={this.props.onMouseMove}
            ></canvas>
        );
    }
}

class App extends React.Component {
    canvas_x: number;
    canvas_y: number;

    constructor(props) {
        super(props);
        this.state = {
            canvas_mouse_pos: {
                x: 0,
                y: 0,
            },
        };
    }
    on_canvas_mouse_move = (e) => {
        let pos = getMousePos(e, canvas);
        this.setState({
            canvas_mouse_pos: {
                x: pos.x,
                y: pos.y,
            },
        });
    };
    render() {
        let graph = {
           A:{B: 17, C: 18},
           B:{A: 17, C: 15, D: 19},
           C:{A: 18, B: 15, D: 20},
           D:{C: 20, B: 19, E: 16, A: 30},
           E:{D: 16, B: 23},
           F:{}

        };
        return (
            <div>
                <Canvas_mouse_position_tracker
                    x={this.state.canvas_mouse_pos.x}
                    y={this.state.canvas_mouse_pos.y}
                />
                <Graph graph={graph} onMouseMove={this.on_canvas_mouse_move} />
            </div>
        );
    }
}

render(<App />, root);
