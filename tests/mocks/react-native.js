const React = require('react');

const Text = React.forwardRef((props, ref) => {
  return React.createElement('span', { ...props, ref }, props.children);
});

const wrapChildren = (children) => {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return React.createElement(Text, null, child);
    }
    return child;
  });
};

const View = React.forwardRef((props, ref) => {
  return React.createElement('div', { ...props, ref }, wrapChildren(props.children));
});

const TouchableOpacity = React.forwardRef((props, ref) => {
  const onPress = props.onPress;
  const rest = { ...props };
  delete rest.onPress;
  return React.createElement(
    'div',
    { ...rest, ref, onClick: onPress },
    wrapChildren(props.children)
  );
});

const TextInput = React.forwardRef((props, ref) => {
  return React.createElement('input', { ...props, ref });
});

const ActivityIndicator = React.forwardRef((props, ref) => {
  return React.createElement('div', { ...props, ref });
});

const Pressable = React.forwardRef((props, ref) => {
  const onPress = props.onPress;
  const rest = { ...props };
  delete rest.onPress;
  return React.createElement('div', { ...rest, ref, onClick: onPress }, wrapChildren(props.children));
});

const FlatList = React.forwardRef((props, ref) => {
  return React.createElement('div', { ...props, ref }, wrapChildren(props.children));
});

const ScrollView = React.forwardRef((props, ref) => {
  return React.createElement('div', { ...props, ref }, wrapChildren(props.children));
});

const StyleSheet = {
  create: (obj) => obj,
};

const Image = React.forwardRef((props, ref) => {
  return React.createElement('img', { ...props, ref });
});

const Dimensions = {
  get: () => ({ width: 375, height: 812 }),
};

const Platform = {
  OS: 'android',
  select: (obj) => obj.android || obj.default,
};

const StatusBar = React.forwardRef((props, ref) => {
  return null;
});

const SafeAreaView = React.forwardRef((props, ref) => {
  return React.createElement('div', { ...props, ref }, wrapChildren(props.children));
});

const KeyboardAvoidingView = React.forwardRef((props, ref) => {
  return React.createElement('div', { ...props, ref }, wrapChildren(props.children));
});

const Alert = {
  alert: jest.fn(),
};

const Linking = {
  openURL: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

module.exports = {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Alert,
  Linking,
  default: {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Pressable,
    FlatList,
    ScrollView,
    StyleSheet,
    Image,
    Dimensions,
    Platform,
    StatusBar,
    SafeAreaView,
    KeyboardAvoidingView,
    Alert,
    Linking,
  },
};
