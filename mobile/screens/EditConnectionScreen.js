import React, { Component } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  AsyncStorage,
  ImageBackground
} from "react-native";
import { Button } from "react-native-elements";
import { editConnection } from "../actions/Actions";

class EditConnectionScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerStyle: {
      height: 40,
      backgroundColor: "black",
      zIndex: 1,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 12
      },
      shadowOpacity: 0.58,
      shadowRadius: 16.0,

      elevation: 24
    },
    headerTitle: "Edit Connection",
    headerTitleStyle: {
      fontSize: 30,
      color: "white",
      fontFamily: "Arial"
    },
    headerTitleContainerStyle: {
      top: -16
    }
  });

  state = {
    firstname: "",
    lastname: "",
    phonenumber: ""
  };

  async componentDidMount() {
    this.setState({
      firstname: await AsyncStorage.getItem("tempConnFirst"),
      lastname: await AsyncStorage.getItem("tempConnLast"),
      phonenumber: await AsyncStorage.getItem("tempConnPhone")
    });
  }

  saveConnection = async () => {
    await AsyncStorage.getItem("userToken").then(email => {
      editConnection(
        email,
        this.state.phonenumber,
        this.state.firstname,
        this.state.lastname
      ).then(() => {
        this.props.navigation.navigate("AuthLoading");
      });
    });
  };

  render() {
    return (
      <View style={styles.viewStyle}>
        <TextInput
          style={styles.text}
          title="FirstName"
          placeholder="First Name"
          defaultValue={this.state.firstname}
          onChangeText={text => {
            this.setState({ firstname: text });
          }}
        />
        <TextInput
          style={styles.text}
          title="LastName"
          placeholder="Last Name"
          defaultValue={this.state.lastname}
          onChangeText={text => {
            this.setState({ lastname: text });
          }}
        />
        <TextInput
          style={styles.text}
          title="PhoneNumber"
          placeholder="Phone Number"
          defaultValue={this.state.phonenumber}
          onChangeText={text => {
            this.setState({ phonenumber: text });
          }}
        />
        <View style={[{ width: "50%", marginLeft: 75 }]}>
          <Button
            style={{
              marginBottom: 100,
              shadowColor: "#fff",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 3
              },
              shadowOpacity: 0.27,
              shadowRadius: 4.65,
              elevation: 6
            }}
            buttonStyle={{
              height: 50,
              width: 250,
              backgroundColor: "black"
            }}
            titleStyle={{
              color: "gray",
              fontSize: 20
            }}
            type="solid"
            title="Save"
            onPress={() => {
              this.saveConnection();
              this.props.navigation.navigate("AuthLoading");
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    marginBottom: 6,
    borderColor: "black",
    borderWidth: 1,
    width: "90%",
    marginLeft: 15
  },
  viewStyle: {
    paddingTop: 50
  },
  saveButton: {
    width: 40
  }
});

export default EditConnectionScreen;
