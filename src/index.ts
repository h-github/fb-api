import * as firebase from "firebase";
import { IDatabaseSetting } from "./types/databaseSetting";

class Database {
  firestore: firebase.firestore.Firestore;

  constructor(setting: IDatabaseSetting) {
    firebase.initializeApp({
      apiKey: setting.api_key,
      authDomain: `${setting.project_id}.firebaseapp.com`,
      projectId: setting.project_id,
    });

    this.firestore = firebase.firestore();
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
          toFirestore: (data: T): firebase.firestore.DocumentData => {
            return { ...data };
          },
          fromFirestore: (
            snapshot: firebase.firestore.QueryDocumentSnapshot<
              firebase.firestore.DocumentData
            >,
            options: firebase.firestore.SnapshotOptions
          ): T => {
            const data = snapshot.data(options);
            return <T>data;
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
          toFirestore: (data: T): firebase.firestore.DocumentData => {
            return { ...data };
          },
          fromFirestore: (
            snapshot: firebase.firestore.QueryDocumentSnapshot<
              firebase.firestore.DocumentData
            >,
            options: firebase.firestore.SnapshotOptions
          ): T => {
            const data = snapshot.data(options);
            return <T>data;
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
            toFirestore: (data: T): firebase.firestore.DocumentData => {
              return { ...data };
            },
            fromFirestore: (
              snapshot: firebase.firestore.QueryDocumentSnapshot<
                firebase.firestore.DocumentData
              >,
              options: firebase.firestore.SnapshotOptions
            ): T => {
              const data = snapshot.data(options);
              return <T>data;
            },
          })
          .get()
          .then(doc => {
            if (doc.empty) return [];
            return doc.docs.map(
              (dc: firebase.firestore.QueryDocumentSnapshot<T>) => dc.data()
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
