import * as React from "react";
import {SlideDown} from "react-slidedown";
//TODO make dijkstras give results on nodes that can't be reached
let infinity_symbol = "\u221E";
function round_to(n, digits) {
  if (digits === undefined) {
    digits = 0;
  }

  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  return Math.round(n) / multiplicator;
}

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

function add_edge_to_graph(
  graph,
  start_node_name,
  end_node_name,
  weight,
  directional
) {
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

function dijkstras_algorithm(
  graph,
  start_node_name,
  end_node_name,
  return_distances = false
) {
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
    if(current_node_name === ""){
      return shortest_distances;
    }
    let edges_object = graph[current_node_name];
    
    let edge_names = Object.keys(edges_object);
    for (let i = 0; i < edge_names.length; i += 1) {
      let current_edge_name = edge_names[i];
      let distance =
        shortest_distances[current_node_name] + edges_object[current_edge_name];
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
    
    let node_names = Object.keys(graph);
    
    if(shortest_distances[end_node_name] === Infinity){
      return ["None"];
    }
    
    let current_node_name = end_node_name;
    let running_distance = shortest_distances[end_node_name];
    let path = [end_node_name];
    let queue = [end_node_name];
    while (current_node_name != start_node_name) {
      
      for(let i = 0; i < node_names.length; i += 1){
        let node_name = node_names[i];
        if(queue.includes(node_name) === true){
          continue;
        }
        let edges_object = graph[node_name];
        let edges_names = Object.keys(edges_object);
        let found = false;
        for(let j = 0; j < edges_names.length; j += 1){
          let edge_name = edges_names[j];
          if(edge_name === current_node_name ){
            let length = edges_object[current_node_name];
            let shortest_to = round_to(shortest_distances[node_name], 5);
            let scoped_distance = round_to(running_distance - length, 5);
            
            if(scoped_distance === shortest_to){
              running_distance = scoped_distance;
              current_node_name = String(node_name);
              found = true;
              queue.push(current_node_name);
              break;
            }
          }
        }
        if(found === true){
          break;
        }
      }
      path.push(current_node_name);
      
      /*
      let edges_object = graph[current_node_name];
      let edges_names = Object.keys(edges_object);
      
      for (let i = 0; i < edges_names.length; i += 1) {
        let current_edge_name = edges_names[i];
        let length = graph[current_node_name][current_edge_name];
        let shortest_to = round_to(shortest_distances[current_edge_name], 5);
        let scoped_distance = round_to(running_distance + length, 5);

        let queue_includes = queue.includes(current_edge_name);
        
        if (scoped_distance === shortest_to && queue_includes === false) {
          running_distance = scoped_distance;
          current_node_name = String(current_edge_name);
          queue.push(current_node_name);
          break;
        }
      }
      path.push(current_node_name);
      */
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
  
  if (return_distances === true) {
    return shortest_distances;
  }
  
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

function is_in_path(path, start, end) {
  for (let i = 0; i < path.length; i += 1) {
    let path_start = path[i].start;
    let path_end = path[i].end;

    if (
      (path_start === start && path_end === end) ||
      (path_start === end && path_end === start)
    ) {
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
        end: current_edge_name,
      });
      local_path = traverse(graph, current_edge_name, local_path);
      return local_path;
    }
  }

  return local_path;
}

function detect_cycle(graph) {
  let node_names = Object.keys(graph);
  for (let i = 0; i < node_names.length; i += 1) {
    let current_node_name = node_names[i];
    let edges_object = graph[current_node_name];
    let edges_names = Object.keys(edges_object);
    for (let j = 0; j < edges_names.length; j += 1) {
      let current_edge_name = edges_names[j];
      let path = [
        {
          start: current_node_name,
          end: current_edge_name,
        },
      ];

      path = traverse(graph, current_edge_name, path);
      if (path[path.length - 1].end === current_node_name) {
        return path;
      }
    }
  }
  return "nocycles";
}

function hamiltonian_traverse(graph, node_name, path, visited_nodes) {
  let local_path = JSON.parse(JSON.stringify(path));
  let edges_object = graph[node_name];
  let edges_names = Object.keys(edges_object);
  for (let i = 0; i < edges_names.length; i += 1) {
    let current_edge_name = edges_names[i];
    let in_visited_nodes = visited_nodes.includes(current_edge_name);
    if (current_edge_name === visited_nodes[0]) {
      let n = Object.keys(graph).length;

      if (visited_nodes.length === n) {
        in_visited_nodes = false;
      }
    }

    let in_local_path = is_in_path(local_path, node_name, current_edge_name);
    if (in_local_path === false && in_visited_nodes === false) {
      local_path.push({
        start: node_name,
        end: current_edge_name,
        length: edges_object[current_edge_name],
      });
      visited_nodes.push(current_edge_name);
      let unpack = hamiltonian_traverse(
        graph,
        current_edge_name,
        local_path,
        visited_nodes
      );
      local_path = unpack[0];
      visited_nodes = unpack[1];

      return [local_path, visited_nodes];
    }
  }

  return [local_path, visited_nodes];
}

function find_hamiltonian_cycle(graph) {
  let node_names = Object.keys(graph);
  for (let i = 0; i < node_names.length; i += 1) {
    let current_node_name = node_names[i];
    let edges_object = graph[current_node_name];
    let edges_names = Object.keys(edges_object);
    for (let j = 0; j < edges_names.length; j += 1) {
      let current_edge_name = edges_names[j];
      let visited_nodes = [current_node_name, current_edge_name];
      let path = [
        {
          start: current_node_name,
          end: current_edge_name,
          length: edges_object[current_edge_name],
        },
      ];
      let unpack = hamiltonian_traverse(
        graph,
        current_edge_name,
        path,
        visited_nodes
      );
      path = unpack[0];
      visited_nodes = unpack[1];
      if (visited_nodes.length > node_names.length) {
        return path;
      }
    }
  }
  return [];
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
        if (
          current_edge_length < min_edge.length &&
          is_in_path(queue, current_node_name, current_edge_name) === false
        ) {
          min_edge.start = current_node_name;
          min_edge.end = current_edge_name;
          min_edge.length = current_edge_length;
        }
      }
    }
    return min_edge;
  }
  let ignore_list = [];
  while (counter != node_names.length - 1) {
    let temp = find_min_edge(graph, ignore_list);
    ignore_list.push({
      start: temp.start,
      end: temp.end,
    });
    let scoped_mst = JSON.parse(JSON.stringify(mst));
    let directional = is_edge_directional(graph, temp.start, temp.end);
    scoped_mst = add_edge_to_graph(
      scoped_mst,
      temp.start,
      temp.end,
      temp.length,
      directional
    );
    let cycle = detect_cycle(scoped_mst);
    if (cycle === "nocycles") {
      mst = JSON.parse(JSON.stringify(scoped_mst));
      queue.push({
        start: temp.start,
        end: temp.end,
        length: temp.length,
      });
      counter += 1;
    }
  }
  return queue;
}

