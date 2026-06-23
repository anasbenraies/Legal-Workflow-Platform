import { adminDb } from "./firebase-admin";
// use require to avoid missing type declarations for bcryptjs in this workspace
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt: any = require("bcrypt");
import { Timestamp } from "firebase-admin/firestore";

const USERS = "users";


/* utility functions for user authentication and storage.*/
export async function createUser(input: { username: string; email: string; password: string }) {
  const id = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Timestamp.now();
  const hashed = bcrypt.hashSync(input.password, 10);

  const doc = {
    id,
    username: input.username,
    email: input.email,
    passwordHash: hashed,
    createdAt: now,
  } as const;

  await adminDb.collection(USERS).doc(id).set(doc as any);
  return { id, username: input.username, email: input.email };
}

export async function getUserByEmail(email: string) {
  const snap = await adminDb.collection(USERS).where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data() as any;
}

export async function getUserById(id: string) {
  const doc = await adminDb.collection(USERS).doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as any;
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compareSync(password, passwordHash);
}
