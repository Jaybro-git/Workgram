'use client';

import { useRef } from 'react';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

export default function Home() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHow = () => {
    howRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <main className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-4">
          Welcome to <span className="text-blue-600">WorkGram</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8">
          Showcase your CV, skills, and achievements to attract opportunities. Connect with recruiters and showcase your professional journey with ease.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <button
            onClick={scrollToHow}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg shadow hover:bg-blue-700 transition"
          >
            Get Started
          </button>
          <button
            onClick={scrollToAbout}
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-xl text-lg hover:bg-blue-100 transition"
          >
            Learn More
          </button>
        </div>
      </main>

      {/* About WorkGram Section */}
      <section
        ref={aboutRef}
        className="py-20 px-6 bg-white text-center border-t border-gray-200"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
          What is <span className="text-blue-700">WorkGram?</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-16 leading-relaxed">
          <span className="font-semibold text-blue-700">WorkGram</span> is your personal career showcase. Whether you're a student, freelancer, or professional,
          you can create a public profile that highlights your CV, skills, and achievements. Recruiters and
          teams can browse profiles and reach out directly for opportunities.
        </p>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {[
            {
              icon: '📝',
              title: 'Upload CVs',
              description: 'Upload your resume and keep it updated. PDF, DOCX, and online links are supported.',
            },
            {
              icon: '🌟',
              title: 'Showcase Achievements',
              description: 'Add certifications, awards, and project highlights to stand out from the crowd.',
            },
            {
              icon: '🔍',
              title: 'Get Discovered',
              description: 'Let companies and recruiters discover your profile, send job requests, or connect.',
            },
          ].map(({ icon, title, description }) => (
            <div
              key={title}
              className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-default border border-gray-200"
            >
              <div className="text-5xl mb-4">{icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why WorkGram Section */}
      <section className="py-20 px-6 bg-blue-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900">
              Why <span className="text-blue-700">WorkGram?</span>
            </h2>
            <p className="mt-2 text-lg text-gray-700 max-w-2xl">
              <span className="font-semibold text-blue-700">WorkGram</span> empowers recruiters and job seekers alike with a fast, secure, and data-driven platform to connect the right talent with the right opportunities effortlessly.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 text-center">
            {[
              {
                icon: '⚡',
                title: 'Fast & Easy Hiring',
                description: 'Use smart filters and AI assistance to find candidates quickly.',
              },
              {
                icon: '🔐',
                title: 'Secure & Private',
                description: 'We value data privacy for both recruiters and candidates.',
              },
              {
                icon: '📈',
                title: 'Track & Optimize',
                description: 'Built-in analytics show which listings perform best and why.',
              },
            ].map(({ icon, title, description }) => (
              <div
                key={title}
                className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 cursor-default"
              >
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Goal Section */}
      <section className="py-20 px-6 md:px-70 bg-white border-t border-gray-200">
        <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center text-gray-900">
          <span className="text-blue-700">WorkGram</span> Goal
        </h2>
        <p className="max-w-3xl mx-auto text-center text-gray-600 text-lg mb-12">
          At <span className="font-semibold text-blue-700">WorkGram</span>, our mission is to empower individuals and streamline the hiring process. From showcasing talent to connecting with recruiters, every step is designed to help professionals grow and succeed in today’s competitive world.
        </p>
        <div className="relative flex flex-col gap-5">
          {[ 
            {
              step: '01',
              title: 'Empower Professionals',
              description:
                'Provide tools for every individual to showcase their skills and achievements with confidence.',
            },
            {
              step: '02',
              title: 'Connect Talent & Employers',
              description:
                'Build a seamless connection platform where recruiters find top talent easily and quickly.',
            },
            {
              step: '03',
              title: 'Streamline Hiring',
              description:
                'Simplify the hiring process by offering intuitive applicant tracking and communication tools.',
            },
            {
              step: '04',
              title: 'Foster Growth',
              description:
                'Support continuous career development and create opportunities for long-term success.',
            },
          ].map(({ step, title, description }, i) => {
            const isLeft = i % 2 === 0; // even = left, odd = right

            return (
              <div key={step} className="relative w-full flex items-center">
                {/* Box */}
                <div
                  className={`bg-blue-50 border border-blue-300 rounded-3xl shadow-md p-8 max-w-md w-full
                    ${isLeft ? 'mr-auto text-left' : 'ml-auto text-right'}`}
                >
                  <div className="text-blue-600 font-extrabold text-5xl mb-4">{step}</div>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-900">{title}</h3>
                  <p className="text-gray-700">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How WorkGram Works Section */}
      <section
        ref={howRef}
        className="py-20 px-6 bg-blue-50 border-t border-gray-200"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900">
              Get Started with <span className="text-blue-700">WorkGram</span>
            </h2>
            <p className="mt-2 text-lg text-gray-700 max-w-2xl ">
              Whether you're looking to hire top talent or explore new career opportunities,
              <span className="font-semibold text-blue-700"> WorkGram</span> makes it easy to connect.
            </p>

            <div className="mt-8">
              <a
                href="/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow hover:bg-blue-700 transition font-semibold"
              >
                Start Your Journey with WorkGram →
              </a>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3 text-center">
            {[
              {
                icon: '👤',
                title: 'Create Your Profile',
                description:
                  'Sign up and fill out your CV, skills, achievements, and other details to build your public profile.',
              },
              {
                icon: '📤',
                title: 'Upload Your CV',
                description:
                  'Easily upload your resume in multiple formats and keep it updated whenever you want.',
              },
              {
                icon: '🤝',
                title: 'Get Discovered & Connect',
                description:
                  'Employers browse profiles and reach out directly to offer opportunities or schedule interviews.',
              },
            ].map(({ icon, title, description }) => (
              <div
                key={title}
                className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200"
              >
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Contact or Subscribe Section */}
      <section className="py-16 px-6 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay in the Loop</h2>
          <p className="text-lg text-gray-700 mb-6">
            Get the latest updates, product news, and career tips delivered straight to your inbox. Subscribe to our newsletter.
          </p>
          <form className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-500">We'll never spam you. Unsubscribe anytime.</p>
        </div>
      </section>
      
      <Footer />

    </>
  );
}
