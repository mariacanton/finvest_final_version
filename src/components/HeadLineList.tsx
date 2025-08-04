import React, { useEffect, useState } from "react";
import {Text } from "./Themed";
import { FlatList } from "react-native-gesture-handler";
import { TouchableOpacity, StyleSheet, Image, View, Dimensions, ScrollView } from "react-native";
import Colors from "../constants/Colors";
import GlobalAPI from "../../news/GlobalAPI";


function HeadLineList({newsList}){
    return (
        <View>
            <FlatList
            data={newsList}
            renderItem={({item})=>(
                <TouchableOpacity style={{marginTop:15, display:'flex', flexDirection:'row'}}>
                    <Image source={{uri:item.urlToImage}}
                    style={{width:130,height:130,borderRadius:10}}
                    />
                    <View style={{marginRight:130,marginLeft:10}}>
                    <Text numberOfLines={3} style={{ fontSize:18,fontWeight:'bold'}}>{item.title}</Text>
                    <Text style={{marginTop:5, fontWeight:'bold',color: Colors.light.tint}}>{item?.source?.name}</Text>
                    </View>
                    
                </TouchableOpacity>
            )}
            />
        </View>
    )
}

   


const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 10, 
    },
    categoryText: {
      fontSize: 18,          
      fontWeight: "bold",    
      color: "#000000", 
      marginRight: 10,       
    },
    selectedText: {
        color: Colors.light.tint,     
      },
  });

export default HeadLineList