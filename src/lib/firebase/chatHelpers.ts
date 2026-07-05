/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  addDoc, 
  collection, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  Unsubscribe 
} from "firebase/firestore";
import { db } from "./config";
import { FirestoreMessage } from "../../types/chat.types";

/**
 * Sends a message to the specified room's chat subcollection.
 * Enforces text limits and updates the parent room's activity tracking timestamp.
 */
export async function sendMessage(
  roomId: string, 
  uid: string, 
  displayName: string, 
  text: string
): Promise<string> {
  const trimmedText = text.trim();

  // Enforce boundary safety: prevents blank strings from leaking to database
  if (trimmedText.length === 0) {
    throw new ValueError("Message content cannot be empty.");
  }

  // Enforce boundary safety: prevents high message volumes from polluting database payloads
  if (trimmedText.length > 500) {
    throw new RangeError("Message content exceeds 500 characters limit.");
  }

  const messagesRef = collection(db, "rooms", roomId, "messages");
  
  // Write the chat message record using server-side timestamps for sorting integrity
  const docRef = await addDoc(messagesRef, {
    uid,
    displayName,
    text: trimmedText,
    createdAt: serverTimestamp()
  });

  // Keep parent room activity state updated to prevent inactivity trigger checks from tripping
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    lastActiveAt: serverTimestamp()
  });

  return docRef.id;
}

/**
 * Subscribes to the 50 most recent chat messages in a room.
 * Implements descending sort constraints to cap query sizes and conserve database reads.
 */
export function subscribeChatMessages(
  roomId: string,
  callback: (messages: FirestoreMessage[]) => void,
  onError: (e: Error) => void
): Unsubscribe {
  const messagesRef = collection(db, "rooms", roomId, "messages");
  
  // Implements strict limit(50) so a room with 10k messages only loads the 50 newest items
  const q = query(
    messagesRef,
    orderBy("createdAt", "desc"),
    limit(50)
  );

  // Return the listener detachment token so hooks can call it on unmount to prevent leaks
  return onSnapshot(q, (snapshot) => {
    const list: FirestoreMessage[] = [];
    snapshot.forEach((snapDoc) => {
      const data = snapDoc.data();
      list.push({
        id: snapDoc.id,
        uid: data.uid || "",
        displayName: data.displayName || "Anonymous",
        text: data.text || "",
        createdAt: data.createdAt || null
      });
    });
    callback(list);
  }, onError);
}

// ValueError placeholder logic since TypeScript values must throw standard or customized Errors
class ValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValueError";
  }
}
