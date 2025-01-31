import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type Props = {
  imageUrl: string;
};

const ImageViewer: React.FC<Props> = ({ imageUrl }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default ImageViewer;