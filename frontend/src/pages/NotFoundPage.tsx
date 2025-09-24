import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Sparkles, Heart, Zap, Phone, Mail, HelpCircle, MessageCircle } from 'lucide-react';
import Logo from '../components/ui/Logo';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-curex-blue-50 via-white to-curex-teal-50 dark:from-curex-blue-900/20 dark:via-gray-900 dark:to-curex-teal-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-curex-teal-200/20 dark:bg-curex-teal-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-curex-blue-200/20 dark:bg-curex-blue-600/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-curex-teal-100/30 dark:bg-curex-teal-700/10 rounded-full blur-2xl animate-pulse-slow animation-delay-2000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 animate-bounce animation-delay-500">
          <Sparkles className="h-8 w-8 text-curex-teal-300/40 dark:text-curex-teal-500/30" />
        </div>
        <div className="absolute top-3/4 right-1/4 animate-bounce animation-delay-1000">
          <Heart className="h-6 w-6 text-curex-blue-300/40 dark:text-curex-blue-500/30" />
        </div>
        <div className="absolute top-1/2 right-1/3 animate-bounce animation-delay-1500">
          <Zap className="h-7 w-7 text-curex-teal-400/40 dark:text-curex-teal-600/30" />
        </div>
      </div>

      <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl w-full space-y-12 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" className="animate-fade-in" />
          </div>

          {/* 404 Illustration */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-48 h-48 bg-gradient-to-br from-curex-blue-100 to-curex-teal-100 dark:from-curex-blue-900/30 dark:to-curex-teal-900/30 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-105">
                <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-curex-blue-600 to-curex-teal-600">
                  404
                </div>
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 w-48 h-48 bg-gradient-to-br from-curex-blue-400 to-curex-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full blur-xl"></div>

              {/* Floating Question Mark */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-curex-teal-500 to-curex-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-white font-bold text-2xl">?</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-curex-blue-600 to-curex-teal-600">
              Oops!
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Page Not Found
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
              It looks like this page took a detour through cyberspace. Don't worry, our AI can help you find what you're looking for!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="group relative overflow-hidden bg-gradient-to-r from-curex-blue-600 to-curex-blue-700 hover:from-curex-blue-700 hover:to-curex-blue-800 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-3"
              >
                <Home className="w-5 h-5" />
                Back to Home
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/medications"
                className="group relative overflow-hidden bg-gradient-to-r from-curex-teal-600 to-curex-teal-700 hover:from-curex-teal-700 hover:to-curex-teal-800 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-3"
              >
                <Search className="w-5 h-5" />
                Explore Medications
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            <button
              onClick={() => window.history.back()}
              className="group text-curex-blue-600 dark:text-curex-blue-400 hover:text-curex-blue-700 dark:hover:text-curex-blue-300 font-semibold flex items-center justify-center gap-2 mx-auto transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>

          {/* Help Section */}
          <div className="pt-12 border-t border-gradient-to-r from-curex-blue-200 to-curex-teal-200 dark:from-curex-blue-800 dark:to-curex-teal-800">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Need Help?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Our AI-powered support team is here to assist you 24/7
              </p>
            </div>

            {/* Support Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link
                to="/contact"
                className="group p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-curex-blue-100 dark:border-curex-blue-800 hover:border-curex-blue-200 dark:hover:border-curex-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <MessageCircle className="w-8 h-8 text-curex-blue-600 dark:text-curex-blue-400 mb-3 mx-auto" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chat with our AI assistant</p>
              </Link>

              <Link
                to="/help"
                className="group p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-curex-teal-100 dark:border-curex-teal-800 hover:border-curex-teal-200 dark:hover:border-curex-teal-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <HelpCircle className="w-8 h-8 text-curex-teal-600 dark:text-curex-teal-400 mb-3 mx-auto" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Help Center</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Browse our knowledge base</p>
              </Link>

              <Link
                to="/faq"
                className="group p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-curex-blue-100 dark:border-curex-blue-800 hover:border-curex-blue-200 dark:hover:border-curex-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <Phone className="w-8 h-8 text-curex-blue-600 dark:text-curex-blue-400 mb-3 mx-auto" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Call our support team</p>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                to="/contact"
                className="text-curex-blue-600 hover:text-curex-blue-700 dark:text-curex-blue-400 dark:hover:text-curex-blue-300 font-medium transition-colors"
              >
                Contact Support
              </Link>
              <Link
                to="/help"
                className="text-curex-teal-600 hover:text-curex-teal-700 dark:text-curex-teal-400 dark:hover:text-curex-teal-300 font-medium transition-colors"
              >
                Help Center
              </Link>
              <Link
                to="/faq"
                className="text-curex-blue-600 hover:text-curex-blue-700 dark:text-curex-blue-400 dark:hover:text-curex-blue-300 font-medium transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
