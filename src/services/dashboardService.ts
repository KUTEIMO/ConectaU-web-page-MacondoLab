import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getProjects } from './projectsService';
import { getApplicationsByStudent, getApplicationsByCompany } from './applicationsService';
import { Application, Project } from '../types';

// Servicio para obtener estadísticas del dashboard
export interface CompanyStats {
  totalVacancies: number;
  activeVacancies: number;
  totalApplications: number;
  views: number;
}

export interface CompanyStatsResponse {
  stats: CompanyStats;
  applications: Application[];
  projects: Project[];
}

export const getCompanyStats = async (companyId: string): Promise<CompanyStatsResponse> => {
  try {
    const projects = await getProjects({ companyId });
    const applications = await getApplicationsByCompany(companyId, { projects });
    const stats: CompanyStats = {
      totalVacancies: projects.length,
      activeVacancies: projects.filter((p) => p.status === 'active').length,
      totalApplications: applications.length,
      views: 0,
    };
    return { stats, applications, projects };
  } catch (error) {
    console.error('Error getting company stats:', error);
    return {
      stats: {
        totalVacancies: 0,
        activeVacancies: 0,
        totalApplications: 0,
        views: 0,
      },
      applications: [],
      projects: [],
    };
  }
};

export const getAdminStats = async () => {
  try {
    // Contar usuarios
    const usersSnapshot = await getCountFromServer(collection(db, 'users'));
    const totalUsers = usersSnapshot.data().count;

    // Contar proyectos
    const projectsSnapshot = await getCountFromServer(collection(db, 'projects'));
    const totalProjects = projectsSnapshot.data().count;

    // Contar aplicaciones
    const applicationsSnapshot = await getCountFromServer(collection(db, 'applications'));
    const totalApplications = applicationsSnapshot.data().count;

    // Contar matches (aplicaciones aceptadas)
    const matchesQuery = query(
      collection(db, 'applications'),
      where('status', '==', 'accepted')
    );
    const matchesSnapshot = await getCountFromServer(matchesQuery);
    const totalMatches = matchesSnapshot.data().count;

    return {
      totalUsers,
      totalProjects,
      totalApplications,
      totalMatches,
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return {
      totalUsers: 0,
      totalProjects: 0,
      totalApplications: 0,
      totalMatches: 0,
    };
  }
};

export const getStudentStats = async (studentId: string) => {
  try {
    const applications = await getApplicationsByStudent(studentId);
    
    return {
      totalApplications: applications.length,
      pendingApplications: applications.filter((a) => a.status === 'pending').length,
      acceptedApplications: applications.filter((a) => a.status === 'accepted').length,
      rejectedApplications: applications.filter((a) => a.status === 'rejected').length,
    };
  } catch (error) {
    console.error('Error getting student stats:', error);
    return {
      totalApplications: 0,
      pendingApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
    };
  }
};

