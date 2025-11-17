import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { SavedProfile, StudentProfile, StudentWithProfile, User } from '../types';

const USERS_COLLECTION = collection(db, 'users');

const mapStudent = (docSnapshot: any): User => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.(),
    skills: data.skills || [],
  } as User;
};

const normalizeString = (value?: string) => value?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';

const normalizeUniversityName = (value?: string) => {
  const normalized = normalizeString(value);
  if (!normalized) return undefined;
  if (normalized.includes('sim')) return 'UNISIMON';
  if (normalized.includes('francisco') || normalized.includes('paula') || normalized.includes('ufps')) return 'UFPS';
  if (normalized.includes('desarrollo') || normalized.includes('udes')) return 'UDES';
  if (normalized.includes('pamplona')) return 'UNIPAMPLONA';
  return undefined;
};

const mapStudentProfile = (docSnapshot: any): StudentProfile | null => {
  if (!docSnapshot.exists()) return null;
  const data = docSnapshot.data();
  return {
    userId: docSnapshot.id,
    ...data,
    featuredProjects: (data.featuredProjects || data.projects || []).map((project: any) => ({
      title: project.title || project.name,
      description: project.description,
      link: project.link || project.url,
    })),
    skills: data.skills || data.hardSkills || [],
    languages: data.languages || data.idioms || [],
    createdAt: data.createdAt?.toDate?.(),
    updatedAt: data.updatedAt?.toDate?.(),
  };
};

export interface StudentFilters {
  search?: string;
  university?: string;
  career?: string;
  semester?: string;
  skills?: string[];
  limitResults?: number;
}

export const getStudents = async (filters?: StudentFilters): Promise<StudentWithProfile[]> => {
  const snapshot = await getDocs(query(USERS_COLLECTION, where('role', '==', 'student')));
  const profileSnapshot = await getDocs(collection(db, 'student_profiles'));

  const profileMap = new Map<string, StudentProfile>();
  profileSnapshot.docs.forEach((docSnapshot) => {
    const profile = mapStudentProfile(docSnapshot);
    if (profile) {
      profileMap.set(docSnapshot.id, profile);
    }
  });

  let students: StudentWithProfile[] = snapshot.docs.map((docSnapshot) => {
    const student = mapStudent(docSnapshot);
    const profile = profileMap.get(student.id) || null;
    const combinedSkills = Array.from(new Set([...(student.skills || []), ...(profile?.skills || [])]));
    const searchTokens = [
      student.name,
      student.career,
      student.university,
      student.semester,
      profile?.headline,
      profile?.summary,
      ...combinedSkills,
    ]
      .filter(Boolean)
      .map((value) => normalizeString(value));

    return {
      ...student,
      profile,
      normalizedUniversity: normalizeUniversityName(student.university),
      normalizedCareer: normalizeString(student.career),
      normalizedSemester: student.semester
        ? student.semester.replace(/\D/g, '')
        : undefined,
      normalizedSkills: combinedSkills.map((skill) => normalizeString(skill)),
      searchIndex: searchTokens.join(' '),
    };
  });

  const matchesFilter = (value: string | undefined, filter?: string) => {
    if (!filter) return true;
    if (!value) return false;
    return value.toLowerCase().includes(filter.toLowerCase());
  };

  if (filters?.university) {
    students = students.filter((student) => student.normalizedUniversity === filters.university);
  }

  if (filters?.career) {
    const target = normalizeString(filters.career);
    students = students.filter((student) =>
      student.normalizedCareer?.includes(target) ||
      normalizeString(student.profile?.headline).includes(target)
    );
  }

  if (filters?.semester) {
    students = students.filter((student) => student.normalizedSemester === filters.semester);
  }

  if (filters?.skills && filters.skills.length > 0) {
    const normalizedSkills = filters.skills.map(normalizeString);
    students = students.filter((student) =>
      normalizedSkills.every((skill) =>
        (student.normalizedSkills || []).some((studentSkill) => studentSkill.includes(skill))
      )
    );
  }

  if (filters?.search) {
    const normalized = filters.search.toLowerCase();
    students = students.filter((student) => {
      const tokens = [
        student.name,
        student.career,
        student.semester,
        student.university,
        student.profile?.headline,
        ...(student.skills || []),
        ...(student.profile?.skills || []),
      ]
        .filter(Boolean)
        .map((value) => value!.toLowerCase());

      return tokens.some((token) => token.includes(normalized));
    });
  }

  students.sort(
    (a, b) =>
      (b.createdAt?.getTime() || 0) -
      (a.createdAt?.getTime() || 0)
  );

  if (filters?.limitResults) {
    return students.slice(0, filters.limitResults);
  }

  return students;
};

