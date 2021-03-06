import * as React from "react";
import { render } from "react-dom";
import { SlideDown } from "react-slidedown";
import assets from "./images/*.webp";
import { Graph_choose_menu } from "./graph_choose_menu";
import { Algorithms_menu } from "./algorithms_menu";
let root = document.querySelector("#root");
let canvas, ctx;
let distance_multiple = 0.42;
let edge_width = 1;

const pi = Math.PI;
//TODO: Dijkstras algorithm
function get_graph_object_list() {
   let list = localStorage.getItem("graph_object_list");

   try {
      list = JSON.parse(list);
   } catch (error) {
      list = [];
   }

   if (list === null) {
      list = [];
   }
   return list;
}

/*
function copy_array(array){
  let new_array = [];
  for(let i = 0; i < array.length; i += 1){
    let value = array[i];
    if(typeof(value) === "object"){
      let copy = {...value};
      new_array.push(copy);
    }
    
  }
  return new_array;
}
*/
function is_edge_directional(graph, start_node_name, end_node_name) {
   let end_node_edges = graph[end_node_name];
   let edge_nodes_names = Object.keys(end_node_edges);
   if (edge_nodes_names.includes(start_node_name)) {
      let start_weight = graph[start_node_name][end_node_name];
      let end_weight = end_node_edges[start_node_name];

      if (start_weight != end_weight) {
         return true;
      } else {
         return false;
      }
   }
   return true;
}

function set_graph_object_list(graph_object_list) {
   localStorage.setItem(
      "graph_object_list",
      JSON.stringify(graph_object_list, null, 4)
   );
}

//convert degrees to radians
function to_radians(degrees) {
   return degrees * (pi / 180);
}

