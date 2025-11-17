import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  QueryConstraint,
  OrderByDirection,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Application, Project } from '../types';
import { getProjectById, getProjects } from './projectsService';
import { getUserData } from './authService';

const mapApplicationDoc = async (docSnapshot: any): Promise<Application> => {
  const data = docSnapshot.data();
  const project = await getProjectById(data.projectId);
  const student = await getUserData(data.userId || data.studentId);

  return {
    id: docSnapshot.id,
    studentId: data.userId || data.studentId,
    studentName: student?.name,
    studentPhoto: student?.photoUrl,
    studentUniversity: student?.university,
    studentCareer: student?.career,
    studentSemester: student?.semester,
    studentSkills: student?.skills,
    projectId: data.projectId,
    projectTitle: project?.title,
    status: data.status || 'pending',
    message: data.message,
    companyId: data.companyId || project?.companyId,
    dateApplied: (data.appliedAt || data.dateApplied)?.toDate?.() || new Date(),
    reviewedAt: data.reviewedAt?.toDate?.(),
    resumeUrl: data.resumeUrl,
    coverLetter: data.coverLetter,
  } as Application;
};

type ApplicationField = 'userId' | 'studentId' | 'companyId' | 'projectId';

const applicationsCollection = collection(db, 'applications');

const sortByDateApplied = (applications: Application[]) =>
  applications.sort((a, b) => b.dateApplied.getTime() - a.dateApplied.getTime());

const runApplicationsQuery = async (
  constraints: QueryConstraint[],
  options?: { orderByField?: string; orderDirection?: OrderByDirection }
): Promise<Application[]> => {
  const appliedConstraints = [...constraints];
  if (options?.orderByField) {
    appliedConstraints.push(orderBy(options.orderByField, options.orderDirection ?? 'desc'));
  }
  try {
    const q = query(applicationsCollection, ...appliedConstraints);
    const snapshot = await getDocs(q);
    return Promise.all(snapshot.docs.map(mapApplicationDoc));
  } catch (error: any) {
    if (options?.orderByField && error.code === 'failed-precondition') {
      console.warn('Índice compuesto faltante. Consulta Firestore Console para crear el índice.');
      const fallbackQuery = query(applicationsCollection, ...constraints);
      const fallbackSnapshot = await getDocs(fallbackQuery);
      const applications = await Promise.all(fallbackSnapshot.docs.map(mapApplicationDoc));
      return sortByDateApplied(applications);
    }
    throw error;
  }
};

const fetchApplicationsByField = (field: ApplicationField, value: string) =>
  runApplicationsQuery([where(field, '==', value)], { orderByField: 'appliedAt', orderDirection: 'desc' });

const fetchApplicationsByProjectIds = async (projectIds: string[]): Promise<Application[]> => {
  if (projectIds.length === 0) return [];
  const chunkSize = 10;
  const chunkQueries: ReturnType<typeof getDocs>[] = [];
  for (let i = 0; i < projectIds.length; i += chunkSize) {
    const chunk = projectIds.slice(i, i + chunkSize);
    chunkQueries.push(getDocs(query(applicationsCollection, where('projectId', 'in', chunk))));
  }
  const snapshots = await Promise.all(chunkQueries);
  const results: Application[] = [];
  for (const snapshot of snapshots) {
    const applications = await Promise.all(snapshot.docs.map(mapApplicationDoc));
    results.push(...applications);
  }
  return sortByDateApplied(results);
};

const mergeApplications = (...lists: Application[][]): Application[] => {
  const map = new Map<string, Application>();
  lists.forEach((list) => {
    list.forEach((application) => map.set(application.id, application));
  });
  return sortByDateApplied(Array.from(map.values()));
};

export const getApplicationsByStudent = async (studentId: string): Promise<Application[]> => {
  const [userApps, legacyApps] = await Promise.all([
    fetchApplicationsByField('userId', studentId),
    fetchApplicationsByField('studentId', studentId),
  ]);
  return mergeApplications(userApps, legacyApps);
};

export const getApplicationsByProject = async (projectId: string): Promise<Application[]> => {
  return fetchApplicationsByField('projectId', projectId);
};

