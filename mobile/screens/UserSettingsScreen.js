import React, { Component } from "react";
import { View, Text, StyleSheet, ImageBackground, ScrollView, TextInput, Image, Alert, TouchableOpacity, AsyncStorage } from "react-native";
import { Button, Avatar } from 'react-native-elements';
import { signout, changePassword } from "../actions/Actions";
import { connect } from "react-redux";
import { Permissions, Camera, AppLoading, Constants, ImagePicker } from 'expo';
import { launchCamera, launchImageLibrary } from '../actions/Actions';
import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  storageBucket: 'walkinly.appspot.com',
  messagingSenderId: '',
};

firebase.initializeApp(firebaseConfig);

export default class UserSettingsScreen extends Component {

  static navigationOptions = {
    headerStyle: {
      height: 40,
      backgroundColor: 'dodgerblue'
    },
    headerTitle: "Settings",
    headerTitleStyle: {
      fontSize: 32,
      color: 'white'
    },
    headerTitleContainerStyle: {
      top: -16
    }
  }

  state = {
    isMounted: false,
    password: "",
    oldPassword: "",
    isChanging: false,
    confirmPassword: "",
    newPassword: '',
    email: "",
    avatarSource: null,
    hasCameraPermission: null,
    image: null,
    uploading: false
  }

  async componentDidMount() {
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      isMounted: true,
      image: {
        uri: await AsyncStorage.getItem('userPic')
      }
    })
  }

  handleLogout = () => {
    const { navigation } = this.props;

    if (this.state.isMounted) {
      signout()
        .then(() => {
          navigation.navigate('AuthLoading')
        })
    }
  }

  onChangePasswordPress = () => {
    changePassword(this.state.email, this.state.newPassword).then(() => {
      Alert.alert('Password was changed');
    }).catch((error) => {
      console.log(error)
    })
  }

  uploadImageAsync = async (uri, imageName) => {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const ref = firebase
      .storage()
      .ref()
      .child('images/' + imageName);
    const snapshot = await ref.put(blob);

    // We're done with the blob, close and release it
    blob.close();

    return await snapshot.ref.getDownloadURL();
  }

  onChooseImagePress = async (result) => {
    const options = {
      allowsEditing: true,
      aspect: [4, 3]
    };

    // let result = await ImagePicker.imageSelect(options);
    let email = await AsyncStorage.getItem('userToken');

    if (!result.cancelled) {
      let uploadURL = await this.uploadImageAsync(result.uri, `${email}-profile-image`)
      await AsyncStorage.setItem('userPic', uploadURL)
      Alert.alert(
        'Image successfully uploaded!',
        '',
        [
          {
            text: 'Ok',
          }
        ],
        { cancelable: false }
      )
      this.props.navigation.navigate('AuthLoading')
    }
  }

  imageSelect = (options) => {
    Alert.alert(
      'Profile Picture',
      'Would you like to change your pic?',
      [
        {
          text: 'Camera',
          onPress: async () => {
            await ImagePicker.launchCameraAsync(options)
              .then((source) => {
                this.onChooseImagePress(source)
              })
              .catch(error => {
                console.log(error)
              })
          }
        },
        {
          text: 'Library',
          onPress: async () => {
            await ImagePicker.launchImageLibraryAsync(options)
              .then((source) => {
                this.onChooseImagePress(source)
              })
              .catch(error => {
                console.log(error)
              })
          }

        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancelled'),
          style: 'cancel',
        }
      ]
    );
  }

  componentWillUnmount() {
    this.setState({
      isMounted: false
    })
  }

  render() {
    let { image } = this.state;

    return (
      <ImageBackground
        source={require('../assets/grady2.jpg')}
        style={styles.img}>
        <ScrollView>

          <TouchableOpacity
            onPress={() => this.imageSelect()}
          >
            {this.state.image &&
              <Image
                source={this.state.image}
                style={styles.uploadAvatar}
              />
            }
          </TouchableOpacity>

          <TextInput style={styles.input}
            value={this.state.email}
            placeholder='Enter your email'
            placeholderTextColor="#FFFFFF"
            autoCapitalize='none'
            onChangeText={(text) => { this.setState({ email: text }) }}
          />

          <TextInput style={styles.input}
            value={this.state.newPassword}
            placeholder='New Password'
            placeholderTextColor="#FFFFFF"
            autoCapitalize='none'
            // secureTextEntry={true}? find out how to make this work later!
            onChangeText={(text) => { this.setState({ newPassword: text }) }}
          />

          <Button
            title='Change Password'
            type='solid'
            onPress={this.onChangePasswordPress}
            style={{
              marginBottom: 20,
              shadowColor: "#fff",

              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.27,
              shadowRadius: 4.65,

              elevation: 6,
            }}
            buttonStyle={{
              height: 50,
              width: 250,
              backgroundColor: '#e2e4e9',
            }}
            titleStyle={{ color: '#767689', fontSize: 20 }}
          />

          <Button
            style={{
              marginBottom: 100,
              shadowColor: "#fff",

              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.27,
              shadowRadius: 4.65,

              elevation: 6,
            }}
            buttonStyle={{
              height: 50,
              width: 250,
              backgroundColor: '#e2e4e9',
            }}
            titleStyle={{
              color: '#767689', fontSize: 20
            }}

            type='solid'
            title='Logout'
            onPress={() => this.handleLogout()}
          />
        </ScrollView >
      </ImageBackground >

    )
  }
}

const styles = StyleSheet.create({
  img: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  input: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomColor: 'white',
    padding: 10,
    marginTop: 500,
    fontSize: 20,
    color: 'white',
    shadowColor: "#cccfd8",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1
    },
  },
  uploadAvatar: {
    borderWidth: 2,
    borderColor: 'white',
    marginTop: 300,
    borderRadius: 100,
    height: 200,
    width: 200
  }
})