function prims_algorithm(graph, start_node_name) {
  let working_queue = [start_node_name];
  let queue = [];
  let n = Object.keys(graph).length;
  let counter = 1;
  function find_min_from_working_queue(graph, working_queue) {
    let start, end;
    let min_length = Infinity;

    for (let i = 0; i < working_queue.length; i += 1) {
      let start_scoped = working_queue[i];
      let edge_object = graph[start_scoped];
      let edge_names = Object.keys(edge_object);
      for (let j = 0; j < edge_names.length; j += 1) {
        let edge_name = edge_names[j];
        let length = edge_object[edge_name];
        if (
          working_queue.includes(edge_name) === false &&
          length < min_length
        ) {
          min_length = length;
          start = start_scoped;
          end = edge_name;
        }
      }
    }
    return {
      start: start,
      end: end,
      length: min_length,
    };
  }
  while (counter < n) {
    let temp = find_min_from_working_queue(graph, working_queue);
    let end_node = temp.end;
    working_queue.push(end_node);
    queue.push({
      start: temp.start,
      end: temp.end,
      length: temp.length,
    });

    counter += 1;
  }
  return queue;
}

function floyds_algorithm(graph) {
  let floyds_table = [];

  let node_names = Object.keys(graph);
  let n = node_names.length;
  for (let i = 0; i < n; i += 1) {
    let empty_list = [];
    for (let j = 0; j < n; j += 1) {
      empty_list.push(0);
    }
    floyds_table.push(empty_list);
  }
  for (let i = 0; i < n; i += 1) {
    let current_node_name = node_names[i];
    let shortest_distances = dijkstras_algorithm(
      graph,
      current_node_name,
      null,
      true
    );
    let list_of_distances = [];
    for (let j = 0; j < n; j += 1) {
      list_of_distances.push(shortest_distances[node_names[j]]);
    }
    floyds_table[i] = list_of_distances;
  }
  return floyds_table;
}

