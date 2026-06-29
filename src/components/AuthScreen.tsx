import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (err: any): string => {
    const msg = (err?.message || '').toLowerCase();

    if (msg === 'email-kan ma diiwaangashana') {
      return 'Iimaylkan ma diiwaangashana. Fadlan is-diiwaangeli.';
    }
    if (msg === 'password-ku waa khaldan yahay') {
      return 'Furaha (password-ka) aad gelisay waa khaldan yahay.';
    }

    if (!isSignIn) {
      if (msg.includes('already registered') || msg.includes('user already exists')) {
        return 'Iimaylkan horey ayaa loo diiwaangeliyey. Fadlan geli iimayl kale.';
      }
      if (msg.includes('invalid email')) return 'Iimaylka aad gelisay ma ahan mid sax ah.';
      if (msg.includes('password')) return 'Furaha waa inuu ka badanyahay 6 xaraf.';
      return 'Cilad ayaa dhacday intii lagu guda jiray diiwaangelinta.';
    }

    if (
      msg.includes('invalid login') ||
      msg.includes('invalid credentials') ||
      msg.includes('email not confirmed')
    ) {
      return 'Iimaylka ama furaha (password-ka) aad gelisay waa khaldan yihiin.';
    }
    if (msg.includes('user not found') || msg.includes('no user')) {
      return 'Iimaylkan lama helin. Fadlan is-diiwaangeli.';
    }
    if (msg.includes('wrong password') || msg.includes('incorrect password')) {
      return 'Furaha aad gelisay waa khaldan yahay.';
    }
    return 'Cilad ayaa dhacday. Fadlan isku day mar kale.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Fadlan geli iimaylkaaga.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Furaha waa inuu ka badanyahay 6 xaraf.');
      return;
    }
    if (!isSignIn && !name.trim()) {
      setError('Fadlan geli magacaaga kooban.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignIn) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          const { data: profileCheck } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (!profileCheck) {
            throw new Error('email-kan ma diiwaangashana');
          } else {
            throw new Error('password-ku waa khaldan yahay');
          }
        }

        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user!.id)
          .single();

        if (!profile) {
          const newProfile = {
            id: data.user!.id,
            email: data.user!.email || email,
            username: data.user!.user_metadata?.full_name || email.split('@')[0] || 'User',
            avatar_url: '',
            is_admin: false,
          };
          const { data: insertedProfile } = await supabase
            .from('profiles')
            .upsert(newProfile, { onConflict: 'id' })
            .select()
            .single();

          profile = insertedProfile || newProfile;
        }

        onLoginSuccess({
          id: data.user!.id,
          email: data.user!.email || email,
          username: profile.username || data.user!.email?.split('@')[0] || 'User',
          avatar_url: profile.avatar_url || '',
          is_admin: profile.is_admin || false,
        });
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            username: name,
          }, { onConflict: 'id' });

          onLoginSuccess({
            id: data.user.id,
            email: data.user.email || email,
            username: name,
            avatar_url: '',
            is_admin: false,
          });
        }
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (signIn: boolean) => {
    setIsSignIn(signIn);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="relative w-full min-h-screen bg-[#F7F3EE] flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden px-6 py-12 text-[#1C1410]">
      {/* Brand logo & elegant header presentation - very airy & minimalist */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center mb-10 w-full max-w-sm mt-4 text-center"
      >
        <div className="relative mb-6">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#f8ebe6] shadow-sm flex items-center justify-center overflow-hidden border border-[#d7c2b8] transition-transform duration-300">
            <img
              alt="Dhaqan Suge Logo"
              className="w-full h-full object-cover p-1 mix-blend-multiply"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuASjxaFK62sKQuBl2NAxoqkt8-6Pfxb21PFnNX6k8wxmUZNmGgM9UWtTRGF2B2Hv3wStyr1gBRthZMOuES7BzIbsD_r5GG2fsYrnrDsgAjLrENdctSTNV-JeLgTk86h9SjL-oHtUjJra3dB3R6I0MasKOGxdXI6l6SZQVfadJ8A27YBz2j-BCLGmmKc5F4t8lcR8Gsj6Os_CF4g3z8uu8OG-Tt2LqNz2mSiGCxTnxIHRBaF_dyDsXjZWI7L_Nk8KA4iarOFF3Jev-Q"
            />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-[#1C1410] uppercase mb-1">
          DHAQAN SUGE
        </h1>
        <p className="text-xs text-[#52443c] lowercase tracking-wide font-normal">
          dhaqanka soomaalida ee suban & farshaxan
        </p>
      </motion.div>

      {/* Clean, minimalist form structure with spacious layout */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-sm mx-auto flex flex-col"
      >
        {/* Sleek toggle selector */}
        <div className="w-full bg-[#f8ebe6] rounded-3xl p-1.5 flex mb-8 border border-[#d7c2b8] relative">
          <button
            type="button"
            onClick={() => switchTab(true)}
            className={`flex-1 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 relative z-10 ${
              isSignIn ? 'text-[#1C1410]' : 'text-[#52443c] hover:text-[#1C1410]'
            }`}
          >
            Sign In
            {isSignIn && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-[#EDE0CE] rounded-2xl shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => switchTab(false)}
            className={`flex-1 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 relative z-10 ${
              !isSignIn ? 'text-[#1C1410]' : 'text-[#52443c] hover:text-[#1C1410]'
            }`}
          >
            Sign Up
            {!isSignIn && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-[#EDE0CE] rounded-2xl shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#ffdad6] border border-[#93000a]/20 text-[#93000a] rounded-2xl p-4 text-xs font-medium leading-relaxed"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Input Field for SignUp */}
          <AnimatePresence>
            {!isSignIn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2 overflow-hidden"
              >
                <label className="text-xs font-medium text-[#5D3C1E]" htmlFor="name">
                  Username
                </label>
                <input
                  className="w-full bg-[#f8ebe6] border border-[#d7c2b8] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-[#5D3C1E] focus:ring-2 focus:ring-[#5D3C1E]/10 transition-all placeholder:text-[#52443c]/40 text-[#1C1410]"
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="Username-kaaga"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Address Input Field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#5D3C1E]" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full bg-[#f8ebe6] border border-[#d7c2b8] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-[#5D3C1E] focus:ring-2 focus:ring-[#5D3C1E]/10 transition-all placeholder:text-[#52443c]/40 text-[#1C1410]"
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
            />
          </div>

          {/* Password Input Field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#5D3C1E]" htmlFor="password">
              Password
            </label>
            <input
              className="w-full bg-[#f8ebe6] border border-[#d7c2b8] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-[#5D3C1E] focus:ring-2 focus:ring-[#5D3C1E]/10 transition-all placeholder:text-[#52443c]/40 text-[#1C1410]"
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
            />
            {isSignIn && (
              <div className="w-full flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setError('Habka bedalaada furaha wali diyaar ma aha.')}
                  className="text-xs font-medium text-[#835331] hover:text-[#5D3C1E] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5D3C1E] hover:bg-[#1C1410] active:scale-[0.99] text-[#F7F3EE] py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                Sugi...
              </>
            ) : isSignIn ? (
              'Sign In'
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
