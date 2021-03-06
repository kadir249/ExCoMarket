import React, {useState, useLayoutEffect} from "react";
import {SafeAreaView, FlatList, View, StatusBar, Platform, StyleSheet, Text} from "react-native";
import {fetchCoinMarket} from "../../utils/coinApi";
import {CoinMarketItem} from "../../components/Prices/CoinMarketItem"
import COLORS from "../../utils/COLORS";
import { auth, database } from "../../utils/firebaseApi";

const CoinMarket = () => {
    const [myData,setMyData]=useState([])
    const [error,setError]=useState(null)
    const [loading, setLoading] = useState(false)
    const [favouriteData,setFavouriteData]=useState([])

    const [user, setUser] = useState();

    function onAuthStateChanged(user) {
        setUser(user);
    }
    
    useLayoutEffect(()=>{
        const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
        fetchCoinMarket().then((data) => {
            setMyData(data)
        },
        (error) => {
            setError(error);
        })
        if(user != null)
        {
        database.collection("users").doc(auth.currentUser.uid).get().then(doc=>{
            doc.data().coinFavs.forEach(item=>{
                favouriteData.push(item.fav.name)
            })
        })
        }
        return subscriber;
    },[user])
    const renderItem = ({ item }) => (
       <CoinMarketItem favouriteData={favouriteData} image={item.image} name={item.name} currentPrice={item.current_price} currentPriceChange={Number(item.price_change_percentage_24h_in_currency).toFixed(3)}/>
    );
    const itemSeparator = () => (
        <View style={styles.itemSeparator}/>
    );

  return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content"/>
        {loading ? (
          <ActivityIndicator
            visible={loading}
            textContent={'Loading...'}
            textStyle={styles.spinnerTextStyle}
          />
        ) : (
        <View style={styles.view}>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={myData}
                renderItem={renderItem}
                ItemSeparatorComponent={itemSeparator}
                keyExtractor={item => item.id}
            >
            </FlatList>
        </View>
        )}   
    </SafeAreaView>
  );
};

export default CoinMarket;
const styles = StyleSheet.create({
    container: {
        flex:1, 
        backgroundColor:COLORS.black, 
        color: COLORS.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.height : 0
    },
    itemSeparator: {
        height: 1, 
        width: "100%", 
        backgroundColor: COLORS.grey, 
        marginVertical: 12,
    },
    view: {
        backgroundColor:COLORS.black, 
        padding:16,
    },
    tabBar: {
        marginTop: 5,
        marginHorizontal: 5,
        backgroundColor: COLORS.greyDark,
    },
    text: {
        color: COLORS.white,
        fontSize: 16,
    },
});