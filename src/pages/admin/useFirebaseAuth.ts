import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

interface UseFirebaseAuthReturn {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  authError: Error | null;
}

export const useFirebaseAuth = (): UseFirebaseAuthReturn => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setIsLoading(true);
        try {
          if (user) {
            // Here you would typically check if the user has admin claims
            // For this example, we'll simulate this with a check for a specific email
            // In a real app, you'd use Firebase custom claims or check admin status in Firestore
            const token = await user.getIdTokenResult();
            const hasAdminClaim = token.claims.admin === true;
            
            setCurrentUser(user);
            setIsAdmin(hasAdminClaim);
          } else {
            setCurrentUser(null);
            setIsAdmin(false);
          }
          setAuthError(null);
        } catch (error) {
          console.error('Auth state error:', error);
          setAuthError(error instanceof Error ? error : new Error('Unknown authentication error'));
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Auth state error:', error);
        setAuthError(error);
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);
  
  return { currentUser, isAdmin, isLoading, authError };
};