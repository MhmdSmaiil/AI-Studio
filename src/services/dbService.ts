import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const collections = {
  REPAIRS: "repairs",
  INVENTORY: "inventory",
  CUSTOMERS: "customers",
  TRANSACTIONS: "transactions",
  TECHNICIANS: "technicians"
};

// Generic CRUD helpers
export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void, orderField = "createdAt") => {
  const q = query(collection(db, collectionName), orderBy(orderField, "desc"));
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });
};

export const createDocument = async (collectionName: string, data: any) => {
  return await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  return await deleteDoc(docRef);
};

export const getDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
