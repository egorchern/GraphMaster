import * as React from "react";
import { SlideDown } from "react-slidedown";
import assets from "./images/*.webp";

export class Dijkstras_algorithm_menu extends React.Component {
   item_index: number;
   constructor(props) {
      super(props);
      this.item_index = 0;
   }
   render() {
     let selected_item_index = this.props.selected_item_index;
     let class_list = "saved_graph ";
     if(selected_item_index === this.item_index){
       class_list += "selected ";
     }
     else{
       class_list += "hoverable ";
     }
     return (
       <div className={class_list} onClick={() => {
         this.props.onClick(this.item_index);
       }}>
         <span>Dijkstras Algorithm</span>
       </div>
     )
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
   }
   on_item_click = (item_index) => {
    if(this.previous_item_index != item_index){
      this.setState({
        selected_item_index: item_index
      })
    }
   }
   render() {
      return (
         <div className="graph_menu" id="algorithms_menu">
            <div className="saved_graphs_container">
               <h2 className="margin_bottom">Algorithms/Tools</h2>
               <Dijkstras_algorithm_menu selected_item_index={this.state.selected_item_index} onClick={this.on_item_click}>

               </Dijkstras_algorithm_menu>
            </div>
         </div>
      );
   }
}
