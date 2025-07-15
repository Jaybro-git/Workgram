'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'candidate',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [loading, setLoading] = useState(false); // ✅ loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAccountTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, accountType: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true); // ✅ start loading

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Signup failed');
      } else {
        alert(data.message);
        setForm({ name: '', email: '', password: '', confirmPassword: '', accountType: 'candidate' });
        setAgreeTerms(false);
        router.push('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  const handleSocialSignIn = (provider: string) => {
    console.log(`Sign up with ${provider}`);
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-2xl rounded-3xl overflow-hidden">
        {/* Left Section */}
        <div className="bg-blue-50 flex-1 p-10 flex items-center justify-center">
          <div className="max-w-md text-center">
            <h2 className="text-4xl font-bold text-blue-700 mb-4">Join WorkGram</h2>
            <p className="text-gray-700 text-lg mb-6">
              Create your profile, showcase your achievements, and connect with top recruiters. Your career journey starts here.
            </p>
            <div className="w-full h-79 overflow-hidden relative">
              <img
                src="https://freepngimg.com/thumb/jobs/13-2-jobs-png-pic.png"
                alt="Career Illustration"
                className="w-full h-auto object-top"
              />
            </div>
          </div>
        </div>

        {/* Right Section (Form) */}
        <div className="bg-white flex-1 p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create your account</h1>

          {/* Account Type Toggle */}
          <div className="mb-6 flex gap-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="accountType"
                value="candidate"
                checked={form.accountType === 'candidate'}
                onChange={handleAccountTypeChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700">Candidate</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="accountType"
                value="recruiter"
                checked={form.accountType === 'recruiter'}
                onChange={handleAccountTypeChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700">Recruiter</span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-100 border text-black border-gray-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-100 border text-black border-gray-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 border text-black border-gray-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 border text-black border-gray-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                required
              />
              <span>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:underline"
                >
                  Terms and Conditions
                </button>
              </span>
            </div>

            <button
              type="submit"
              disabled={!agreeTerms || loading}
              className={`w-full py-3 rounded-lg font-medium transition ${
                !agreeTerms || loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          {/* Terms Modal */}
          {showTermsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white max-w-lg w-full p-6 rounded-lg shadow-lg relative">
                <button
                  className="absolute top-2 right-4 text-gray-500 hover:text-gray-800"
                  onClick={() => setShowTermsModal(false)}
                >
                  ✕
                </button>
                <h2 className="text-xl text-black font-semibold mb-4">Terms and Conditions</h2>
                <div className="h-60 overflow-y-auto text-sm text-gray-700 space-y-3">
                  <p>Welcome to WorkGram. By using this platform, you agree to the following terms...</p>
                  <p>You must be at least 16 years old to use WorkGram.</p>
                  <p>You are responsible for your account and all content you post.</p>
                  <p>Don't use the service for unlawful or abusive behavior.</p>
                  <p>
                    We may modify these terms at any time. Continued use means you accept the changes.
                  </p>
                  <p>
                    Contact us at{' '}
                    <a href="mailto:support@workgram.com" className="text-blue-600 underline">
                      support@workgram.com
                    </a>{' '}
                    for questions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6 mt-8">
            <hr className="flex-grow border-gray-300" />
            <span className="text-sm text-gray-500">or sign up with</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Social Auth */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleSocialSignIn('Google')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <FcGoogle className="text-xl" />
              Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
