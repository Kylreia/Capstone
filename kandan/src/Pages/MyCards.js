import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from "../firebase";
import FlashcardList from "./FlashcardList";

function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [user, setUser] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [flashcardsLoaded, setFlashcardsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!user) {
        console.error('User not logged in');
        setErrorMessage('Please Login first to view your flashcards');
        setFlashcardsLoaded(true); // Set the flag to indicate flashcards have been loaded
        return;
      }
      try {
        const flashcardsCollection = collection(db, "flashcards");
        const flashcardsQuery = query(
          flashcardsCollection,
          where('UID', '==', user.uid)
        );
        const snapshot = await getDocs(flashcardsQuery);
        const fetchedFlashcards = snapshot.docs.map((doc) => ({
          qlang: doc.data().lang1,
          alang: doc.data().lang2,
          question: doc.data().side1,
          answer: doc.data().side2,
          box: doc.data().Box,
          id: doc.id
        }));

       
        setFlashcards(fetchedFlashcards);
        setFlashcardsLoaded(true); // Set the flag to indicate flashcards have been loaded
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        setErrorMessage('Error fetching flashcards');
        setFlashcardsLoaded(true); // Set the flag to indicate flashcards have been loaded
      }
    };

    fetchFlashcards();
  }, [user]);

  if (!flashcardsLoaded) {
    // Display loading state or spinner while flashcards are being fetched
    return <div>Loading...</div>;
  }

  if (!user) {
    // Display a message when user is not logged in
    return <div className="notlog">Please login to view your flashcards.</div>;
  }


  return (
  <div>
    <h2 className="myfc-head">My Flashcards</h2>
    <div className="myfc-container">
      {flashcards.map((flashcard) => (
        <div key={flashcard.id}>
          <p className="indivcards">{flashcard.qlang}: {flashcard.question} - {flashcard.answer} ({flashcard.alang})</p>
        </div>
      ))}
    </div>
  </div>  
    
  );

}
export default Flashcards;
