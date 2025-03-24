import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import ReactNativeBlobUtil from "react-native-blob-util";
import PdfRendererView from "react-native-pdf-renderer";
// "http://books.google.com/books?id=MxTQEAAAQBAJ&printsec=frontcover&dq=9781292135700&hl=&cd=1&source=gbs_api"
const pdfUri =
  "http://books.google.com/books?id=MxTQEAAAQBAJ&printsec=frontcover&dq=9781292135700&hl=&cd=1&source=gbs_api";
const pdfReaderId = () => {
  const [loading, setLoading] = useState(true);
  const [pdfPath, setPdfPath] = useState("");

  useEffect(() => {
    setLoading(true);
    const fetchProcess = ReactNativeBlobUtil.config({
      fileCache: true,
      appendExt: "pdf",
    }).fetch("GET", pdfUri);

    fetchProcess
      .then((res) => {
        const path = res.path();
        setPdfPath(path);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => {
      fetchProcess.cancel();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!pdfPath) {
    return (
      <View style={styles.centeredContainer}>
        <Text>An error occured while downloading the pdf file.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PdfRendererView
        source={pdfPath}
        distanceBetweenPages={16}
        maxZoom={5}
        style={styles.pdfContainer}
      />
    </View>
  );
};

export default pdfReaderId;

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  pdfContainer: {
    backgroundColor: "#ddd",
  },
});
