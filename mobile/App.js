import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity } from 'react-native'
import axios from 'axios'

const API = 'http://localhost:4000/api';

export default function App() {
  const [products, setProducts] = useState([]);
  useEffect(()=>{ axios.get(`${API}/products`).then(r=>setProducts(r.data)).catch(e=>console.log(e)); }, []);

  return (
    <View style={{flex:1, padding:16, backgroundColor:'#f7fafc'}}>
      <Text style={{fontSize:24, fontWeight:'700', marginBottom:12}}>EcoFinds</Text>
      <FlatList
        data={products}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <View style={{backgroundColor:'#fff', marginBottom:12, padding:12, borderRadius:8}}>
            <View style={{height:120, backgroundColor:'#eee', alignItems:'center', justifyContent:'center'}}>
              {item.image_url ? <Image source={{ uri: `http://localhost:4000${item.image_url}` }} style={{ width: 120, height: 100 }} /> : <Text>Image</Text>}
            </View>
            <Text style={{fontWeight:'600', marginTop:8}}>{item.title}</Text>
            <Text style={{color:'#4a5568'}}>₹ {item.price}</Text>
          </View>
        )}
      />
    </View>
  )
}