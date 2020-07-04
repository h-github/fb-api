import * as admin from "firebase-admin";
import { IDatabaseSetting } from "./types/databaseSetting";

class Database {
  firestore: FirebaseFirestore.Firestore;

  constructor(setting: IDatabaseSetting) {
    admin.initializeApp({ projectId: setting.project_id });
    this.firestore = admin.firestore();
  }

  write<T>(
    { collection, id }: { collection: string; id: string },
    document: T
  ): void {
    try {
      if (!collection || !id || document === undefined) {
        throw new Error("collection, id, and document are required");
      }
      this.firestore
        .collection(collection)
        .doc(id)
        .withConverter<T>({
          toFirestore: (data: T): FirebaseFirestore.DocumentData => {
            return { ...data };
          },
          fromFirestore: (data: FirebaseFirestore.DocumentData): T => {
            return data as T;
          },
        })
        .set(document)
        .then(docRef => docRef)
        .catch((reason: any) => reason);
    } catch (error) {
      console.error(error);
    }
  }

  readOne<T>({
    collection,
    id,
  }: {
    collection: string;
    id: string;
  }): Promise<T | undefined> {
    try {
      if (!collection || !id) {
        throw new Error("collection and id are required");
      }

      return this.firestore
        .collection(collection)
        .doc(id)
        .withConverter<T>({
          toFirestore: (data: T): FirebaseFirestore.DocumentData => {
            return { ...data };
          },
          fromFirestore: (data: FirebaseFirestore.DocumentData): T => {
            return data as T;
          },
        })
        .get()
        .then(doc => {
          return doc?.data();
        })
        .catch(error => {
          throw new Error(error);
        });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  readMany<T>(
    { collection }: { collection: string },
    filters?: Object
  ): Promise<T[]> {
    try {
      if (!collection) {
        throw new Error("collection is required");
      }

      return (
        this.firestore
          .collection(collection)
          // .limit(limit)
          .withConverter<T>({
            toFirestore: (data: T): FirebaseFirestore.DocumentData => {
              return { ...data };
            },
            fromFirestore: (data: FirebaseFirestore.DocumentData): T => {
              return data as T;
            },
          })
          .get()
          .then(doc => {
            if (doc.empty) return [];
            return doc.docs.map(
              (dc: FirebaseFirestore.QueryDocumentSnapshot<T>) => dc.data()
            );
          })
          .catch((error: any) => {
            throw new Error(error);
          })
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default Database;
