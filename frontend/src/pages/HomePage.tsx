import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Search,
  Shield,
  Clock,
  Truck,
  Users,
  Star,
  ChevronRight,
  Heart,
  Stethoscope,
  Pill,
  FileText,
  Sparkles,
  Award,
  Globe,
  Zap,
  TrendingUp,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/ui/Logo';

export default function HomePage() {
  const { t } = useTranslation(['common', 'pharmacy']);
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Licensed & Certified',
      description: 'All our pharmacists are licensed professionals with verified credentials.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Zap,
      title: '24/7 AI-Powered Support',
      description: 'Get instant help with our AI chatbot and 24/7 professional pharmacist support.',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Truck,
      title: 'Smart Delivery',
      description: 'AI-optimized delivery routes ensure same-day delivery with real-time tracking.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Connected to pharmacies worldwide for comprehensive medication access.',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  const services = [
    {
      icon: Pill,
      title: 'Smart Prescription Management',
      description: 'AI-powered medication tracking with automatic refill reminders and drug interaction checking.',
      href: '/medications',
      gradient: 'from-curex-blue-600 to-curex-blue-700',
    },
    {
      icon: FileText,
      title: 'Digital Prescription Hub',
      description: 'Upload, verify, and manage all your prescriptions in one secure digital platform.',
      href: '/prescriptions',
      gradient: 'from-curex-teal-600 to-curex-teal-700',
    },
    {
      icon: Stethoscope,
      title: 'AI Health Consultation',
      description: 'Get instant preliminary health assessments and connect with licensed pharmacists.',
      href: '/consultation',
      gradient: 'from-purple-600 to-purple-700',
    },
    {
      icon: TrendingUp,
      title: 'Health Analytics',
      description: 'Advanced health monitoring with personalized insights and medication adherence tracking.',
      href: '/health-tracking',
      gradient: 'from-green-600 to-green-700',
    },
  ];

  const stats = [
    { number: '150,000+', label: 'Happy Customers', icon: Users },
    { number: '25,000+', label: 'Medications Available', icon: Pill },
    { number: '24/7', label: 'AI-Powered Support', icon: Zap },
    { number: '99.9%', label: 'Service Uptime', icon: Award },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-curex-blue-600 via-curex-blue-700 to-curex-teal-600 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-curex-teal-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse-slow animation-delay-2000"></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Floating Pills Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 animate-bounce animation-delay-500">
            <Pill className="h-8 w-8 text-white/20 transform rotate-45" />
          </div>
          <div className="absolute top-3/4 right-1/4 animate-bounce animation-delay-1000">
            <Heart className="h-6 w-6 text-curex-teal-300/30" />
          </div>
          <div className="absolute top-1/2 right-1/3 animate-bounce animation-delay-1500">
            <Sparkles className="h-7 w-7 text-white/25" />
          </div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            {/* Logo Integration */}
            <div className="mb-8 flex justify-center">
              <Logo size="xl" className="animate-fade-in" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight animate-fade-in">
              The Future of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-curex-teal-300 to-white">
                Smart Pharmacy
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-curex-blue-100 leading-relaxed max-w-4xl mx-auto animate-fade-in">
              Experience next-generation pharmaceutical care with AI-powered health insights,
              instant consultations, and seamless medication management for a digitized healthcare future.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in">
              <Link
                to="/medications"
                className="group relative overflow-hidden bg-gradient-to-r from-curex-teal-500 to-curex-teal-600 hover:from-curex-teal-600 hover:to-curex-teal-700 text-white font-semibold px-10 py-5 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-3"
              >
                <Sparkles className="h-6 w-6" />
                Explore Smart Pharmacy
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="group relative overflow-hidden border-2 border-white/80 text-white hover:bg-white hover:text-curex-blue-700 font-semibold px-10 py-5 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5" />
                    Start Free Journey
                  </div>
                </Link>
              )}
            </div>

            {/* AI-Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto animate-fade-in">
              <form className="relative group">
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Search className="h-6 w-6 text-curex-teal-500" />
                    <Sparkles className="h-4 w-4 text-curex-teal-400 animate-pulse" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ask AI: 'Find pain relief for headaches' or search medications..."
                    className="w-full pl-16 pr-4 py-6 rounded-2xl bg-white/95 backdrop-blur-md text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-curex-teal-300/50 focus:bg-white transition-all duration-300 text-lg shadow-2xl border-2 border-white/50"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-curex-blue-600 to-curex-blue-700 hover:from-curex-blue-700 hover:to-curex-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    AI Search
                  </button>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-curex-teal-400 to-curex-blue-400 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur-sm"></div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-gradient-to-r from-white via-curex-teal-50/30 to-white dark:from-gray-900 dark:via-curex-teal-900/10 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-curex-blue-500 to-curex-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-br from-curex-blue-400 to-curex-teal-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                </div>
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-curex-blue-600 to-curex-teal-600 bg-clip-text text-transparent mb-3">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-semibold text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revolutionary Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-curex-teal-50/20 dark:from-gray-800 dark:via-gray-900 dark:to-curex-teal-900/10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-curex-teal-500 to-curex-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Next-Generation Healthcare
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-blue-600 to-curex-teal-600"> CureX40</span>?
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              We're revolutionizing pharmaceutical care with AI-powered insights, cutting-edge technology,
              and personalized healthcare solutions for the digital age.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group relative">
                <div className="relative mb-8">
                  <div className={`w-20 h-20 mx-auto ${feature.bgColor} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl`}>
                    <feature.icon className={`h-10 w-10 ${feature.iconColor}`} />
                  </div>
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-3xl blur-xl`}></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-curex-blue-600 dark:group-hover:text-curex-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Services Section */}
      <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-curex-blue-500 via-curex-teal-500 to-curex-blue-500"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-curex-blue-100 to-curex-teal-100 dark:from-curex-blue-900/30 dark:to-curex-teal-900/30 text-curex-blue-700 dark:text-curex-blue-300 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Zap className="h-4 w-4" />
              AI-Powered Healthcare Solutions
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Revolutionary
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-blue-600 to-curex-teal-600"> Services</span>
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Experience the future of pharmaceutical care with our comprehensive AI-enhanced services
              designed for modern healthcare needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {services.map((service, index) => (
              <Link
                key={index}
                to={service.href}
                className="group relative overflow-hidden p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 hover:border-curex-teal-200 dark:hover:border-curex-teal-800 transform hover:scale-105"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>

                <div className="relative">
                  <div className="flex items-start space-x-6">
                    <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                      <service.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-curex-teal-600 dark:group-hover:text-curex-teal-400 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-lg">
                        {service.description}
                      </p>
                      <div className="flex items-center text-curex-teal-600 dark:text-curex-teal-400 font-semibold text-lg group-hover:text-curex-teal-700 dark:group-hover:text-curex-teal-300 transition-colors">
                        Explore Feature
                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Revolutionary Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-curex-teal-50 via-white to-curex-blue-50 dark:from-curex-teal-900/10 dark:via-gray-900 dark:to-curex-blue-900/10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-curex-teal-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-curex-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-curex-teal-500 to-curex-blue-500 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Users className="h-4 w-4" />
              Trusted by Healthcare Leaders
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Customer
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-teal-600 to-curex-blue-600"> Success Stories</span>
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Discover how CureX40 is transforming healthcare experiences for patients and professionals worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Chronic Care Patient',
                location: 'New York, NY',
                content: 'CureX40\'s AI-powered medication reminders and health tracking have completely transformed how I manage my diabetes. The smart insights help me stay on top of my health like never before.',
                rating: 5,
                avatar: '👩‍⚕️',
                improvement: '40% better medication adherence',
              },
              {
                name: 'Dr. Michael Chen',
                role: 'Primary Care Physician',
                location: 'San Francisco, CA',
                content: 'As a doctor, I\'m impressed by CureX40\'s accuracy and professionalism. My patients love the seamless prescription management and instant pharmacist consultations.',
                rating: 5,
                avatar: '👨‍⚕️',
                improvement: '60% faster prescription processing',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Working Mother',
                location: 'Austin, TX',
                content: 'Managing my family\'s medications was overwhelming until CureX40. The smart delivery scheduling and health monitoring give me peace of mind as a busy mom.',
                rating: 5,
                avatar: '👩‍💼',
                improvement: '3x faster family healthcare management',
              },
            ].map((testimonial, index) => (
              <div key={index} className="group relative">
                {/* Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-curex-teal-50/50 dark:from-gray-800 dark:to-curex-teal-900/20 rounded-3xl transform rotate-1 group-hover:rotate-0 transition-transform duration-300"></div>
                <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 lg:p-10 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-300 border border-curex-teal-100 dark:border-curex-teal-800/30">

                  {/* Rating Stars */}
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm font-medium text-curex-teal-600 dark:text-curex-teal-400">
                      {testimonial.improvement}
                    </span>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed relative">
                    <div className="text-6xl text-curex-teal-200 dark:text-curex-teal-800 absolute -top-4 -left-2 font-serif">"</div>
                    <p className="relative z-10">{testimonial.content}</p>
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white text-lg">
                        {testimonial.name}
                      </div>
                      <div className="text-curex-teal-600 dark:text-curex-teal-400 font-medium">
                        {testimonial.role}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60 hover:opacity-80 transition-opacity">
              <div className="text-center">
                <div className="text-2xl font-bold text-curex-blue-600 dark:text-curex-blue-400">4.9/5</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">App Store Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-curex-teal-600 dark:text-curex-teal-400">150K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-curex-blue-600 dark:text-curex-blue-400">99.8%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-curex-teal-600 dark:text-curex-teal-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary CTA Section */}
      <section className="py-24 bg-gradient-to-br from-curex-blue-600 via-curex-blue-700 to-curex-teal-600 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-curex-teal-400/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse-slow animation-delay-2000"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 animate-bounce animation-delay-500">
            <Sparkles className="h-6 w-6 text-white/30" />
          </div>
          <div className="absolute top-3/4 right-1/4 animate-bounce animation-delay-1000">
            <Zap className="h-5 w-5 text-curex-teal-300/40" />
          </div>
          <div className="absolute top-1/2 right-1/3 animate-bounce animation-delay-1500">
            <Heart className="h-7 w-7 text-white/25" />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Award className="h-4 w-4" />
              Join the Healthcare Revolution
            </div>

            <h2 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              Ready for the
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-teal-200 to-white block">
                Future of Health?
              </span>
            </h2>

            <p className="text-xl lg:text-2xl text-curex-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join over 150,000 satisfied customers experiencing next-generation pharmaceutical care.
              Start your digital health journey today with AI-powered insights and personalized care.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="group relative overflow-hidden bg-gradient-to-r from-white to-curex-teal-50 text-curex-blue-700 font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-4"
                  >
                    <Sparkles className="h-6 w-6" />
                    Start Free Today
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link
                    to="/medications"
                    className="group relative overflow-hidden border-2 border-white/80 text-white hover:bg-white hover:text-curex-blue-700 font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm bg-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <Search className="h-6 w-6" />
                      Explore Medications
                    </div>
                  </Link>
                </>
              ) : (
                <Link
                  to="/medications"
                  className="group relative overflow-hidden bg-gradient-to-r from-white to-curex-teal-50 text-curex-blue-700 font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-4"
                >
                  <ShoppingBag className="h-6 w-6" />
                  Start Smart Shopping
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 text-curex-blue-100">
                <Phone className="h-5 w-5" />
                <span>24/7 AI Support</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-curex-blue-100">
                <Mail className="h-5 w-5" />
                <span>Instant Consultations</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-curex-blue-100">
                <Truck className="h-5 w-5" />
                <span>Same-Day Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
