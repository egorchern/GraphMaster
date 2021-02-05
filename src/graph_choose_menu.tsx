import * as React from "react";
import {SlideDown} from "react-slidedown";
import assets from "./images/*.webp";

function get_unused_edges_on_node(graph, target_node_name) {
  let node_names = Object.keys(graph);
  let node_name = target_node_name;
  let edge_object = graph[node_name];
  let edge_names = Object.keys(edge_object);
  let unused_names = [];
  for (let i = 0; i < node_names.length; i += 1) {
    let scoped_node_name = node_names[i];
    if (
      edge_names.includes(scoped_node_name) === false &&
      scoped_node_name != target_node_name
    ) {
      unused_names.push(scoped_node_name);
    }
  }
  return unused_names;
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

export class Graph_choose_menu extends React.Component {
  //elem.style.height = `${elem.scrollHeight}px`;
  previous_graph_index: number;
  previous_node_index: number;
  previous_edge_index: number;
  constructor(props) {
    super(props);
    this.state = {
      selected_graph_index: -1,
      selected_node_index: -1,
      selected_edge_index: -1,
      new_node_input_value: "",
      new_graph_input_value: "",
      edge_add_target_node_value: "",
      edge_add_weight_value: "",
      edge_add_directionality_value: "",
    };
    this.previous_graph_index = -1;
    this.previous_node_index = -1;
    this.previous_edge_index = -1;
  }
  reset_input_values = () => {
    this.setState({
      new_node_input_value: "",
      new_graph_input_value: "",
      edge_add_target_node_value: "",
      edge_add_weight_value: "",
      edge_add_directionality_value: "",
    });
  };
  on_graph_click = (index) => {
    if (index != this.previous_graph_index) {
      this.previous_graph_index = index;
      this.previous_node_index = -1;
      this.previous_edge_index = -1;
      this.setState({
        selected_graph_index: index,
        selected_node_index: -1,
        selected_edge_index: -1,
      });
    }
  };
  on_node_click = (index) => {
    if (index != this.previous_node_index) {
      this.previous_node_index = index;
      this.previous_edge_index = -1;
      this.setState({
        selected_node_index: index,
        selected_edge_index: -1,
      });
    }
  };
  on_edge_click = (index) => {
    if (index != this.previous_edge_index) {
      this.previous_edge_index = index;
      this.setState({
        selected_edge_index: index,
      });
    }
  };
  on_edge_add_target_node_value_change = (event) => {
    this.setState({
      edge_add_target_node_value: event.target.value,
    });
  };
  on_edge_add_weight_value_change = (event) => {
    this.setState({
      edge_add_weight_value: event.target.value,
    });
  };
  on_edge_add_directionality_value_change = (event) => {
    this.setState({
      edge_add_directionality_value: event.target.value,
    });
  };
  on_node_add_value_change = (event) => {
    this.setState({
      new_node_input_value: event.target.value,
    });
  };
  on_graph_add_value_change = (event) => {
    this.setState({
      new_graph_input_value: event.target.value,
    });
  };
  on_view_raw = (index) => {
    let jsoned = JSON.stringify(
      this.props.graph_object_list[index].graph,
      null,
      4
    );
    alert(jsoned);
  };
  render() {
    let graph_object_list = this.props.graph_object_list;

    let graph_items = graph_object_list.map((graph_object, graph_index) => {
      let graph_name = graph_object.name;
      let class_list = "saved_graph ";
      if (this.state.selected_graph_index === graph_index) {
        class_list += "selected";
      } else {
        class_list += "hoverable";
      }
      let graph = graph_object.graph;
      let node_names = Object.keys(graph);

      let class_list_second = "node_container ";
      if (this.state.selected_node_index != -2) {
        class_list_second += "hoverable ";
      } else if (this.state.selected_node_index === -2) {
        class_list_second += "selected ";
      }
      let class_list_third = "edge_container ";
      if (this.state.selected_edge_index != -2) {
        class_list_third += "hoverable ";
      } else if (this.state.selected_edge_index === -2) {
        class_list_third += "selected ";
      }
      return (
        <div
          className={class_list}
          key={graph_index}
          onClick={() => {
            if (graph_index != this.state.selected_graph_index) {
              this.on_graph_click(graph_index);
            }
          }}
        >
          <span>{graph_name}</span>
          {this.state.selected_graph_index === graph_index && (
            <div className="graph_buttons_container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="graph_button"
                viewBox="0 0 16 16"
                onClick={() => {
                  this.on_view_raw(graph_index);
                }}
              >
                <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
                <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z" />
              </svg>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="graph_button"
                viewBox="0 0 16 16"
                onClick={() => {
                  this.props.on_graph_delete_click(graph_index);
                  this.reset_input_values();
                }}
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path
                  fillRule="evenodd"
                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                />
              </svg>
            </div>
          )}

          <SlideDown className="my_slide_down">
            {this.state.selected_graph_index === graph_index && (
              <div className="graph_details">
                <span>Nodes</span>
                {node_names.map((name, node_index) => {
                  let class_list = "node_container ";
                  if (this.state.selected_node_index != node_index) {
                    class_list += "hoverable ";
                  } else if (this.state.selected_node_index === node_index) {
                    class_list += "selected";
                  }
                  let node_options;
                  let unused_edges;
                  if (this.state.selected_node_index === node_index) {
                    unused_edges = get_unused_edges_on_node(graph, name);
                    node_options = unused_edges.map((node_name) => {
                      return <option key={node_name}>{node_name}</option>;
                    });
                  }

                  return (
                    <div
                      key={name}
                      className={class_list}
                      onClick={() => {
                        if (this.state.selected_node_index != node_index) {
                          this.on_node_click(node_index);
                        }
                      }}
                    >
                      {this.state.selected_node_index === node_index && (
                        <div className="graph_buttons_container">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            className="graph_button smaller"
                            viewBox="0 0 16 16"
                            onClick={() => {
                              this.props.on_node_delete_click(node_index);
                              this.reset_input_values();
                            }}
                          >
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                            <path
                              fillRule="evenodd"
                              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                            />
                          </svg>
                        </div>
                      )}
                      <span>{name}</span>
                      <SlideDown className="my_slide_down">
                        {this.state.selected_node_index === node_index && (
                          <div className="node_details">
                            <span>Edges/Connections</span>
                            <div className="edges_container">
                              {Object.keys(graph[node_names[node_index]]).map(
                                (edge_name, edge_index) => {
                                  let is_directional = is_edge_directional(
                                    graph,
                                    name,
                                    edge_name
                                  );
                                  let list = "edge_container ";
                                  if (
                                    edge_index ===
                                    this.state.selected_edge_index
                                  ) {
                                    list += "selected ";
                                  } else {
                                    list += "hoverable ";
                                  }

                                  return (
                                    <div
                                      className={list}
                                      key={edge_name}
                                      onClick={() => {
                                        this.on_edge_click(edge_index);
                                      }}
                                    >
                                      {this.state.selected_edge_index ===
                                        edge_index && (
                                        <div className="graph_buttons_container">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            className="graph_button smallest"
                                            viewBox="0 0 16 16"
                                            onClick={() => {
                                              this.props.on_edge_delete_click(
                                                graph_index,
                                                name,
                                                edge_name
                                              );
                                              this.reset_input_values();
                                            }}
                                          >
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                            <path
                                              fillRule="evenodd"
                                              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                            />
                                          </svg>
                                        </div>
                                      )}

                                      <span>To node: {edge_name}</span>
                                      <span>
                                        Weight:{" "}
                                        {
                                          graph[node_names[node_index]][
                                            edge_name
                                          ]
                                        }
                                      </span>
                                      <span>
                                        Directional: {String(is_directional)}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                              <div
                                className={class_list_third}
                                onClick={() => {
                                  if (-2 != this.state.selected_node_index) {
                                    this.on_edge_click(-2);
                                  }
                                }}
                              >
                                <div className="flex_direction_row">
                                  <span>Add new</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    className="add_edge_svg_icon"
                                    viewBox="0 0 16 16"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M11 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6.025 7.5a5 5 0 1 1 0 1H4A1.5 1.5 0 0 1 2.5 10h-1A1.5 1.5 0 0 1 0 8.5v-1A1.5 1.5 0 0 1 1.5 6h1A1.5 1.5 0 0 1 4 7.5h2.025zM11 5a.5.5 0 0 1 .5.5v2h2a.5.5 0 0 1 0 1h-2v2a.5.5 0 0 1-1 0v-2h-2a.5.5 0 0 1 0-1h2v-2A.5.5 0 0 1 11 5zM1.5 7a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z"
                                    />
                                  </svg>
                                </div>
                                <SlideDown className="my_slide_down">
                                  {this.state.selected_edge_index === -2 && (
                                    <div className="create_graph_menu">
                                      <div className="edge_create_grid">
                                        <span>To Node: </span>
                                        <select
                                          className="form-select form-select-sm text_align_center"
                                          onChange={
                                            this
                                              .on_edge_add_target_node_value_change
                                          }
                                          value={
                                            this.state
                                              .edge_add_target_node_value
                                          }
                                        >
                                          <option></option>
                                          {node_options}
                                        </select>
                                        <span>Weight: </span>
                                        <input
                                          className="form-control form-select-sm"
                                          value={
                                            this.state.edge_add_weight_value
                                          }
                                          onChange={
                                            this.on_edge_add_weight_value_change
                                          }
                                        ></input>
                                        <span>Directional: </span>
                                        <select
                                          className="form-select form-select-sm text_align_center"
                                          value={
                                            this.state
                                              .edge_add_directionality_value
                                          }
                                          onChange={
                                            this
                                              .on_edge_add_directionality_value_change
                                          }
                                        >
                                          <option></option>
                                          <option>True</option>
                                          <option>False</option>
                                        </select>
                                      </div>

                                      <button
                                        className="btn btn-primary"
                                        id="create_graph_btn"
                                        onClick={() => {
                                          this.props.on_edge_add_submit(
                                            graph_index,
                                            name,
                                            this.state
                                              .edge_add_target_node_value,
                                            this.state.edge_add_weight_value,
                                            this.state
                                              .edge_add_directionality_value
                                          );
                                          this.reset_input_values();
                                        }}
                                      >
                                        Create
                                      </button>
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
                })}

                <div
                  className={class_list_second}
                  onClick={() => {
                    if (-2 != this.state.selected_node_index) {
                      this.on_node_click(-2);
                    }
                  }}
                >
                  <div className="flex_direction_row">
                    <span>Add new</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      className="add_node_svg_icon"
                    >
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                  </div>
                  <SlideDown className="my_slide_down">
                    {this.state.selected_node_index === -2 && (
                      <div className="create_graph_menu">
                        <span>Node name:</span>
                        <div className="input-group">
                          <input
                            className="form-control"
                            value={this.state.new_node_input_value}
                            onChange={this.on_node_add_value_change}
                          ></input>
                        </div>
                        <button
                          className="btn btn-primary"
                          id="create_graph_btn"
                          onClick={() => {
                            this.props.on_node_add_submit(
                              graph_index,
                              this.state.new_node_input_value
                            );
                            this.reset_input_values();
                          }}
                        >
                          Create
                        </button>
                      </div>
                    )}
                  </SlideDown>
                </div>
                <button
                  className="btn btn-primary display_graph_btn"
                  onClick={() => {
                    this.props.on_display_graph_click(
                      this.state.selected_graph_index
                    );
                  }}
                >
                  Display
                </button>
              </div>
            )}
          </SlideDown>
        </div>
      );
    });
    let class_list = "saved_graph ";
    if (this.state.selected_graph_index === -2) {
      class_list += "selected";
    } else {
      class_list += "hoverable";
    }
    return (
      <div className="graph_menu">
        <div className="saved_graphs_container">
          <h2 className="margin_bottom">Saved Graphs</h2>
          {graph_items}
          <div
            id="add_new_graph_button"
            className={class_list}
            onClick={() => {
              if (-2 != this.state.selected_graph_index) {
                this.on_graph_click(-2);
              }
            }}
          >
            <div className="flex_direction_row">
              <span>Add new</span>
              <svg
                viewBox="0 0 16 16"
                className="add_svg_icon"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z" />
                <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z" />
                <path
                  fillRule="evenodd"
                  d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5z"
                />
              </svg>
            </div>
            <SlideDown className="my_slide_down">
              {this.state.selected_graph_index === -2 && (
                <div className="create_graph_menu">
                  <span>Graph name:</span>
                  <div className="input-group">
                    <input
                      className="form-control"
                      value={this.state.new_graph_input_value}
                      onChange={this.on_graph_add_value_change}
                    ></input>
                  </div>
                  <button
                    className="btn btn-primary"
                    id="create_graph_btn"
                    onClick={() => {
                      this.props.on_graph_add_submit(
                        this.state.new_graph_input_value
                      );
                      this.reset_input_values();
                    }}
                  >
                    Create
                  </button>
                </div>
              )}
            </SlideDown>
          </div>
        </div>
      </div>
    );
  }
}
