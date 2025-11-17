import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Project } from '../types';
import { DEFAULT_CITY } from '../constants/geo';

const normalizeType = (type: any): Project['type'] => {
  if (!type) return 'project';
  const value = String(type).toLowerCase();
  if (value.includes('práctica') || value.includes('practice')) return 'practice';
  return value.includes('proyecto') ? 'project' : (type as any);
};

const sortProjectsByDate = (projects: Project[]) =>
  projects.sort(
    (a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0)
  );

const normalizeStatus = (status: any): Project['status'] => {
  if (!status && typeof status !== 'boolean') {
    return 'active';
  }
  const value = typeof status === 'string' ? status.toLowerCase() : status;
  if (value === true) return 'active';
  if (value === false) return 'inactive';
  if (typeof value === 'string') {
    if (value.includes('active')) return 'active';
    if (value.includes('inactive')) return 'inactive';
    if (value.includes('closed') || value.includes('cerrad')) return 'closed';
  }
  return 'active';
};

const mapProjectDoc = (docSnapshot: any): Project => {
  const data = docSnapshot.data();
  const companyData = data.company || {};
  return {
    id: docSnapshot.id,
    ...data,
    companyId: data.companyId || data.company?.id || '',
    company: {
      ...companyData,
      id: companyData.id || data.companyId || '',
      name: companyData.name || data.companyName || 'Empresa',
    },
    status: normalizeStatus(data.status),
    type: normalizeType(data.type),
    location: data.location || DEFAULT_CITY,
    skillsRequired: data.skillsRequired || [],
    requirements: data.requirements || [],
    benefits: data.benefits || [],
    applicationsCount: data.applicationsCount || 0,
    minExperience: data.minExperience,
    maxExperience: data.maxExperience,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate(),
    closingDate: data.closingDate?.toDate(),
  } as Project;
};

export interface ProjectFilters {
  status?: string;
  type?: string;
  location?: string;
  modality?: string;
  category?: string;
  companyId?: string;
}

const matchesFilter = (value: string | undefined, filter?: string) => {
  if (!filter) return true;
  if (!value) return false;
  return value.toLowerCase() === filter.toLowerCase();
};

export const getProjects = async (filters?: ProjectFilters): Promise<Project[]> => {
  const collectionRef = collection(db, 'projects');
  const snapshots = [];

  if (filters?.companyId) {
    const constraints = query(collectionRef, where('companyId', '==', filters.companyId));
    snapshots.push(await getDocs(constraints));

    // Compatibilidad con documentos que almacenan el id en company.id
    const altConstraints = query(collectionRef, where('company.id', '==', filters.companyId));
    snapshots.push(await getDocs(altConstraints));
  } else {
    snapshots.push(await getDocs(collectionRef));
  }

  const projectsMap = new Map<string, Project>();
  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((docSnapshot) => {
      const project = mapProjectDoc(docSnapshot);
      projectsMap.set(project.id, project);
    });
  });

  let projects = Array.from(projectsMap.values());

  if (filters) {
    projects = projects.filter((project) => {
      const statusMatch = filters.status
        ? normalizeStatus(project.status) === normalizeStatus(filters.status)
        : true;
      const typeMatch = matchesFilter(project.type, filters.type);
      const modalityMatch = matchesFilter(project.modality, filters.modality);
      const locationMatch = matchesFilter(project.location, filters.location);
      const categoryMatch = matchesFilter(project.category, filters.category);
      const companyMatch = filters.companyId
        ? project.companyId === filters.companyId || project.company?.id === filters.companyId
        : true;
      return statusMatch && typeMatch && modalityMatch && locationMatch && categoryMatch && companyMatch;
    });
  }

  return sortProjectsByDate(projects);
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  const projectDoc = await getDoc(doc(db, 'projects', projectId));
  if (projectDoc.exists()) {
    return mapProjectDoc(projectDoc);
  }
  return null;
};

export const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'applicationsCount'>) => {
  const docRef = await addDoc(collection(db, 'projects'), {
    ...project,
    applicationsCount: 0,
    location: project.location || DEFAULT_CITY,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  await updateDoc(doc(db, 'projects', projectId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProject = async (projectId: string) => {
  await deleteDoc(doc(db, 'projects', projectId));
};

