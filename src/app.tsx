import * as React from "react";
import { render } from "react-dom";
import { SlideDown } from 'react-slidedown'
import assets from "./images/*.webp";
console.log(assets);
let root = document.querySelector("#root");
let canvas, ctx;
let distance_multiple = 0.57;
let edge_width = 1;

const pi = Math.PI;

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

function set_graph_object_list(graph_object_list) {
   localStorage.setItem("graph_object_list", JSON.stringify(graph_object_list, null, 4));
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
      }
      else {
         return 270;
      }
   }
   else if (x1 === x2) {
      if (y1 < y2) {
         return 180;
      }
      else {
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
   directional_indicator_angle: any;
   directional_indicator_length: any;
   font_size: any;
   weight_number_offset: any;
   constructor(start_x, end_x, start_y, end_y, weight, directional, directional_indicator_angle, directional_indicator_length, font_size, weight_number_offset) {
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
   }
   draw() {
      let weight_number_offset = this.weight_number_offset;
      // TODO this needs to be scalable as well.
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "hsl(0, 0%, 10%)";
      ctx.lineWidth = edge_width;
      ctx.moveTo(this.start_x, this.start_y);
      ctx.lineTo(this.end_x, this.end_y);
      ctx.stroke();
      let target_x = (Math.abs(this.start_x - this.end_x)) * distance_multiple;
      if (this.start_x < this.end_x) {
         target_x = this.start_x + target_x + weight_number_offset;
      }
      else {
         target_x = this.start_x - target_x - weight_number_offset;
      }
      let target_y = (Math.abs(this.start_y - this.end_y)) * distance_multiple;
      if (this.start_y < this.end_y) {
         target_y = this.start_y + target_y - weight_number_offset;
      }
      else {
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
         target_x = (Math.abs(this.start_x - this.end_x)) * multiple;
         if (this.start_x < this.end_x) {
            target_x = this.start_x + target_x;
         }
         else {
            target_x = this.start_x - target_x;
         }
         target_y = (Math.abs(this.start_y - this.end_y)) * multiple;
         if (this.start_y < this.end_y) {
            target_y = this.start_y + target_y;
         }
         else {
            target_y = this.start_y - target_y;
         }
         let angle_between = resolve_angle_between_points(this.start_x, this.start_y, this.end_x, this.end_y);

         let angles_of_indicators;
         if (this.start_x > this.end_x && this.start_y < this.end_y) {
            angles_of_indicators = [angle_between - this.directional_indicator_angle, angle_between + this.directional_indicator_angle];
         }
         else if (this.start_x < this.end_x && this.start_y < this.end_y) {
            angles_of_indicators = [360 - (angle_between - this.directional_indicator_angle), 360 - (angle_between + this.directional_indicator_angle)];
         }
         else if (this.start_x > this.end_x && this.start_y > this.end_y) {
            angles_of_indicators = [(180 - angle_between) - this.directional_indicator_angle, (180 - angle_between) + this.directional_indicator_angle];
         }
         else if (this.start_x < this.end_x && this.start_y > this.end_y) {
            angles_of_indicators = [360 - ((180 - angle_between) - this.directional_indicator_angle), 360 - ((180 - angle_between) + this.directional_indicator_angle)];
         }
         else if (this.start_x < this.end_x && this.start_y === this.end_y) {
            angles_of_indicators = [270 - this.directional_indicator_angle, 270 + this.directional_indicator_angle];
         }
         else if (this.start_x === this.end_x && this.start_y < this.end_y) {
            angles_of_indicators = [this.directional_indicator_angle, 360 - this.directional_indicator_angle];
         }
         else if (this.start_x > this.end_x && this.start_y === this.end_y) {
            angles_of_indicators = [90 - this.directional_indicator_angle, 90 + this.directional_indicator_angle];
         }
         else if (this.start_x === this.end_x && this.start_y > this.end_y) {
            angles_of_indicators = [180 - this.directional_indicator_angle, 180 + this.directional_indicator_angle];
         }
         for (let i = 0; i < angles_of_indicators.length; i += 1) {
            let temp = resolve_coordinates_by_angle(target_x, target_y, this.directional_indicator_length, angles_of_indicators[i]);
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
      ctx.arc(this.center_x, this.center_y, this.node_radius, 0, to_radians(360));
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
class Graph extends React.PureComponent {
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
   constructor(props) {
      super(props);
      this.graph = this.props.graph.graph;
      this.state = {
         canvas_width: window.innerWidth * 0.9,

      }
      this.state.canvas_height = Math.min(630, Math.max(this.state.canvas_width * 0.4, 300));
      this.node_list = [];
      this.edge_list = [];
      this.n = Object.keys(this.graph).length;
      this.directional_indicator_angle = 30;
      window.onresize = this.on_resize;
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

         local_node_list.push(new Node(x, y, node_names[i], this.node_radius, this.node_font_size));
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
               let directional = this.is_edge_directional(current_node_name, next_node_name);
               ignore_list.push({
                  start: current_node_name,
                  end: next_node_name
               });
               let start_node_obj = this.node_list[mapper[current_node_name]];
               let end_node_obj = this.node_list[mapper[next_node_name]];

               let edge_obj = new Edge(start_node_obj.center_x, end_node_obj.center_x, start_node_obj.center_y, end_node_obj.center_y, weight, directional, this.directional_indicator_angle, this.directional_indicator_length, this.edge_font_size, this.weight_number_offset);
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
   main() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.node_radius = Math.min(27, Math.max(18, this.state.canvas_width * 0.02));
      this.directional_indicator_length = Math.max(this.state.canvas_width * 0.01, 8);
      this.x_distance_between_nodes = Math.max(this.node_radius, this.state.canvas_width * 0.025) * this.n;
      this.node_font_size = Math.min(44, Math.max(this.node_radius - 2, this.state.canvas_width * 0.038));
      this.edge_font_size = Math.min(22, Math.max(16, this.state.canvas_width * 0.02));
      this.weight_number_offset = Math.min(12, Math.max(7, this.state.canvas_width * 0.01));
      console.log(this.edge_font_size, this.node_font_size, this.weight_number_offset);
      this.populate_node_list();
      this.populate_edge_list();

      this.draw_edges();
      this.draw_nodes();
   }
   on_resize = (e) => {
      this.setState({
         canvas_width: window.innerWidth * 0.9,
         canvas_height: Math.min(630, Math.max(this.state.canvas_width * 0.4, 300));
      })
   }
   /*
   shouldComponentUpdate(next_props){
       console.log(next_props);
       let next_graph = next_props.graph;
       if(JSON.stringify(this.graph) != JSON.stringify(next_graph)){
           return true;
       }
       
       return false;
   }
   */
   componentDidMount() {
      canvas = document.querySelector("#canvas");
      ctx = canvas.getContext("2d");
      this.main();
   }

   componentDidUpdate() {
      this.main();
   }

   render() {
      return (

         <canvas
            id="canvas"
            width={this.state.canvas_width}
            height={this.state.canvas_height}
            onMouseMove={this.props.onMouseMove}
         >
         </canvas>


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

class Graph_choose_menu extends React.Component {
   //elem.style.height = `${elem.scrollHeight}px`;
   previous_graph_index: number;
   previous_node_index: number;
   constructor(props) {
      super(props);
      this.state = {
         selected_graph_index: -1,
         selected_node_index: -1
      }
      this.previous_graph_index = -1;
      this.previous_node_index = -1;
   }
   on_graph_click = (index) => {
      if (index != this.previous_graph_index) {
         this.previous_graph_index = index;
         this.previous_node_index = -1;
         this.setState({
            selected_graph_index: index,
            selected_node_index: -1
         })
      }
   }
   on_node_click = (index) => {
      if (index != this.previous_node_index) {
         this.previous_node_index = index;
         this.setState({
            selected_node_index: index
         })
      }
   }
   on_input_change = (event) => {
      this.setState({
         graph_name: event.target.value
      });
   }
   render() {
      let graph_object_list = this.props.graph_object_list;

      let graph_items = graph_object_list.map((graph_object, graph_index) => {
         let graph_name = graph_object.name;
         let class_list = "saved_graph ";
         if (this.state.selected_graph_index === graph_index) {
            class_list += "selected";
         }
         else {
            class_list += "hoverable";
         }
         let graph = graph_object.graph;
         let node_names = Object.keys(graph);
         let class_list_second = "node_container ";
         if (this.state.selected_node_index != -2) {
            class_list_second += "hoverable "
         }
         else if (this.state.selected_node_index === -2) {
            class_list_second += "selected ";
         }
         return (

            <div className={class_list} key={graph_index} onClick={() => {
               if (graph_index != this.state.selected_graph_index) {
                  this.on_graph_click(graph_index);
               }
            }}>
               <span>{graph_name}</span>
               {
                  this.state.selected_graph_index === graph_index && 
                  <img src={assets.delete_icon} className="delete_icon" onClick={() => {
                     this.props.on_graph_delete_click(graph_index);
                  }}>
                  </img>
               }
               
               <SlideDown className="my_slide_down">
                  {this.state.selected_graph_index === graph_index &&
                     <div className="graph_details">
                        <h4>Nodes</h4>
                        {
                           node_names.map((name, node_index) => {
                              let class_list = "node_container ";
                              if (this.state.selected_node_index != node_index) {
                                 class_list += "hoverable "
                              }
                              else if (this.state.selected_node_index === node_index) {
                                 class_list += "selected";
                              }
                              return (

                                 <div key={name} className={class_list} onClick={() => {
                                    
                                    if (this.state.selected_node_index != node_index) {
                                       this.on_node_click(node_index);
                                    }
                                 }}>
                                    {
                                       this.state.selected_node_index === node_index && 
                                       <img src={assets.delete_icon} className="delete_icon smaller" onClick={() => {
                                          this.props.on_node_delete_click(graph_index, node_index);
                                       }}>
                                       </img>
                                    }
                                    <span>{name}</span>
                                    <SlideDown className="my_slide_down">
                                       {
                                          this.state.selected_node_index === node_index &&
                                          <div className="node_details">
                                             <span>Edges/Connections</span>
                                             <div className="edges_container">
                                                <div className="edge_container">
                                                   <span>To node: B</span>
                                                   <span>Weight: 48</span>
                                                   <span>Biderectional</span>
                                                </div>
                                                <div className="edge_container">
                                                   <span>To node: B</span>
                                                   <span>Weight: 48</span>
                                                   <span>Biderectional</span>
                                                </div>
                                             </div>
                                          </div>
                                       }
                                    </SlideDown>
                                 </div>


                              )
                           })

                        }

                        <div className={class_list_second} onClick={() => {
                           if (-2 != this.state.selected_node_index) {
                              this.on_node_click(-2);
                           }
                        }}>

                           <div className="flex_direction_row">
                              <span>Add new</span>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="add_node_svg_icon">
                                 <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                 <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                              </svg>
                           </div>
                           <SlideDown className="my_slide_down">
                              {
                                 this.state.selected_node_index === -2 &&
                                 <div className="create_graph_menu">
                                    <span>Node name:</span>
                                    <div className="input-group">

                                       <input className="form-control" value={this.props.new_node_input_value} onChange={this.props.on_node_add_value_change}>
                                       </input>
                                    </div>
                                    <button className="btn btn-primary" id="create_graph_btn" onClick={() => {
                                       this.props.on_node_add_submit(graph_index);
                                    }}>
                                       Create
                                    </button>
                                 </div>
                              }
                           </SlideDown>
                        </div>


                     </div>
                  }
               </SlideDown>

            </div>
         )
      })
      let class_list = "saved_graph ";
      if (this.state.selected_graph_index === -2) {
         class_list += "selected";
      }
      else {
         class_list += "hoverable";
      }
      return (
         <div className="graph_menu">
            <div className="saved_graphs_container">
               <h2 className="margin_bottom">Saved Graphs</h2>
               {graph_items}
               <div id="add_new_graph_button" className={class_list} onClick={() => {
                  if (-2 != this.state.selected_graph_index) {
                     this.on_graph_click(-2);
                  }
               }}>
                  <div className="flex_direction_row">
                     <span>Add new</span>
                     <svg viewBox="0 0 16 16" className="add_svg_icon" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z" />
                        <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z" />
                        <path fillRule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5z" />
                     </svg>
                  </div>
                  <SlideDown className="my_slide_down">
                     {
                        this.state.selected_graph_index === -2 &&
                        <div className="create_graph_menu">
                           <span>Graph name:</span>
                           <div className="input-group">
                              <input className="form-control" value={this.props.new_graph_input_value} onChange={this.props.on_graph_add_value_change}>
                              </input>
                           </div>
                           <button className="btn btn-primary" id="create_graph_btn" onClick={this.props.on_graph_add_submit}>
                              Create
                           </button>
                        </div>
                     }
                  </SlideDown>

               </div>
            </div>
         </div>
      )
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
         new_graph_name: "",
         new_node_name: ""
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
   on_graph_add_submit = () => {
      let name = this.state.new_graph_name;
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
         alert("Graph with selected name already exists! Please choose a different name.");
      }
      else {
         let new_object = {
            name: name,
            graph: {

            }
         }
         let combined_object = this.state.graph_object_list;
         combined_object.push(new_object);
         set_graph_object_list(combined_object);
         this.setState({
            graph_object_list: combined_object,
            new_graph_name: ""
         });

      }
   }
   on_graph_add_value_change = (event) => {
      this.setState({
         new_graph_name: event.target.value
      })
   }
   on_node_add_submit = (graph_index) => {
      let new_name = this.state.new_node_name;
      let graph = this.state.graph_object_list[graph_index].graph;
      let node_names = Object.keys(graph);
      let is_name_found = false;
      for(let i = 0; i < node_names.length; i += 1){
         let current_name = node_names[i];
         if(current_name === new_name){
            is_name_found = true;
            break;
         }
      }
      if(is_name_found){
         alert("Node with selected name already exists! Please choose a different name.");
      }
      else{
         let new_graph_object_list = this.state.graph_object_list;
         let new_graph_object = new_graph_object_list[graph_index];
         new_graph_object.graph[new_name] = {};
         new_graph_object_list[graph_index] = new_graph_object;
         set_graph_object_list(new_graph_object_list);
         this.setState({
            graph_object_list: new_graph_object_list,
            new_node_name: ""
         });
      }
   }
   on_node_add_value_change = (event) => {
      this.setState({
         new_node_name: event.target.value
      })
   }
   on_graph_delete_click = (graph_index) => {
      let new_graph_object_list = this.state.graph_object_list;
      new_graph_object_list.splice(graph_index, 1);
      set_graph_object_list(new_graph_object_list);
      this.setState({
         graph_object_list: new_graph_object_list
      })
   }
   on_node_delete_click = (graph_index, node_index) => {
      let new_graph_object_list = this.state.graph_object_list;
      let scoped_graph = new_graph_object_list[graph_index].graph;
      let node_names = Object.keys(scoped_graph);
      let to_delete_name = node_names[node_index]
      let new_graph = {

      };
      node_names.forEach(name => {
         if(name != to_delete_name){
            new_graph[name] = scoped_graph[name]; 
         }
      });
      new_graph_object_list[graph_index].graph = new_graph;
      set_graph_object_list(new_graph_object_list);
      this.setState({
         graph_object_list: new_graph_object_list
      })

   }
   render() {

      return (
         <div className="app_container">
            {this.state.should_display_menu != true &&
               <div>
                  <Canvas_mouse_position_tracker
                     x={this.state.canvas_mouse_pos.x}
                     y={this.state.canvas_mouse_pos.y}
                  />
                  <Graph graph={this.state.graph_object_list[0]} onMouseMove={this.on_canvas_mouse_move} />
               </div>
            }
            {this.state.should_display_menu === true &&
               <Graph_choose_menu 
               graph_object_list={this.state.graph_object_list} 
               on_graph_add_submit={this.on_graph_add_submit} 
               on_graph_add_value_change={this.on_graph_add_value_change} 
               new_graph_input_value={this.state.new_graph_name} 
               on_node_add_submit={this.on_node_add_submit}
               on_node_add_value_change={this.on_node_add_value_change}
               new_node_input_value={this.state.new_node_name}
               on_graph_delete_click={this.on_graph_delete_click}
               on_node_delete_click={this.on_node_delete_click}
               />
            }

         </div>

      );


   }
}

render(<App />, root);
