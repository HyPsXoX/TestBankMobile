import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOYiGgId1dViCS3qT7K0-_O05X-59NCMY",
  authDomain: "textbank.firebaseapp.com",
  projectId: "textbank",
  storageBucket: "textbank.firebasestorage.app",
  messagingSenderId: "653802392073",
  appId: "1:653802392073:web:ee298bc38132f3e8f886d8",
  measurementId: "G-KD9XY364FE"
};

// ✅ Initialize only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Reference to your collection
const recordsCol = collection(db, "records");

/* -----------------------------
   CRUD FUNCTIONS
--------------------------------/

/** Validate number format: xx-xxxx-xxxxxx/
function isValidNumber(str) {
  return /^\d{2}-\d{4}-\d{6}$/.test(str);
}

/ CREATE a record */
export async function createRecord(studentNumber, professorNumber) {
  if (!isValidNumber(studentNumber) || !isValidNumber(professorNumber)) {
    throw new Error("Invalid format. Expected xx-xxxx-xxxxxx");
  }

  const docRef = await addDoc(recordsCol, {
    Student_Number: studentNumber,
    Professor_Number: professorNumber,
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

// / READ all records /
export async function getAllRecords() {
  const snapshot = await getDocs(recordsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/** READ a single record by ID/
export async function getRecord(id) {
  const snap = await getDoc(doc(db, "records", id));
  if (!snap.exists()) throw new Error("Record not found");
  return { id: snap.id, ...snap.data() };
}

/ UPDATE a record */
export async function updateRecord(id, studentNumber, professorNumber) {
  const data = {};
  if (studentNumber) {
    if (!isValidNumber(studentNumber)) throw new Error("Invalid student number format");
    data.Student_Number = studentNumber;
  }
  if (professorNumber) {
    if (!isValidNumber(professorNumber)) throw new Error("Invalid professor number format");
    data.Professor_Number = professorNumber;
  }

  await updateDoc(doc(db, "records", id), data);
}

// DELETE a record */
export async function deleteRecord(id) {
  await deleteDoc(doc(db, "records", id));
}