function depth_traverse(graph, node_name, path, visited_nodes){
  let local_path = JSON.parse(JSON.stringify(path));
  let edges_object = graph[node_name];
  let edges_names = Object.keys(edges_object);
  
  for (let i = 0; i < edges_names.length; i += 1) {
    let current_edge_name = edges_names[i];
    let in_visited_nodes = visited_nodes.includes(current_edge_name);

    let in_local_path = is_in_path(local_path, node_name, current_edge_name);
    if (in_local_path === false && in_visited_nodes === false) {
      local_path.push({
        start: node_name,
        end: current_edge_name,
        
      });
      visited_nodes.push(current_edge_name);
      
      local_path = depth_traverse(graph, current_edge_name, local_path, visited_nodes);
      //return [local_path, visited_nodes];
    }
  }

  return local_path;
}

function depth_first_traversal(graph, start_node_name) {
  let edges_object = graph[start_node_name];
  let edges_names = Object.keys(edges_object);
  let all_paths = [];
  let visited_edges = [start_node_name];
  edges_names.forEach((edge_name) => {
    let path = [
      {
        start: start_node_name,
        end: edge_name,
      },
    ];
    visited_edges.push(edge_name);
    let scoped_path = depth_traverse(graph, edge_name, path, visited_edges);
    
  });
  //console.log(all_paths);
}

export class Dijkstras_algorithm_menu extends React.Component {
  item_index: number;
  graph: any;
  constructor(props) {
    super(props);
    this.item_index = this.props.item_index;
    this.graph = this.props.graph;
    this.state = {
      start_node: "",
      end_node: "",
      results: undefined,
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
        let path = ans_dict.path;
        let highlights = [];
        for (let i = 0; i < path.length - 1; i += 1) {
          let start = path[i];
          let end = path[i + 1];
          let temp = {
            start: start,
            end: end,
          };
          highlights.push(temp);
        }
        this.props.set_highlights(highlights);
        this.setState({
          results: ans_dict,
        });
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
              <div className="edge_container cursor_default">
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
                  <SlideDown className="my_slide_down">
                    {this.state.results != undefined && (
                      <div className="flex_direction_column results">
                        <span>Results:</span>
                        <span>Path: {this.state.results.path.join(", ")}</span>
                        <span>Length: {this.state.results.length}</span>
                      </div>
                    )}
                  </SlideDown>
                </div>
              </div>
            </div>
          )}
        </SlideDown>
      </div>
    );
  }
}

