import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Image,
  TextInput,
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
import { Ionicons } from "@expo/vector-icons";

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

      if (books.find((book) => book.bookId === bookData.items[0].id)) {
        alert("Book already exists in the list.");
        return;
      }

      console.log(bookData.items[0], "jjjfjfjjjfjjf");
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
      <View style={styles.header}>
        <TextInput style={styles.search} placeholder="Search title/book" />
        <View style={styles.searchIcon}>
          <Ionicons name="search" size={24} color={"black"} />
        </View>
      </View>
    </View>
  );
};

export default list;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 20,
    paddingTop: 20,
    // justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 8,
    paddingHorizontal: 34,
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: 10,
  },
});
