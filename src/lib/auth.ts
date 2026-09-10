import { supabase } from "./supabase";

export const signUp = async (
  email: string,
  password: string,
<<<<<<< HEAD
  fullName: string,
  phone?: string
=======
  fullName: string
>>>>>>> origin/main
) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
<<<<<<< HEAD
        phone,
=======
>>>>>>> origin/main
      },
    },
  });
};

export const signIn = async (
  email: string,
  password: string
) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};