export const getStudentProfile = async (studentId: string) => {
  const [userDoc, profileDoc] = await Promise.all([
    getDoc(doc(db, 'users', studentId)),
    getDoc(doc(db, 'student_profiles', studentId)),
  ]);

  if (!userDoc.exists()) {
    return null;
  }

  return {
    user: mapStudent(userDoc),
    profile: mapStudentProfile(profileDoc),
  };
};

const mapSavedProfile = (docSnapshot: any): SavedProfile => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    companyId: data.companyId || data.userId,
    studentId: data.studentId,
    studentName: data.studentName,
    studentPhoto: data.studentPhoto,
    note: data.note,
    savedAt: data.savedAt?.toDate?.() || new Date(),
  };
};

const savedProfilesRoot = collection(db, 'savedProfiles');
const savedProfilesSub = (companyId: string) => collection(db, 'companies', companyId, 'savedProfiles');

const rootDocRef = (companyId: string, studentId: string) =>
  doc(db, 'savedProfiles', `${companyId}_${studentId}`);

const fetchRootProfiles = async (companyId: string, studentId?: string) => {
  if (studentId) {
    const snapshot = await getDoc(rootDocRef(companyId, studentId));
    if (snapshot.exists()) {
      return [{ ref: snapshot.ref, data: mapSavedProfile(snapshot) }];
    }
    return [];
  }
  const snapshot = await getDocs(query(savedProfilesRoot, where('userId', '==', companyId)));
  return snapshot.docs.map((docSnapshot) => ({ ref: docSnapshot.ref, data: mapSavedProfile(docSnapshot) }));
};

const fetchSubcollectionProfiles = async (companyId: string, studentId?: string) => {
  if (studentId) {
    const snapshot = await getDoc(doc(savedProfilesSub(companyId), studentId));
    if (snapshot.exists()) {
      return [{ ref: snapshot.ref, data: mapSavedProfile(snapshot) }];
    }
    return [];
  }
  const snapshot = await getDocs(savedProfilesSub(companyId));
  return snapshot.docs.map((docSnapshot) => ({ ref: docSnapshot.ref, data: mapSavedProfile(docSnapshot) }));
};

const findSavedProfileDocs = async (companyId: string, studentId?: string) => {
  const rootResults = await fetchRootProfiles(companyId, studentId);
  const subResults = await fetchSubcollectionProfiles(companyId, studentId);
  return [...rootResults, ...subResults];
};

export const getSavedProfiles = async (companyId: string): Promise<SavedProfile[]> => {
  const refs = await findSavedProfileDocs(companyId);
  const unique = new Map<string, SavedProfile>();

  refs.forEach(({ data }) => {
    if (!data.studentId) return;
    unique.set(`${data.companyId || companyId}_${data.studentId}`, data);
  });

  return Array.from(unique.values());
};

const sanitizeProfilePayload = (payload: Record<string, any>) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

export const saveStudentProfile = async (
  companyId: string,
  studentId: string,
  payload?: Partial<SavedProfile>
) => {
  const data = sanitizeProfilePayload({
    userId: companyId,
    companyId,
    studentId,
    studentName: payload?.studentName,
    studentPhoto: payload?.studentPhoto,
    note: payload?.note || '',
    savedAt: serverTimestamp(),
  });

  try {
    await setDoc(rootDocRef(companyId, studentId), data, { merge: true });
    return `${companyId}_${studentId}`;
  } catch (error) {
    console.warn('No se pudo guardar en savedProfiles raíz, intentando subcolección.', error);
    await setDoc(doc(savedProfilesSub(companyId), studentId), data, { merge: true });
    return studentId;
  }
};

export const removeSavedProfile = async (companyId: string, studentId: string) => {
  const refs = await findSavedProfileDocs(companyId, studentId);
  if (refs.length === 0) return;

  await Promise.all(
    refs.map(async ({ ref }) => {
      try {
        await deleteDoc(ref);
      } catch (error) {
        console.error('No se pudo eliminar el perfil guardado:', error);
      }
    })
  );
};

