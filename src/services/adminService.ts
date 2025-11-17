import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getCountFromServer,
  query,
  where,
  serverTimestamp,
  limit,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Application, Project, User } from '../types';
import { getProjects } from './projectsService';

const mapUserDoc = (docSnapshot: any): User => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.(),
  } as User;
};

const usersCollection = collection(db, 'users');
const projectsCollection = collection(db, 'projects');
const applicationsCollection = collection(db, 'applications');

export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(mapUserDoc);
};

export const updateUserActiveStatus = async (userId: string, isActive: boolean) => {
  await updateDoc(doc(db, 'users', userId), {
    isActive,
    updatedAt: serverTimestamp(),
  });
};

export const updateUserVerificationStatus = async (userId: string, isVerified: boolean) => {
  await updateDoc(doc(db, 'users', userId), {
    isVerified,
    updatedAt: serverTimestamp(),
  });
};

export const getAllProjectsForAdmin = async () => {
  return getProjects();
};

export const updateProjectStatusAdmin = async (projectId: string, status: string) => {
  await updateDoc(doc(db, 'projects', projectId), {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProjectAdmin = async (projectId: string) => {
  await deleteDoc(doc(db, 'projects', projectId));
};

export interface AdminAnalytics {
  totalUsers: number;
  totalCompanies: number;
  totalStudents: number;
  totalProjects: number;
  totalApplications: number;
  acceptedApplications: number;
  reviewedApplications: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingVerifications: number;
  pendingCompanies: number;
  pendingStudents: number;
  projectsByStatus: Record<Project['status'], number>;
  applicationsByStatus: Record<Application['status'], number>;
}

export interface PendingUserSummary extends Pick<User, 'id' | 'name' | 'email' | 'role' | 'university' | 'companyName' | 'isVerified' | 'isActive' | 'createdAt'> {}

export interface AdminProjectSummary {
  id: string;
  title: string;
  companyName?: string;
  status: Project['status'];
  applicationsCount: number;
  createdAt: Date;
  location?: string;
  modality?: string;
  type?: Project['type'];
}

export interface AdminDashboardData {
  stats: AdminAnalytics;
  pendingUsers: PendingUserSummary[];
  recentProjects: AdminProjectSummary[];
}

const PROJECT_STATUSES: Project['status'][] = ['active', 'inactive', 'closed'];
const APPLICATION_STATUSES: Application['status'][] = ['pending', 'reviewed', 'interview', 'accepted', 'rejected'];

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const [
    totalUsersSnapshot,
    companiesSnapshot,
    studentsSnapshot,
    projectsSnapshot,
    applicationsSnapshot,
    acceptedSnapshot,
    reviewedSnapshot,
    activeUsersSnapshot,
    inactiveUsersSnapshot,
    pendingVerificationSnapshot,
  ] = await Promise.all([
    getCountFromServer(usersCollection),
    getCountFromServer(query(usersCollection, where('role', '==', 'company'))),
    getCountFromServer(query(usersCollection, where('role', '==', 'student'))),
    getCountFromServer(projectsCollection),
    getCountFromServer(applicationsCollection),
    getCountFromServer(query(applicationsCollection, where('status', '==', 'accepted'))),
    getCountFromServer(query(applicationsCollection, where('status', '==', 'reviewed'))),
    getCountFromServer(query(usersCollection, where('isActive', '==', true))),
    getCountFromServer(query(usersCollection, where('isActive', '==', false))),
    getCountFromServer(query(usersCollection, where('isVerified', '==', false))),
  ]);

  const [pendingUsersSnapshot, recentProjectsSnapshot, applicationStatusSnapshots, projectStatusSnapshots] =
    await Promise.all([
      getDocs(query(usersCollection, where('isVerified', '==', false), limit(6))),
      getDocs(query(projectsCollection, orderBy('createdAt', 'desc'), limit(6))),
      Promise.all(
        APPLICATION_STATUSES.map((status) =>
          getCountFromServer(query(applicationsCollection, where('status', '==', status)))
        )
      ),
      Promise.all(
        PROJECT_STATUSES.map((status) =>
          getCountFromServer(query(projectsCollection, where('status', '==', status)))
        )
      ),
    ]);

  const pendingUsers = pendingUsersSnapshot.docs
    .map(mapUserDoc)
    .sort(
      (a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0)
    );

  const recentProjects: AdminProjectSummary[] = recentProjectsSnapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      title: data.title,
      companyName: data.company?.name || data.companyName,
      status: data.status || 'active',
      applicationsCount: data.applicationsCount || 0,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      location: data.location,
      modality: data.modality,
      type: data.type,
    };
  });

  const applicationsByStatus = APPLICATION_STATUSES.reduce((acc, status, index) => {
    acc[status] = applicationStatusSnapshots[index].data().count;
    return acc;
  }, {} as Record<Application['status'], number>);

  const projectsByStatus = PROJECT_STATUSES.reduce((acc, status, index) => {
    acc[status] = projectStatusSnapshots[index].data().count;
    return acc;
  }, {} as Record<Project['status'], number>);

  const pendingCompanies = pendingUsers.filter((user) => user.role === 'company').length;
  const pendingStudents = pendingUsers.filter((user) => user.role === 'student').length;

  const stats: AdminAnalytics = {
    totalUsers: totalUsersSnapshot.data().count,
    totalCompanies: companiesSnapshot.data().count,
    totalStudents: studentsSnapshot.data().count,
    totalProjects: projectsSnapshot.data().count,
    totalApplications: applicationsSnapshot.data().count,
    acceptedApplications: acceptedSnapshot.data().count,
    reviewedApplications: reviewedSnapshot.data().count,
    activeUsers: activeUsersSnapshot.data().count,
    inactiveUsers: inactiveUsersSnapshot.data().count,
    pendingVerifications: pendingVerificationSnapshot.data().count,
    pendingCompanies,
    pendingStudents,
    projectsByStatus,
    applicationsByStatus,
  };

  return {
    stats,
    pendingUsers,
    recentProjects,
  };
};

export const getAdminAnalytics = async (): Promise<AdminAnalytics> => {
  const { stats } = await getAdminDashboardData();
  return stats;
};

