import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let initialized = false;
try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_ADMIN_SDK || '{}'
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
  } else {
    initialized = true;
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated by checking the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = admin.firestore();

    // Start a batch to delete all user data
    const batch = db.batch();

    // Delete user document
    const userRef = db.collection('users').doc(userId);
    batch.delete(userRef);

    // Delete all user's projects
    const projectsSnapshot = await db
      .collection('projects')
      .where('userId', '==', userId)
      .get();
    projectsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all user's tasks
    const tasksSnapshot = await db
      .collection('tasks')
      .where('userId', '==', userId)
      .get();
    tasksSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all user's clients
    const clientsSnapshot = await db
      .collection('clients')
      .where('userId', '==', userId)
      .get();
    clientsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all user's invoices
    const invoicesSnapshot = await db
      .collection('invoices')
      .where('userId', '==', userId)
      .get();
    invoicesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all user's quotes
    const quotesSnapshot = await db
      .collection('quotes')
      .where('userId', '==', userId)
      .get();
    quotesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all user's newsletter campaigns
    const campaignsSnapshot = await db
      .collection('newsletterCampaigns')
      .where('userId', '==', userId)
      .get();
    campaignsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all user's prospects
    const prospectsSnapshot = await db
      .collection('prospects')
      .where('userId', '==', userId)
      .get();
    prospectsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all user's email assignments
    const emailAssignmentsSnapshot = await db
      .collection('emailAssignments')
      .where('userId', '==', userId)
      .get();
    emailAssignmentsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all user's subcontractors
    const subcontractorsSnapshot = await db
      .collection('subcontractors')
      .where('userId', '==', userId)
      .get();
    subcontractorsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all user's schedule entries
    const scheduleSnapshot = await db
      .collection('schedule')
      .where('userId', '==', userId)
      .get();
    scheduleSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Commit the batch
    await batch.commit();

    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    console.log(`Account deleted for user: ${userId} (${userEmail})`);

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
