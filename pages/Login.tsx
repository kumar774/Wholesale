
import React, { useState } from 'react';
import firebase, { auth, db } from '../firebase';
import { useAuthStore, useSettingsStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const { settings } = useSettingsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Set Persistence based on 'Remember Me' checkbox
      await auth.setPersistence(
        rememberMe 
          ? firebase.auth.Auth.Persistence.LOCAL 
          : firebase.auth.Auth.Persistence.SESSION
      );

      // Sign In using Firebase Auth
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (!user || !user.email) {
         throw new Error("User not found");
      }

      // Ensure admin document exists in Firestore (Security Rule requirement)
      try {
        await db.collection('admins').doc(user.email).set({
          email: user.email,
          role: 'admin',
          lastLogin: new Date()
        }, { merge: true });
      } catch (firestoreError: any) {
        console.warn("Could not update admin record:", firestoreError);
        if (firestoreError.code === 'permission-denied') {
            // Just log it, don't stop the login if auth succeeded
            console.log("Admin write permission denied - likely guest or restricted user.");
        }
      }

      // AUTHENTICATION SUCCESSFUL
      loginStore(user.email);
      toast.success(`Welcome back, ${user.email}`);
      navigate('/admin');

    } catch (error: any) {
      console.error(error);
      let message = error.message;
      if (error.code === 'auth/invalid-credential') {
        message = "Invalid email or password.";
      } else if (error.code === 'auth/user-not-found') {
        message = "User not found.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Access to this account has been temporarily disabled due to many failed login attempts.";
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-cyan-500 to-blue-500 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 text-brand-600 mb-4">
               <Lock size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
            <p className="text-gray-500 mt-2">
              Sign in to manage {settings.storeName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  placeholder="" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-500">
                Forgot password?
              </a>
            </div>

            <Button 
              type="submit" 
              className="w-full py-3 text-lg shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
              isLoading={isLoading}
            >
              Sign In
              {!isLoading && <ArrowRight size={18} />}
            </Button>
          </form>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
           <span className="text-xs text-gray-500">Secure System</span>
           <a href="/" className="text-xs font-medium text-brand-600 hover:text-brand-700">Return to Store</a>
        </div>
      </div>
    </div>
  );
};