export class Kruskals_algorithm_menu extends React.Component {
  item_index: number;
  graph: any;
  constructor(props) {
    super(props);
    this.item_index = this.props.item_index;
    this.graph = this.props.graph;
   

    this.state = {
      start_node: "",
      end_node: "",
      results: undefined,
    };
  }
  calculate = () => {
    this.state.results = kruskals_algorithm(this.graph);
    
  }
  render() {
    let selected_item_index = this.props.selected_item_index;
    let class_list = "saved_graph ";
    if (selected_item_index === this.item_index) {
      class_list += "selected ";
    } else {
      class_list += "hoverable ";
    }
    let all_nodes = Object.keys(this.graph);
    let results_markup, mst_length;
    if(this.state.results != undefined){
      results_markup = this.state.results.map((queue_item, index) => {
        return (
          <span className="kruskals_items" key={index}>
            [{queue_item.start}, {queue_item.end}, {queue_item.length}]
          </span>
        );
      });
      mst_length = 0;
      for (let i = 0; i < this.state.results.length; i += 1) {
        let length = this.state.results[i].length;
        mst_length += length;
      }
    }

    return (
      <div
        className={class_list}
        onClick={() => {
          this.calculate();
          
          this.props.set_highlights(this.state.results);
          this.props.onClick(this.item_index);
        }}
      >
        <span>MST (Kruskal's algorithm)</span>
        <SlideDown className="my_slide_down">
          {selected_item_index === this.item_index && (
            <div className="graph_details">
              <div className="edge_container cursor_default">
                <span>Results</span>
                <div className="flex_direction_row results">
                  <div className="flex_direction_column">
                    <span>Queue: </span>
                  </div>

                  <div className="flex_direction_row flex_wrap">
                    {results_markup}
                  </div>
                </div>
                <span className="margin_top_small">
                  MST weight: {mst_length}
                </span>
              </div>
            </div>
          )}
        </SlideDown>
      </div>
    );
  }
}

export class Floyds_algorithm_menu extends React.Component {
  item_index: number;
  graph: any;
  constructor(props) {
    super(props);
    this.item_index = this.props.item_index;
    this.graph = this.props.graph;
    

    this.state = {
      start_node: "",
      end_node: "",
      results: undefined,
    };
  }
  calculate = () => {
    this.setState({
      results: floyds_algorithm(this.graph);
    })
  }
  render() {
    let selected_item_index = this.props.selected_item_index;
    let class_list = "saved_graph ";
    if (selected_item_index === this.item_index) {
      class_list += "selected ";
    } else {
      class_list += "hoverable ";
    }
    let all_nodes, table_headers, table_contents;
    if(this.state.results != undefined){
      all_nodes = Object.keys(this.graph);
      table_headers = all_nodes.map((node_name, index) => {
        return (
          <th key={node_name} scope="col">
            {node_name}
          </th>
        );
      });
      table_contents = this.state.results.map((result_list, node_index) => {
        let values = result_list.map((value, index) => {
          let scoped_value = value;
          if(scoped_value === Infinity){
            scoped_value = infinity_symbol;
          }
          return <td key={index}>{scoped_value}</td>;
        });
        return (
          <tr key={node_index}>
            <td>{all_nodes[node_index]}</td>
            {values}
          </tr>
        );
      });
    }
    return (
      <div
        className={class_list}
        onClick={() => {
          this.calculate();
          this.props.onClick(this.item_index);

        }}
      >
        <span>Floyd's algorithm</span>
        <SlideDown className="my_slide_down">
          {selected_item_index === this.item_index && (
            <div className="graph_details">
              <div className="edge_container cursor_default">
                <span className="margin_bottom">Results</span>
                <span>To</span>
                <div className="flex_direction_row">
                  <span className="table_direction_indicator">From</span>
                  <table className="table table-bordered floyds_table">
                    <thead>
                      <tr>
                        <th>Node</th>
                        {table_headers}
                      </tr>
                    </thead>
                    <tbody>{table_contents}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </SlideDown>
      </div>
    );
  }
}

export class Prims_algorithm_menu extends React.Component {
  item_index: number;
  graph: any;
  constructor(props) {
    super(props);
    this.item_index = this.props.item_index;
    this.graph = this.props.graph;

    this.state = {
      start_node: "",
      results: undefined,
    };
  }
  on_compute_click = () => {
    if (this.state.start_node === "") {
      alert("Please select start node!");
    } else {
      let queue = prims_algorithm(this.graph, this.state.start_node);
      this.props.set_highlights(queue);

      this.setState({
        results: queue,
      });
    }
  };
  on_start_node_value_change = (event) => {
    this.setState({
      start_node: event.target.value,
    });
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

    let results_markup;
    if (this.state.results != undefined) {
      results_markup = this.state.results.map((queue_item, index) => {
        return (
          <span className="kruskals_items" key={index}>
            [{queue_item.start}, {queue_item.end}, {queue_item.length}]
          </span>
        );
      });
    }
    let mst_length = 0;
    if (this.state.results != undefined) {
      for (let i = 0; i < this.state.results.length; i += 1) {
        let length = this.state.results[i].length;
        mst_length += length;
      }
    }

    return (
      <div
        className={class_list}
        onClick={() => {
          this.props.onClick(this.item_index);
        }}
      >
        <span>MST (Prim's algorithm)</span>
        <SlideDown className="my_slide_down">
          {selected_item_index === this.item_index && (
            <div className="graph_details">
              <div className="edge_container cursor_default">
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
                  </div>
                  <button
                    className="btn btn-primary display_graph_btn"
                    onClick={this.on_compute_click}
                  >
                    Compute
                  </button>
                  <SlideDown className="my_slide_down">
                    {this.state.results != undefined && (
                      <div className="flex_direction_column">
                        <span>Results</span>
                        <div className="flex_direction_row results">
                          <div className="flex_direction_column">
                            <span>Queue: </span>
                          </div>

                          <div className="flex_direction_row flex_wrap">
                            {results_markup}
                          </div>
                        </div>
                        <span className="margin_top_small">
                          MST weight: {mst_length}
                        </span>
                      </div>
                    )}
                  </SlideDown>
                </div>
              </div>
            </div>
          )}
        </SlideDown>
      </div>
    );
  }
}

export class Hamiltonian_cycle_algorithm_menu extends React.Component {
  item_index: number;
  graph: any;
  constructor(props) {
    super(props);
    this.item_index = this.props.item_index;
    this.graph = this.props.graph;
    
    this.state = {
      start_node: "",
      end_node: "",
      results: undefined,
    };
  }
  calculate = () => {
    this.state.results = find_hamiltonian_cycle(this.graph);
  }
  render() {
    let selected_item_index = this.props.selected_item_index;
    let class_list = "saved_graph ";
    if (selected_item_index === this.item_index) {
      class_list += "selected ";
    } else {
      class_list += "hoverable ";
    }
    let all_nodes = Object.keys(this.graph);
    let cycle_markup;
    let cycle_length;
    if(this.state.results != undefined){
      if (this.state.results.length === 0) {
        cycle_markup = (
          <div className="margin_left flex_direction_row">
            <span className="text_align_center">No Hamiltonian cycles</span>
          </div>
        );
      } else {
        cycle_markup = this.state.results.map((path_object, index) => {
          return (
            <span key={index} className="kruskals_items">
              [{path_object.start}, {path_object.end}, {path_object.length}]
            </span>
          );
        });
        cycle_length = 0;
        this.state.results.forEach((path_object) => {
          cycle_length += path_object.length;
        });
      }
    }
    return (
      <div
        className={class_list}
        onClick={() => {
          this.calculate();
          this.props.set_highlights(this.state.results);
          this.props.onClick(this.item_index);
        }}
      >
        <span>Find Hamiltonian cycle</span>
        <SlideDown className="my_slide_down">
          {selected_item_index === this.item_index && (
            <div className="graph_details">
              <div className="edge_container cursor_default">
                <span>Results</span>
                <div className="flex_direction_row">
                  <div className="flex_direction_column">
                    <span className="text_align_center">
                      Hamiltonian cycle:
                    </span>
                  </div>
                  <div className="flex_direction_row flex_wrap margin_left">
                    {cycle_markup}
                  </div>
                </div>
                {this.state.results.length != 0 && (
                  <span className="margin_top_small">
                    Cycle length: {cycle_length}
                  </span>
                )}
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
  graph: any;
  constructor(props) {
    super(props);
    this.state = {
      selected_item_index: -1,
    };
    this.previous_item_index = -1;
    this.graph = this.props.graph;
    depth_first_traversal(this.graph, Object.keys(this.graph)[0]);
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
            item_index={0}
            graph={this.graph}
            onClick={this.on_item_click}
            set_highlights={this.props.set_highlights}
          ></Dijkstras_algorithm_menu>
          <Floyds_algorithm_menu
            selected_item_index={this.state.selected_item_index}
            item_index={1}
            graph={this.graph}
            onClick={this.on_item_click}
          ></Floyds_algorithm_menu>
          <Kruskals_algorithm_menu
            selected_item_index={this.state.selected_item_index}
            graph={this.graph}
            onClick={this.on_item_click}
            item_index={2}
            set_highlights={this.props.set_highlights}
          ></Kruskals_algorithm_menu>
          <Prims_algorithm_menu
            selected_item_index={this.state.selected_item_index}
            graph={this.graph}
            onClick={this.on_item_click}
            item_index={3}
            set_highlights={this.props.set_highlights}
          ></Prims_algorithm_menu>
          <Hamiltonian_cycle_algorithm_menu
            selected_item_index={this.state.selected_item_index}
            graph={this.graph}
            onClick={this.on_item_click}
            item_index={4}
            set_highlights={this.props.set_highlights}
          ></Hamiltonian_cycle_algorithm_menu>
        </div>
      </div>
    );
  }
}
