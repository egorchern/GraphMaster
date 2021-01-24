import * as React from "react";
import { SlideDown } from "react-slidedown";
import assets from "./images/*.webp";

function round_to(n, digits) {
  if (digits === undefined) {
      digits = 0;
  }

  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  return Math.round(n) / multiplicator;
}

function dijkstras_algorithm(graph, start_node_name, end_node_name) {
  let queue = [];
  let node_names = Object.keys(graph);
  // fill the distances array with infinities for easy comparison later on
  function initialize_distances(node_names) {
    let distances = {};
    for (let i = 0; i < node_names.length; i += 1) {
      distances[node_names[i]] = Infinity;
    }
    return distances;
  }
  // find the node_name with the shortest distance
  function find_shortest_distance_node(shortest_distances, queue) {
    let names = Object.keys(shortest_distances);
    let min_name = "";
    let min_length = Infinity;
    for (let i = 0; i < names.length; i += 1) {
      let current_name = names[i];
      let current_length = shortest_distances[current_name];
      if (
        current_length < min_length &&
        queue.includes(current_name) === false
      ) {
        min_name = current_name;
        min_length = current_length;
      }
    }
    return min_name;
  }
  //perfor calculations for current node, add current shortest length to edge length to produce new shortest lengths
  function calc_shortest_distances(graph, shortest_distances, queue) {
    let current_node_name = queue[queue.length - 1];
    let edges_object = graph[current_node_name];

    let edge_names = Object.keys(edges_object);
    for (let i = 0; i < edge_names.length; i += 1) {
      let current_edge_name = edge_names[i];
      let distance =
        shortest_distances[current_node_name] +
        edges_object[current_edge_name];
      let shortest_distance = shortest_distances[current_edge_name];
      if (distance < shortest_distance) {
        shortest_distance = distance;
      }
      shortest_distances[current_edge_name] = shortest_distance;
    }
    return shortest_distances;
  }
  // perform back pass to resolve the optimal path
  function backtrack(
    graph,
    shortest_distances,
    start_node_name,
    end_node_name
  ) {
    let current_node_name = end_node_name;
    let running_distance = shortest_distances[end_node_name];
    let path = [end_node_name];
    let queue = [end_node_name];
    while (current_node_name != start_node_name) {
      let edges_object = graph[current_node_name];
      let edges_names = Object.keys(edges_object);
      
      for (let i = 0; i < edges_names.length; i += 1) {
        let current_edge_name = edges_names[i];
        let length = graph[current_node_name][current_edge_name];
        let shortest_to = round_to(shortest_distances[current_edge_name], 5);
        let scoped_distance = round_to(running_distance - length, 5);
        
        let queue_includes = queue.includes(current_edge_name);
        
        if (scoped_distance === shortest_to && queue_includes === false) {
          running_distance = scoped_distance;
          current_node_name = String(current_edge_name);
          queue.push(current_node_name);
          break;
        }
      }
      path.push(current_node_name);
    }
    path = path.reverse();
    return path;
  }
  let shortest_distances = initialize_distances(node_names);
  shortest_distances[start_node_name] = 0;
  while (queue.length != node_names.length) {
    let min_name = find_shortest_distance_node(shortest_distances, queue);
    queue.push(min_name);
    shortest_distances = calc_shortest_distances(
      graph,
      shortest_distances,
      queue
    );
  }
  console.log(shortest_distances, queue);
  
  let path = backtrack(
    graph,
    shortest_distances,
    start_node_name,
    end_node_name
  );
  
  let length = shortest_distances[end_node_name];
  return {
    shortest_distances: shortest_distances,
    queue: queue,
    path: path,
    length: length,
  };
}

export class Dijkstras_algorithm_menu extends React.Component {
  item_index: number;
  constructor(props) {
    super(props);
    this.item_index = 0;
    this.graph = this.props.graph;
    this.state = {
      start_node: "",
      end_node: "",
    };
  }
  on_start_node_value_change = (event) => {
    this.setState({
      start_node: event.target.value,
    });
  };
  on_end_node_value_change = (event) => {
    this.setState({
      end_node: event.target.value,
    });
  };
  on_compute_click = () => {
    if (this.state.start_node != "" && this.state.end_node != "") {
      if (this.state.start_node != this.state.end_node) {
        let ans_dict = dijkstras_algorithm(
          this.graph,
          this.state.start_node,
          this.state.end_node
        );
        console.log(ans_dict);
      } else {
        alert("Start and end nodes have to be different!");
      }
    } else {
      alert("One or more fields were left empty!");
    }
  };
  render() {
    let selected_item_index = this.props.selected_item_index;
    let class_list = "saved_graph ";
    if (selected_item_index === this.item_index) {
      class_list += "selected ";
    } else {
      class_list += "hoverable ";
    }
    let all_nodes = Object.keys(this.graph);

    let options = all_nodes.map((node_name) => {
      return <option key={node_name}>{node_name}</option>;
    });
    return (
      <div
        className={class_list}
        onClick={() => {
          this.props.onClick(this.item_index);
        }}
      >
        <span>Dijkstras Algorithm</span>
        <SlideDown className="my_slide_down">
          {selected_item_index === this.item_index && (
            <div className="graph_details">
              <div className="edge_container">
                <div className="create_graph_menu">
                  <div className="edge_create_grid">
                    <span>Start node:</span>
                    <select
                      className="form-select form-select-sm text_align_center"
                      value={this.state.start_node}
                      onChange={this.on_start_node_value_change}
                    >
                      <option></option>
                      {options}
                    </select>
                    <span>End node:</span>
                    <select
                      className="form-select form-select-sm text_align_center"
                      value={this.state.end_node}
                      onChange={this.on_end_node_value_change}
                    >
                      <option></option>
                      {options}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary display_graph_btn"
                    onClick={this.on_compute_click}
                  >
                    Compute
                           </button>
                </div>
              </div>
            </div>
          )}
        </SlideDown>
      </div>
    );
  }
}

export class Algorithms_menu extends React.Component {
  previous_item_index: number;
  constructor(props) {
    super(props);
    this.state = {
      selected_item_index: -1,
    };
    this.previous_item_index = -1;
    this.graph = this.props.graph;
  }
  on_item_click = (item_index) => {
    if (this.previous_item_index != item_index) {
      this.setState({
        selected_item_index: item_index,
      });
    }
  };
  render() {
    return (
      <div className="graph_menu" id="algorithms_menu">
        <div className="saved_graphs_container">
          <h2 className="margin_bottom">Algorithms/Tools</h2>
          <Dijkstras_algorithm_menu
            selected_item_index={this.state.selected_item_index}
            graph={this.graph}
            onClick={this.on_item_click}
          ></Dijkstras_algorithm_menu>
        </div>
      </div>
    );
  }
}
