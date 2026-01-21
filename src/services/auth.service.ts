import { supabase } from '../lib/supabase';

export interface AuthResponse {
  success: boolean;
  error?: string;
  isAdmin?: boolean;
}

/**
 * Iniciar sesión con email y contraseña
 */
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!data.user) {
      return { success: false, error: 'No se pudo autenticar' };
    }

    // Verificar si el usuario es admin
    const isAdmin = await checkIsAdmin(data.user.id);

    return { success: true, isAdmin };
  } catch {
    return { success: false, error: 'Error al iniciar sesión' };
  }
};

/**
 * Cerrar sesión
 */
export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

/**
 * Obtener la sesión actual
 */
export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

/**
 * Verificar si el usuario actual es admin
 */
export const checkIsAdmin = async (userId?: string): Promise<boolean> => {
  try {
    let uid = userId;

    if (uid === undefined) {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user;
      if (!sessionUser) return false;
      uid = sessionUser.id;
    }

    const { data, error } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', uid)
      .single();

    if (error) return false;

    return data.rol === 'admin';
  } catch {
    return false;
  }
};

/**
 * Suscribirse a cambios en el estado de autenticación
 */
export const onAuthStateChange = (callback: (isAdmin: boolean, userId: string | null) => void) => {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const isAdmin = await checkIsAdmin(session.user.id);
      callback(isAdmin, session.user.id);
    } else {
      callback(false, null);
    }
  });
};
