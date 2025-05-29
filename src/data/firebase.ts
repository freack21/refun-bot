import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../../firebaseCreds.json";

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

export const DB = getFirestore();