export const checkExistingApplication = async (studentId: string, projectId: string): Promise<boolean> => {
  const [currentSnapshot, legacySnapshot] = await Promise.all([
    getDocs(
      query(
        applicationsCollection,
        where('userId', '==', studentId),
        where('projectId', '==', projectId),
        limit(1)
      )
    ),
    getDocs(
      query(
        applicationsCollection,
        where('studentId', '==', studentId),
        where('projectId', '==', projectId),
        limit(1)
      )
    ),
  ]);
  return !currentSnapshot.empty || !legacySnapshot.empty;
};

export const getApplicationsByCompany = async (
  companyId: string,
  options?: { projects?: Project[] }
): Promise<Application[]> => {
  const [appsByCompany, projects] = await Promise.all([
    fetchApplicationsByField('companyId', companyId),
    options?.projects ? Promise.resolve(options.projects) : getProjects({ companyId }),
  ]);
  const projectIds = projects.map((project) => project.id);
  const appsByProject = await fetchApplicationsByProjectIds(projectIds);
  return mergeApplications(appsByCompany, appsByProject);
};

export const createApplication = async (
  application: Omit<Application, 'id' | 'dateApplied' | 'status'>
) => {
  // Verificar si ya existe una postulación
  const exists = await checkExistingApplication(application.studentId, application.projectId);
  if (exists) {
    throw new Error('Ya has postulado a esta vacante');
  }

  const docRef = await addDoc(collection(db, 'applications'), {
    userId: application.studentId,
    studentId: application.studentId,
    projectId: application.projectId,
    companyId: application.companyId,
    message: application.message || '',
    resumeUrl: application.resumeUrl,
    coverLetter: application.coverLetter,
    status: 'pending',
    appliedAt: serverTimestamp(),
  });

  // Incrementar contador de postulaciones en el proyecto
  try {
    const projectDoc = await getDoc(doc(db, 'projects', application.projectId));
    if (projectDoc.exists()) {
      const currentCount = projectDoc.data().applicationsCount || 0;
      await updateDoc(doc(db, 'projects', application.projectId), {
        applicationsCount: currentCount + 1,
      });
    }
  } catch (error) {
    console.error('Error actualizando contador de postulaciones:', error);
  }

  // Crear notificación para la empresa
  try {
    const projectDoc = await getDoc(doc(db, 'projects', application.projectId));
    if (projectDoc.exists()) {
      const project = projectDoc.data();
      const student = await getUserData(application.studentId);
      
      await addDoc(collection(db, 'notifications'), {
        userId: project.companyId,
        type: 'application',
        title: 'Nueva postulación',
        message: `${student?.name || 'Un estudiante'} postuló a "${project.title}"`,
        isRead: false,
        createdAt: serverTimestamp(),
        link: `/vacancies/${application.projectId}/applications`,
      });
    }
  } catch (error) {
    console.error('Error creando notificación:', error);
  }

  return docRef.id;
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: Application['status']
) => {
  await updateDoc(doc(db, 'applications', applicationId), {
    status,
    reviewedAt: status !== 'pending' ? serverTimestamp() : null,
  });
  
  // Crear notificación para el estudiante
  try {
    const applicationDoc = await getDoc(doc(db, 'applications', applicationId));
    if (applicationDoc.exists()) {
      const appData = applicationDoc.data();
      const projectDoc = await getDoc(doc(db, 'projects', appData.projectId));
      
      if (projectDoc.exists()) {
        const project = projectDoc.data();
        const statusMessages = {
          reviewed: 'tu postulación está siendo revisada',
          accepted: 'tu postulación fue aceptada',
          rejected: 'tu postulación fue rechazada',
        };
        
        await addDoc(collection(db, 'notifications'), {
          userId: appData.userId || appData.studentId,
          type: 'application_status',
          title: 'Actualización de postulación',
          message: `Tu postulación a "${project.title}" ${statusMessages[status] || 'cambió de estado'}`,
          isRead: false,
          createdAt: serverTimestamp(),
          link: `/applications`,
        });
      }
    }
  } catch (error) {
    console.error('Error creando notificación:', error);
  }
};
