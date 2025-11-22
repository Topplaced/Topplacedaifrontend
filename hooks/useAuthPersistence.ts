import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setHydrated, restoreAuth } from '@/store/slices/authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAuthPersistence = () => {
  const dispatch = useDispatch();
  const { token, user, isHydrated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const restoreAuthFromStorage = async () => {
      if (isHydrated) return;

      try {
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          // Validate token by fetching user profile
          const response = await fetch(`${API_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            // Restore authentication with validated user data
            dispatch(restoreAuth({ 
              token: storedToken, 
              user: {
                _id: userData._id,
                name: userData.fullName || userData.name,
                email: userData.email,
                role: userData.role,
                phone: userData.phone,
                experience: userData.experience,
                resume_url: userData.resume_url,
                profile_image: userData.profile_image,
                goals: userData.goals,
                tech_stack: userData.tech_stack,
                profile_completion: userData.profile_completion,
                linkedin_profile: userData.linkedin_profile,
                education: userData.education,
                bio: userData.bio
              }
            }));
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            dispatch(setHydrated());
          }
        } else {
          // No token found, just mark as hydrated
          dispatch(setHydrated());
        }
      } catch (error) {
        console.error('Error restoring auth:', error);
        // Remove invalid token and mark as hydrated
        localStorage.removeItem('token');
        dispatch(setHydrated());
      }
    };

    restoreAuthFromStorage();
  }, [dispatch, isHydrated]);

  return { isHydrated, token, user };
};