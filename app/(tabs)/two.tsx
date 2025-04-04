import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
// import { BarCodeScanner } from "expo-barcode-scanner";
import { CameraView, Camera } from "expo-camera";
import { getBookByISBN } from "@/api/books";
import * as book1 from "@/api/book1.json";
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/config/FirebaseConfig";
import { Stack, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import storage from "@react-native-firebase/storage";

const list = () => {
  const [scanned, setScanned] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showScanner, settShowScanner] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const booksCollection = collection(FIREBASE_DB, "users", "simon", "books");

    onSnapshot(booksCollection, (snapshot) => {
      const books = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      setBooks(books);
    });
  }, []);

  // console.log(books, "kkkk");

  const downloadAndUploadPDF = async (pdfUrl: string, fileUri: string) => {
    try {
      // const pdfUrl = 'https://example.com/sample.pdf'; // Replace with actual PDF URL
      // const fileUri = FileSystem.cacheDirectory + 'sample.pdf';

      // Download the PDF
      const { uri } = await FileSystem.downloadAsync(pdfUrl, fileUri);
      console.log("PDF downloaded to:", uri);

      // Read the file as a blob
      const fileData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to Blob and Upload to Firebase
      const reference = storage().ref("uploads/sample.pdf");
      await reference.putString(fileData, "base64", {
        contentType: "application/pdf",
      });

      console.log("Upload successful");
    } catch (error) {
      console.error("Error downloading or uploading PDF:", error);
    }
  };

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);
  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    try {
      const bookData = await getBookByISBN(data);
      console.log(`Scanned Book Data: `, bookData);

      if (!bookData || !bookData.items || bookData.items.length === 0) {
        alert("No book found with this ISBN.");
        return;
      }

      console.log(bookData.items[0], "jjjfjfjjjfjjf");
      if (books.find((book) => book.bookId === bookData.items[0].id)) {
        alert("Book already exists in the list.");
        return;
      }

      addBook(bookData.items[0]);
    } catch (error) {
      console.error("Error fetching book:", error);
      alert("Failed to fetch book. Try again.");
    } finally {
      settShowScanner(false);
      setScanned(false);
    }
  };

  // const handleBarCodeScanned = async ({
  //   type,
  //   data,
  // }: {
  //   type: string;
  //   data: string;
  // }) => {
  //   setScanned(true);
  //   const code = data;
  //   const bookData = await getBookByISBN(code);
  //   console.log(` file: list.tsx:24 ~ handleBarCodeScanned ~ data: `, bookData);
  //   settShowScanner(false);
  //   setScanned(false);

  //   if (!bookData.items) return;
  //   addBook(bookData.items[0]);
  //   // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  // };

  const addBook = async (book: any) => {
    if (!book || !book.volumeInfo) return;

    try {
      const newBook = {
        bookId: book.id,
        volumeInfo: book.volumeInfo,
        webReaderLink: book.accessInfo?.webReaderLink ?? "",
        textSnippet: book.searchInfo?.textSnippet ?? "",
        favorite: false,
        created: serverTimestamp(),
      };

      const dbRef = await addDoc(
        collection(FIREBASE_DB, "users", "simon", "books"),
        newBook
      );
      console.log(`Book added with ID: ${dbRef.id}`);
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Failed to add book.");
    }
  };

  const onClose = () => {
    settShowScanner(false);
    setScanned(false);
  };

  // const addBook = async (book: any) => {
  //   // const result = book1.items[0];
  //   const newBook = {
  //     bookId: book.id,
  //     volumeInfo: book.volumeInfo,
  //     webReaderLink: book.accessInfo.webReaderLink,
  //     textSnippet: book.searchInfo?.textSnippet,
  //     favorite: false,
  //     created: serverTimestamp(),
  //   };

  //   const db = await addDoc(
  //     collection(FIREBASE_DB, "users", "simon", "books"),
  //     newBook
  //   );
  //   console.log(` file: list.tsx:40 ~ addBook ~ data: ${db}`);
  // };

  const renderItem: ListRenderItem<any> = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => router.push(`/(book)/${item.id}`)}>
        <View
          style={{
            flexDirection: "row",
            gap: 20,
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Image
            source={{ uri: item.volumeInfo.imageLinks.thumbnail }}
            style={{ width: 50, height: 50 }}
          />
          <View>
            <Text>{item.volumeInfo.title}</Text>
            <Text>{item.volumeInfo.authors[0]}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () =>
            showScanner && (
              <TouchableOpacity onPress={onClose}>
                <Text>Close</Text>
              </TouchableOpacity>
            ),
        }}
      />
      {showScanner && (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417", "ean13"],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {!showScanner && (
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
      {hasPermission && (
        <TouchableOpacity
          style={styles.fab}
          //   onPress={() => addBook()}
          onPress={() => settShowScanner(true)}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default list;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#03a9f4",
    width: 56,
    height: 56,
    borderRadius: 30,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: "white",
  },
});
