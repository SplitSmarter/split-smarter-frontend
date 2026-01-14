// import React, { useEffect, useState } from 'react';
// import { View, Text, ActivityIndicator } from 'react-native';
// import axios from 'axios';
//
// const IPInfo = () => {
//     const [ipData, setIpData] = useState(null);
//     const [loading, setLoading] = useState(true);
//
//     useEffect(() => {
//         const fetchIPInfo = async () => {
//             try {
//                 const res = await axios.get('http://ip-api.com/json/');
//                 setIpData(res.data);
//             } catch (error) {
//                 console.error('Failed to fetch IP info:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchIPInfo();
//     }, []);
//
//     if (loading) {
//         return <ActivityIndicator />;
//     }
//
//     return (
//         <View style={{ padding: 20 }}>
//             <Text>IP: {ipData.query}</Text>
//             <Text>Country: {ipData.country}</Text>
//             <Text>Region: {ipData.regionName}</Text>
//             <Text>City: {ipData.city}</Text>
//             <Text>ISP: {ipData.isp}</Text>
//         </View>
//     );
// };
//
// export default IPInfo;