function to_degrees(radians) {
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
function resolve_angle_between_points(x1, y1, x2, y2) {
   if (y1 === y2) {
      if (x1 < x2) {
         return 90;
      } else {
         return 270;
      }
   } else if (x1 === x2) {
      if (y1 < y2) {
         return 180;
      } else {
         return 0;
      }
   }
   let o = Math.abs(x1 - x2);
   let a = Math.abs(y1 - y2);

   let angle = to_degrees(Math.atan(o / a));
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

function is_in_path(path, start, end) {
   for (let i = 0; i < path.length; i += 1) {
      let path_start = path[i].start;
      let path_end = path[i].end;

      if ((path_start === start && path_end === end) || (path_start === end && path_end === start)) {
         return true;
      }
   }
   return false;
}
function traverse(graph, node_name, path) {
   let local_path = JSON.parse(JSON.stringify(path));

   if (local_path[0].start === local_path[local_path.length - 1].end) {

      return local_path;
   }
   let edges_object = graph[node_name];
   let edges_names = Object.keys(edges_object);
   for (let i = 0; i < edges_names.length; i += 1) {
      let current_edge_name = edges_names[i];
      let in_local_path = is_in_path(local_path, node_name, current_edge_name);
      if (in_local_path === false) {
         local_path.push({
            start: node_name,
            end: current_edge_name
         })
         local_path = traverse(graph, current_edge_name, local_path);
         return local_path;
      }
   }
   return local_path;
}

function add_edge_to_graph(graph, start_node_name, end_node_name, weight, directional){
   let new_graph = JSON.parse(JSON.stringify(graph));
   let node_names = Object.keys(new_graph);
   let new_edge_object = new_graph[start_node_name];
   if (new_edge_object === undefined) {
      new_edge_object = {};
   }

   new_edge_object[end_node_name] = weight;
   new_graph[start_node_name] = new_edge_object;
   if (directional === false) {
      new_edge_object = new_graph[end_node_name];
      if (new_edge_object === undefined) {
         new_edge_object = {};
      }
      new_edge_object[start_node_name] = weight;
      new_graph[end_node_name] = new_edge_object;
   }
   return new_graph;
}

function no_empty_edges(graph){
   let node_names = Object.keys(graph);
   for (let i = 0; i < node_names.length; i += 1) {
      let current_node_name = node_names[i];
      let edges_object = graph[current_node_name];
      let edges_names = Object.keys(edges_object);
      if(edges_names.length === 0){
         return false;
      }
   }
   return true;
}

function detect_cycle(graph) {
   let node_names = Object.keys(graph);
   for (let i = 0; i < node_names.length; i += 1) {
      let current_node_name = node_names[i];
      let edges_object = graph[current_node_name];
      let edges_names = Object.keys(edges_object);
      for (let j = 0; j < edges_names.length; j += 1) {
         let current_edge_name = edges_names[j];
         let path = [{
            start: current_node_name,
            end: current_edge_name
         }]
         path = traverse(graph, current_edge_name, path);
         if (path[path.length - 1].end === current_node_name) {
            return path;
         }
      }
   }
   return "nocycles";
}

function kruskals_algorithm(graph) {
   let queue = [];
   let mst = {};
   let node_names = Object.keys(graph);
   let counter = 0;
   for (let i = 0; i < node_names.length; i += 1) {
      mst[node_names[i]] = {};
   }

   function find_min_edge(graph, queue) {
      let min_edge = {
         length: Infinity,
         start: "",
         end: "",
      };
      let node_names = Object.keys(graph);
      for (let i = 0; i < node_names.length; i += 1) {
         let current_node_name = node_names[i];
         let edges_object = graph[current_node_name];
         let edges_names = Object.keys(edges_object);
         for (let j = 0; j < edges_names.length; j += 1) {
            let current_edge_name = edges_names[j];
            let current_edge_length = edges_object[current_edge_name];
            if (current_edge_length < min_edge.length && is_in_path(queue, current_node_name, current_edge_name) === false) {
               min_edge.start = current_node_name;
               min_edge.end = current_edge_name;
               min_edge.length = current_edge_length;
            }
         }
      }
      return min_edge;
   }
   let ignore_list = [];
   while(counter != node_names.length - 1){
      let temp = find_min_edge(graph, ignore_list);
      ignore_list.push({
         start: temp.start,
         end: temp.end
      })
      let scoped_mst = JSON.parse(JSON.stringify(mst));
      let directional = is_edge_directional(graph, temp.start, temp.end);
      scoped_mst = add_edge_to_graph(scoped_mst, temp.start, temp.end, temp.length, directional);
      let cycle = detect_cycle(scoped_mst);
      if(cycle === "nocycles"){
         mst = JSON.parse(JSON.stringify(scoped_mst));
         queue.push({
            start: temp.start,
            end: temp.end,
            length: temp.length
         })
         counter += 1;
      }
      
   }
   
   
   

}

class Edge {
   start_x: any;
   end_x: any;
   start_y: any;
   end_y: any;
   weight: any;
   directional: boolean;
   directional_indicator_angle: any;
   directional_indicator_length: any;
   font_size: any;
   weight_number_offset: any;
   highlighted: any;
   constructor(
      start_x,
      end_x,
      start_y,
      end_y,
      weight,
      directional,
      directional_indicator_angle,
      directional_indicator_length,
      font_size,
      weight_number_offset,
      highlighted
   ) {
      this.start_x = start_x;
      this.end_x = end_x;
      this.start_y = start_y;
      this.end_y = end_y;
      this.weight = weight;
      this.directional = directional;
      this.directional_indicator_angle = directional_indicator_angle;
      this.directional_indicator_length = directional_indicator_length;
      this.font_size = font_size;
      this.weight_number_offset = weight_number_offset;
      this.highlighted = highlighted
   }
   draw() {
      let weight_number_offset = this.weight_number_offset;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "hsl(0, 0%, 10%)";
      if(this.highlighted === true){
         ctx.strokeStyle = "hsl(0, 100%, 50%)";
      }
      ctx.lineWidth = edge_width;
      if(this.highlighted === true){
         ctx.lineWidth = edge_width + 1;
      }
      ctx.moveTo(this.start_x, this.start_y);
      ctx.lineTo(this.end_x, this.end_y);
      ctx.stroke();
      let target_x = Math.abs(this.start_x - this.end_x) * distance_multiple;
      if (this.start_x < this.end_x) {
         target_x = this.start_x + target_x + weight_number_offset;
      } else {
         target_x = this.start_x - target_x - weight_number_offset;
      }
      let target_y = Math.abs(this.start_y - this.end_y) * distance_multiple;
      if (this.start_y < this.end_y) {
         target_y = this.start_y + target_y - weight_number_offset;
      } else {
         target_y = this.start_y - target_y + weight_number_offset;
      }
      if (this.start_x === this.end_x) {
         target_x -= weight_number_offset * 0.45;
      }
      ctx.font = `${this.font_size}px Lato`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.beginPath();
      ctx.fillText(String(this.weight), target_x, target_y, 35);
      if (this.directional) {
         let multiple = 0.85;
         target_x = Math.abs(this.start_x - this.end_x) * multiple;
         if (this.start_x < this.end_x) {
            target_x = this.start_x + target_x;
         } else {
            target_x = this.start_x - target_x;
         }
         target_y = Math.abs(this.start_y - this.end_y) * multiple;
         if (this.start_y < this.end_y) {
            target_y = this.start_y + target_y;
         } else {
            target_y = this.start_y - target_y;
         }
         let angle_between = resolve_angle_between_points(
            this.start_x,
            this.start_y,
            this.end_x,
            this.end_y
         );

         let angles_of_indicators;
         if (this.start_x > this.end_x && this.start_y < this.end_y) {
            angles_of_indicators = [
               angle_between - this.directional_indicator_angle,
               angle_between + this.directional_indicator_angle,
            ];
         } else if (this.start_x < this.end_x && this.start_y < this.end_y) {
            angles_of_indicators = [
               360 - (angle_between - this.directional_indicator_angle),
               360 - (angle_between + this.directional_indicator_angle),
            ];
         } else if (this.start_x > this.end_x && this.start_y > this.end_y) {
            angles_of_indicators = [
               180 - angle_between - this.directional_indicator_angle,
               180 - angle_between + this.directional_indicator_angle,
            ];
         } else if (this.start_x < this.end_x && this.start_y > this.end_y) {
            angles_of_indicators = [
               360 - (180 - angle_between - this.directional_indicator_angle),
               360 - (180 - angle_between + this.directional_indicator_angle),
            ];
         } else if (this.start_x < this.end_x && this.start_y === this.end_y) {
            angles_of_indicators = [
               270 - this.directional_indicator_angle,
               270 + this.directional_indicator_angle,
            ];
         } else if (this.start_x === this.end_x && this.start_y < this.end_y) {
            angles_of_indicators = [
               this.directional_indicator_angle,
               360 - this.directional_indicator_angle,
            ];
         } else if (this.start_x > this.end_x && this.start_y === this.end_y) {
            angles_of_indicators = [
               90 - this.directional_indicator_angle,
               90 + this.directional_indicator_angle,
            ];
         } else if (this.start_x === this.end_x && this.start_y > this.end_y) {
            angles_of_indicators = [
               180 - this.directional_indicator_angle,
               180 + this.directional_indicator_angle,
            ];
         }
         for (let i = 0; i < angles_of_indicators.length; i += 1) {
            let temp = resolve_coordinates_by_angle(
               target_x,
               target_y,
               this.directional_indicator_length,
               angles_of_indicators[i]
            );
            
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
   node_radius: any;
   font_size: any;
   constructor(center_x, center_y, name, node_radius, font_size) {
      this.center_x = center_x;
      this.center_y = center_y;
      this.name = name;
      this.node_radius = node_radius;
      this.font_size = font_size;
   }
   draw() {
      ctx.beginPath();
      ctx.save();
      // draw node circle
      ctx.fillStyle = "hsl(0, 0%, 10%)";
      ctx.arc(
         this.center_x,
         this.center_y,
         this.node_radius,
         0,
         to_radians(360)
      );
      ctx.fill();
      // draw node name
      ctx.font = `${this.font_size}px Lato`;
      ctx.textAlign = "center";
      ctx.fillStyle = "hsl(0, 0%, 100%)";
      ctx.textBaseline = "middle";
      ctx.fillText(
         this.name,
         this.center_x /*- node_raidus * 0.50*/,
         this.center_y /*+ node_raidus * 0.50*/,
         this.node_radius
      );
      ctx.restore();
   }
}

class Back_button extends React.Component {
   constructor(props) {
      super(props);
   }
   render() {
      return (
         <div onClick={this.props.onClick}>
            <svg
               xmlns="http://www.w3.org/2000/svg"
               fill="currentColor"
               className="back_button_svg"
               viewBox="0 0 16 16"
            >
               <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
               />
            </svg>
         </div>
      );
   }
}

class Main_page_container extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         highlighted_edges: []
      }
   }
   set_new_highlights = (highlighted_edges) => {
      this.setState({
         highlighted_edges: highlighted_edges
      })
   }
   reset_highlights = () => {
      this.setState({
         highlighted_edges: []
      })
   }
   render() {
      return (
         <div className="flex_direction_column overflow_auto width_full">
            {/*<Canvas_mouse_position_tracker x={this.props.x} y={this.props.y}*/}
            <Graph
               graph={this.props.graph}
               onMouseMove={this.props.onMouseMove}
               highlighted_edges={this.state.highlighted_edges}
            />
            <Back_button onClick={this.props.onClick}></Back_button>
            <Algorithms_menu graph={this.props.graph.graph} set_highlights={this.set_new_highlights}></Algorithms_menu>
         </div>
      );
   }
}

class Graph extends React.Component {
   graph: any;
   node_list: any[];
   edge_list: any[];
   n: number;
   x_distance_between_nodes: number;
   node_radius: number;
   directional_indicator_length: number;
   directional_indicator_angle: number;
   node_font_size: number;
   edge_font_size: number;
   weight: any;
   weight_number_offset: number;
   height_slack: number;
   constructor(props) {
      super(props);
      this.graph = this.props.graph.graph;
      this.state = {
         canvas_width: window.innerWidth * 0.9,
         highlighted_edges: this.props.highlighted_edges
      };
      this.height_slack = 100;
      this.n = Object.keys(this.graph).length;
      this.node_radius = Math.min(
         27,
         Math.max(14, this.state.canvas_width * 0.02)
      );
      this.x_distance_between_nodes =
         Math.min(
            Math.max(this.node_radius, this.state.canvas_width * 0.02),
            26
         ) * this.n;
      this.state.canvas_height =
         this.x_distance_between_nodes * 2 + this.height_slack;
      //Math.min(630, Math.max(this.state.canvas_width * 0.4, 300));
      this.node_list = [];
      this.edge_list = [];

      this.directional_indicator_angle = 30;
      
   }
   populate_node_list() {
      let node_names = Object.keys(this.graph);
      let center_x = canvas.width / 2;
      let center_y = canvas.height / 2;

      let local_node_list = [];

      let angle_increment = 360 / this.n;
      let angles = [0];

      for (let i = 0; i < this.n; i += 1) {
         let last_angle = angles[angles.length - 1];
         angles.push(last_angle + angle_increment);
      }
      for (let i = 0; i < this.n; i += 1) {
         let angle = angles[i];
         let coroordinates = resolve_coordinates_by_angle(
            center_x,
            center_y,
            this.x_distance_between_nodes,
            angle
         );
         let x = coroordinates.x;
         let y = coroordinates.y;

         local_node_list.push(
            new Node(x, y, node_names[i], this.node_radius, this.node_font_size)
         );
      }
      
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
            if (op.length === 0) {
               let directional = is_edge_directional(
                  this.graph,
                  current_node_name,
                  next_node_name
               );
               if (directional === false) {
                  ignore_list.push({
                     start: current_node_name,
                     end: next_node_name,
                  });
               }

               let start_node_obj = this.node_list[mapper[current_node_name]];
               let end_node_obj = this.node_list[mapper[next_node_name]];
               let is_highlighted = false;
               if(this.state.highlighted_edges.filter((item) => {
                  if((item.start === current_node_name && item.end === next_node_name) || (item.end === current_node_name && item.start === next_node_name)){
                     return true;
                  }
                  return false;
               }).length != 0){
                  is_highlighted = true;
               }

               let edge_obj = new Edge(
                  start_node_obj.center_x,
                  end_node_obj.center_x,
                  start_node_obj.center_y,
                  end_node_obj.center_y,
                  weight,
                  directional,
                  this.directional_indicator_angle,
                  this.directional_indicator_length,
                  this.edge_font_size,
                  this.weight_number_offset,
                  is_highlighted
               );
               local_edge_list.push(edge_obj);
            }
         }
      }
      
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
   componentWillUnmount(){
      window.removeEventListener("resize", this.on_resize);
   }
   componentDidUpdate(){
      if(JSON.stringify(this.props.highlighted_edges) != JSON.stringify(this.state.highlighted_edges)){
         
         this.state.highlighted_edges = this.props.highlighted_edges;
         this.main();
      }
   }
   main() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.node_radius = Math.min(
         27,
         Math.max(14, this.state.canvas_width * 0.02)
      );
      this.directional_indicator_length = Math.max(
         this.state.canvas_width * 0.01,
         8
      );
      this.x_distance_between_nodes =
         Math.min(
            Math.max(this.node_radius, this.state.canvas_width * 0.02),
            26
         ) * this.n;
      this.node_font_size = Math.min(
         44,
         Math.max(this.node_radius - 4, this.state.canvas_width * 0.038)
      );
      this.edge_font_size = Math.min(
         22,
         Math.max(14, this.state.canvas_width * 0.02)
      );
      this.weight_number_offset = Math.min(
         12,
         Math.max(7, this.state.canvas_width * 0.01)
      );
      this.setState({
         canvas_width: window.innerWidth * 0.9,
         canvas_height: this.x_distance_between_nodes * 2 + this.height_slack,
         
      });

      this.populate_node_list();
      this.populate_edge_list();

      this.draw_edges();
      this.draw_nodes();
      
   }
   on_resize = (e) => {
      this.main();
   };

   componentDidMount() {
      canvas = document.querySelector("#canvas");
      ctx = canvas.getContext("2d");
      window.addEventListener("resize", this.on_resize);
      this.main();
   }

   render() {
      return (
         <div>
            <h1 className="text_align_center">{this.props.graph.name}</h1>
            <canvas
               id="canvas"
               width={this.state.canvas_width}
               height={this.state.canvas_height}
               onMouseMove={this.props.onMouseMove}
            ></canvas>
         </div>
      );
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

class App extends React.Component {
   canvas_x: number;
   canvas_y: number;

   constructor(props) {
      super(props);
      let graph_object_list = get_graph_object_list();
      this.state = {
         canvas_mouse_pos: {
            x: 0,
            y: 0,
         },
         graph_object_list: graph_object_list,
         should_display_menu: true,
         selected_graph_index: -1,
         should_justify: true

      };
   }
   on_display_graph_click = (graph_index) => {
      if (graph_index === -1 && graph_index === -2) {
         alert("No graph is selected!");
      } else {
         this.setState({
            should_display_menu: false,
            selected_graph_index: graph_index,
         });
      }
   };
   delete_edge = (graph, start_node_name, end_node_name) => {
      let new_graph = graph;
      let node_names = Object.keys(new_graph);
      let old_edge_object = new_graph[start_node_name];
      let edge_names = Object.keys(old_edge_object);
      let new_edge_object = {};
      for (let i = 0; i < edge_names.length; i += 1) {
         if (edge_names[i] != end_node_name) {
            new_edge_object[edge_names[i]] = old_edge_object[edge_names[i]];
         }
      }
      new_graph[start_node_name] = new_edge_object;
      old_edge_object = new_graph[end_node_name];
      if (old_edge_object != undefined) {
         edge_names = Object.keys(old_edge_object);

         new_edge_object = {};
         for (let i = 0; i < edge_names.length; i += 1) {
            if (edge_names[i] != start_node_name) {
               new_edge_object[edge_names[i]] = old_edge_object[edge_names[i]];
            }
         }
         new_graph[end_node_name] = new_edge_object;
      }

      return new_graph;
   };
   delete_residiual_edges = (graph, to_delete_node_name) => {
      let node_names = Object.keys(graph);
      let new_graph = graph;

      for (let i = 0; i < node_names.length; i += 1) {
         let node_name = node_names[i];
         let edge_object = new_graph[node_name];
         if (edge_object === undefined) {
            edge_object = {};
         }
         let edge_names = Object.keys(edge_object);

         for (let j = 0; j < edge_names.length; j += 1) {
            let edge_name = edge_names[j];

            if (edge_name === to_delete_node_name) {
               new_graph = this.delete_edge(new_graph, node_name, edge_name);
            }
         }
      }

      return new_graph;
   };
   on_canvas_mouse_move = (e) => {
      let pos = getMousePos(e, canvas);
      this.setState({
         canvas_mouse_pos: {
            x: pos.x,
            y: pos.y,
         },
      });
   };
   on_graph_add_submit = (new_graph_name) => {
      let name = new_graph_name;
      if (name === "") {
         alert("Graph name field is empty!");
      } else {
         let is_name_found = false;
         for (let i = 0; i < this.state.graph_object_list.length; i += 1) {
            let current_object = this.state.graph_object_list[i];
            let scoped_name = current_object.name;
            if (scoped_name === name) {
               is_name_found = true;
               break;
            }
         }
         if (is_name_found === true) {
            alert(
               "Graph with selected name already exists! Please choose a different name."
            );
         } else {
            let new_object = {
               name: name,
               graph: {},
            };
            let combined_object = this.state.graph_object_list;
            combined_object.push(new_object);
            set_graph_object_list(combined_object);
            this.setState({
               graph_object_list: combined_object,
               new_graph_name: "",
            });
         }
      }
   };

   on_node_add_submit = (graph_index, new_node_name) => {
      let new_name = new_node_name;
      if (new_name === "") {
         alert("Node name field is empty!");
      } else {
         let graph = this.state.graph_object_list[graph_index].graph;
         let node_names = Object.keys(graph);
         let is_name_found = false;
         for (let i = 0; i < node_names.length; i += 1) {
            let current_name = node_names[i];
            if (current_name === new_name) {
               is_name_found = true;
               break;
            }
         }
         if (is_name_found) {
            alert(
               "Node with selected name already exists! Please choose a different name."
            );
         } else {
            let new_graph_object_list = this.state.graph_object_list;
            let new_graph_object = new_graph_object_list[graph_index];
            new_graph_object.graph[new_name] = {};
            new_graph_object_list[graph_index] = new_graph_object;
            set_graph_object_list(new_graph_object_list);
            this.setState({
               graph_object_list: new_graph_object_list,
               new_node_name: "",
            });
         }
      }
   };

   on_graph_delete_click = (graph_index) => {
      let new_graph_object_list = this.state.graph_object_list;
      new_graph_object_list.splice(graph_index, 1);
      set_graph_object_list(new_graph_object_list);
      this.setState({
         graph_object_list: new_graph_object_list,
      });
   };
   on_node_delete_click = (graph_index, node_index) => {
      let new_graph_object_list = this.state.graph_object_list;
      let scoped_graph = new_graph_object_list[graph_index].graph;
      let node_names = Object.keys(scoped_graph);
      let to_delete_name = node_names[node_index];
      let new_graph = {};
      node_names.forEach((name) => {
         if (name != to_delete_name) {
            new_graph[name] = scoped_graph[name];
         }
      });

      new_graph = this.delete_residiual_edges(new_graph, to_delete_name);

      new_graph_object_list[graph_index].graph = new_graph;
      set_graph_object_list(new_graph_object_list);
      this.setState({
         graph_object_list: new_graph_object_list,
      });
   };
   on_edge_add_submit = (
      graph_index,
      start_node_name,
      end_node_name,
      weight,
      directional
   ) => {
      weight = Number(weight);
      let re_positive_numbers_only = RegExp("^[1-9][0-9]*(.[0-9]+)?$");
      let weight_pass_bool = re_positive_numbers_only.test(String(weight));
      let node_pass_bool = end_node_name != "";
      let directional_pass_bool = directional != "";
      if (
         weight_pass_bool === false ||
         node_pass_bool === false ||
         directional_pass_bool === false
      ) {
         let error_text = "Following errors were discovered:\n";
         if (weight_pass_bool === false) {
            error_text += "\nWeight field only allows positive numbers";
         }
         if (node_pass_bool === false) {
            error_text += "\nNo destination node selected";
         }
         if (directional_pass_bool === false) {
            error_text += "\nDirectionality value not selected";
         }
         alert(error_text);
      } else {
         let new_graph_object_list = this.state.graph_object_list;
         let new_graph_object = new_graph_object_list[graph_index];
         let new_graph = new_graph_object.graph;
         let node_names = Object.keys(new_graph);
         let new_edge_object = new_graph[start_node_name];
         if (new_edge_object === undefined) {
            new_edge_object = {};
         }

         new_edge_object[end_node_name] = weight;
         new_graph[start_node_name] = new_edge_object;
         if (directional === "False") {
            new_edge_object = new_graph[end_node_name];
            if (new_edge_object === undefined) {
               new_edge_object = {};
            }
            new_edge_object[start_node_name] = weight;
            new_graph[end_node_name] = new_edge_object;
         }
         new_graph_object.graph = new_graph;

         new_graph_object_list[graph_index] = new_graph_object;

         set_graph_object_list(new_graph_object_list);
         this.setState({
            graph_object_list: new_graph_object_list,
         });
      }
   };
   on_edge_delete_click = (graph_index, start_node_name, end_node_name) => {
      let new_graph_object_list = this.state.graph_object_list;
      let new_graph_object = new_graph_object_list[graph_index];
      let new_graph = this.delete_edge(
         new_graph_object.graph,
         start_node_name,
         end_node_name
      );
      new_graph_object.graph = new_graph;
      new_graph_object_list[graph_index] = new_graph_object;
      set_graph_object_list(new_graph_object_list);
      this.setState({
         graph_object_list: new_graph_object_list,
      });
   };
   on_back_button_click = () => {
      this.setState({
         should_display_menu: true,
      });
   };
   render() {
      return (
         <div className="app_container">
            {this.state.should_display_menu != true && (
               <Main_page_container
                  x={this.state.canvas_mouse_pos.x}
                  y={this.state.canvas_mouse_pos.y}
                  graph={
                     this.state.graph_object_list[
                     this.state.selected_graph_index
                     ]
                  }
                  onMouseMove={this.on_canvas_mouse_move}
                  onClick={this.on_back_button_click}
               ></Main_page_container>
            )}
            {this.state.should_display_menu === true && (
               <Graph_choose_menu
                  graph_object_list={this.state.graph_object_list}
                  on_graph_add_submit={this.on_graph_add_submit}
                  on_node_add_submit={this.on_node_add_submit}
                  on_graph_delete_click={this.on_graph_delete_click}
                  on_node_delete_click={this.on_node_delete_click}
                  on_edge_delete_click={this.on_edge_delete_click}
                  on_edge_add_submit={this.on_edge_add_submit}
                  on_display_graph_click={this.on_display_graph_click}
               />
            )}
         </div>
      );
   }
}

render(<App />, root);
