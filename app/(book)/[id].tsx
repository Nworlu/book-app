import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  Stack,
  useGlobalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "@/config/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const BookPage = () => {
  const { id } = useGlobalSearchParams();
  const [book, setBook] = useState<any>(null);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    if (!book) return;
    const favorite = book.favorite;

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={26}
            color={"black"}
          />
          {/* <Text></Text> */}
        </TouchableOpacity>
      ),
    });
  }, [book]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const fbDoc = await getDoc(doc(FIREBASE_DB, `users/simon/books/${id}`));
      if (!fbDoc.exists()) {
        console.log("Book not found");
        return;
      }
      const data = await fbDoc.data();
      // console.log(`Book found: ${data}`);
      // console.log(data);
      setBook(data);
    };
    load();
  }, [id]);

  const toggleFavorite = async () => {
    const isFavorite = book.favorite;
    updateDoc(doc(FIREBASE_DB, `users/simon/books/${id}`), {
      favorite: !isFavorite,
    });
    setBook({ ...book, favorite: !isFavorite });
  };

  const removeBook = () => {
    const fbDoc = doc(FIREBASE_DB, `users/simon/books/${id}`);
    deleteDoc(fbDoc);
    navigation.goBack();
  };

  // const loadBookById = async (bookId:sttring) => {

  // }

  return (
    <ScrollView>
      <Stack.Screen
        options={{ headerTitle: book ? book?.volumeInfo?.title : "....." }}
      />

      <View style={styles.card}>
        {book && (
          <>
            <Image
              style={styles.image}
              source={{ uri: book.volumeInfo.imageLinks?.thumbnail }}
            />
            <Text style={styles.title}>{book?.volumeInfo?.title}</Text>
            <Text>{book?.volumeInfo?.description}</Text>
            <View>
              <Button title="Remove" onPress={removeBook} color={"red"} />
              <Button
                title="Read"
                onPress={() => router.push("/(book)/pdf/pdfReaderId")}
                color={"blue"}
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default BookPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 20,
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 4,
    marginBottom: 20,
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
    textAlign: "center",
  },
});
