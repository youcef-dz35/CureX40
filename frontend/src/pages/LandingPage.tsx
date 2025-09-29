import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  ArrowRight,
  CheckCircle,
  Star,
  ShoppingBag,
  MapPin,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowUp,
  Lightbulb,
  Rocket,
  Sparkle,
  Sparkles,
  Users,
  Pill,
  Shield,
  Zap,
  Brain,
  Smartphone,
  Lock,
  Heart,
  TrendingUp,
  Globe,
  Award
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solutions = [
    {
      icon: Brain,
      title: "AI-Powered Health Assistant",
      description: "Your personal AI health companion that learns your patterns, predicts needs, and provides 24/7 intelligent support.",
      benefits: ["Smart medication reminders", "Drug interaction checking", "Personalized health insights"]
    },
    {
      icon: Smartphone,
      title: "Digital-First Experience",
      description: "Complete medication management through your smartphone with instant access to pharmacists and health data.",
      benefits: ["Mobile prescription upload", "Real-time tracking", "Instant consultations"]
    },
    {
      icon: Lock,
      title: "Bank-Level Security",
      description: "HIPAA-compliant platform with end-to-end encryption, ensuring your health data is always protected.",
      benefits: ["256-bit encryption", "HIPAA compliance", "Secure data storage"]
    },
    {
      icon: Heart,
      title: "Personalized Care Plans",
      description: "Tailored health recommendations based on your medical history, current medications, and lifestyle factors.",
      benefits: ["Custom health plans", "Lifestyle integration", "Continuous monitoring"]
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Instant Access",
      description: "Get your medications and health support instantly, 24/7, without waiting in lines or for appointments.",
      stat: "99.9% uptime"
    },
    {
      icon: TrendingUp,
      title: "Better Health Outcomes",
      description: "AI-powered insights help you stay healthier with personalized recommendations and proactive care.",
      stat: "40% improvement in medication adherence"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Access to medications and healthcare providers worldwide through our extensive partner network.",
      stat: "100+ partner pharmacies"
    },
    {
      icon: Award,
      title: "Certified Excellence",
      description: "Licensed pharmacists and FDA-approved medications ensure the highest quality of care and safety.",
      stat: "100% licensed professionals"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Diabetes Patient",
      location: "San Francisco, CA",
      content: "CureX40's AI assistant has completely transformed how I manage my diabetes. The smart reminders and health insights have helped me achieve the best blood sugar control I've ever had.",
      rating: 5,
      improvement: "HbA1c improved by 2.1 points",
      avatar: "👩‍⚕️"
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Cardiologist",
      location: "New York, NY",
      content: "As a physician, I'm impressed by CureX40's accuracy and patient outcomes. My patients love the seamless experience and I appreciate the comprehensive health tracking.",
      rating: 5,
      improvement: "60% reduction in medication errors",
      avatar: "👨‍⚕️"
    },
    {
      name: "Emily Johnson",
      role: "Working Mother",
      location: "Austin, TX",
      content: "Managing my family's health was overwhelming until CureX40. The AI-powered insights and automatic refills give me peace of mind as a busy mom.",
      rating: 5,
      improvement: "3x faster family health management",
      avatar: "👩‍💼"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "Free",
      period: "forever",
      description: "Perfect for individuals getting started with digital health management",
      features: [
        "AI health assistant",
        "Medication reminders",
        "Basic health tracking",
        "Community support",
        "Mobile app access"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Premium",
      price: "$29",
      period: "per month",
      description: "Advanced features for comprehensive health management",
      features: [
        "Everything in Basic",
        "24/7 pharmacist consultations",
        "Advanced health analytics",
        "Priority support",
        "Family management (up to 5 members)",
        "Prescription delivery",
        "Health goal tracking"
      ],
      cta: "Start Premium Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Tailored solutions for healthcare organizations and large families",
      features: [
        "Everything in Premium",
        "Unlimited family members",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced reporting",
        "API access",
        "White-label options"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How does the AI health assistant work?",
      answer: "Our AI assistant uses machine learning to analyze your health data, medication history, and lifestyle patterns to provide personalized recommendations, medication reminders, and health insights. It learns from your interactions to become more accurate over time."
    },
    {
      question: "Is my health data secure?",
      answer: "Absolutely. We use bank-level encryption (256-bit SSL) and are fully HIPAA compliant. Your data is encrypted both in transit and at rest, and we never share your information without your explicit consent."
    },
    {
      question: "Can I use CureX40 with my existing pharmacy?",
      answer: "Yes! CureX40 integrates with over 100 partner pharmacies nationwide. You can transfer your existing prescriptions or continue using your current pharmacy while benefiting from our AI-powered health management features."
    },
    {
      question: "What if I need to speak to a real pharmacist?",
      answer: "Our platform includes 24/7 access to licensed pharmacists through video calls, chat, or phone. Premium users get priority access, while all users can schedule consultations with our certified pharmacy team."
    },
    {
      question: "How accurate are the AI recommendations?",
      answer: "Our AI has been trained on millions of health records and is continuously updated with the latest medical research. It achieves 94% accuracy in medication interaction detection and 89% accuracy in health outcome predictions, with human pharmacist oversight for all recommendations."
    },
    {
      question: "Can I manage my family's health on one account?",
      answer: "Yes! Premium and Enterprise plans allow you to manage multiple family members from one account. Each person gets their own secure profile while you maintain oversight and coordination of everyone's health needs."
    }
  ];

  const stats = [
    { number: "150K+", label: "Happy Users", icon: Users },
    { number: "25K+", label: "Medications", icon: Pill },
    { number: "99.9%", label: "Uptime", icon: Shield },
    { number: "24/7", label: "AI Support", icon: Zap }
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email subscription
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Simple Clean Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className={`${isScrolled ? 'text-curex-blue-600' : 'text-white'}`}>
                  <div className="text-xl font-bold">
                    Cure<span className="text-curex-teal-500">X40</span>
                  </div>
                  <div className={`text-xs font-medium uppercase ${
                    isScrolled ? 'text-curex-teal-600' : 'text-curex-teal-300'
                  }`}>
                    Smart Pharmacy
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation Links - Desktop Only */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className={`text-sm font-medium hover:opacity-80 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}>
                Features
              </a>
              <a href="#pricing" className={`text-sm font-medium hover:opacity-80 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}>
                Pricing
              </a>
              <a href="#testimonials" className={`text-sm font-medium hover:opacity-80 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}>
                Reviews
              </a>
              <a href="#faq" className={`text-sm font-medium hover:opacity-80 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}>
                FAQ
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                      isScrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-curex-blue-600 to-curex-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-curex-blue-700 hover:to-curex-teal-700 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <Link
                  to={
                    user?.role === UserRole.PATIENT 
                      ? '/medications' 
                      : user?.role === UserRole.PHARMACIST 
                      ? '/pharmacy-dashboard'
                      : user?.role === UserRole.GOVERNMENT_OFFICIAL
                      ? '/government-dashboard'
                      : user?.role === UserRole.INSURANCE_PROVIDER
                      ? '/insurance-dashboard'
                      : '/home'
                  }
                  className="bg-gradient-to-r from-curex-blue-600 to-curex-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-curex-blue-700 hover:to-curex-teal-700 transition-all"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Ultra-Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-curex-blue-600 via-curex-blue-700 to-curex-teal-600">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-curex-teal-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <Sparkle className="h-4 w-4" />
              AI-Powered Healthcare Revolution
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight animate-fade-in">
              <span className="text-white">Transform Your</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-teal-300 to-white">
                Health Journey
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl mb-12 text-curex-blue-100 leading-relaxed max-w-4xl mx-auto animate-fade-in">
              Experience the future of healthcare with AI-powered medication management,
              instant pharmacist consultations, and personalized health insights that adapt to your lifestyle.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="group relative overflow-hidden bg-gradient-to-r from-curex-teal-500 to-curex-teal-600 hover:from-curex-teal-600 hover:to-curex-teal-700 text-white font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-3"
                  >
                    <Rocket className="h-6 w-6" />
                    Start Free Today
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="group relative overflow-hidden border-2 border-white/80 text-white hover:bg-white hover:text-curex-blue-700 font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm bg-white/10">
                    <div className="flex items-center gap-3">
                      <Play className="h-6 w-6" />
                      Watch Demo
                    </div>
                  </button>
                </>
              ) : (
                <Link
                  to={
                    user?.role === UserRole.PATIENT 
                      ? '/medications' 
                      : user?.role === UserRole.PHARMACIST 
                      ? '/pharmacy-dashboard'
                      : user?.role === UserRole.GOVERNMENT_OFFICIAL
                      ? '/government-dashboard'
                      : user?.role === UserRole.INSURANCE_PROVIDER
                      ? '/insurance-dashboard'
                      : '/home'
                  }
                  className="group relative overflow-hidden bg-gradient-to-r from-curex-teal-500 to-curex-teal-600 hover:from-curex-teal-600 hover:to-curex-teal-700 text-white font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-3"
                >
                  <ShoppingBag className="h-6 w-6" />
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-all duration-300">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-curex-blue-200 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-curex-blue-50 text-curex-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Lightbulb className="h-4 w-4" />
              Revolutionary Features
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Why Choose
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-blue-600 to-curex-teal-600"> CureX40</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of healthcare with our cutting-edge AI technology and personalized approach.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group text-center p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-curex-blue-200 transform hover:-translate-y-2">
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-curex-blue-500 to-curex-teal-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                    <benefit.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-curex-blue-400 to-curex-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-curex-blue-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {benefit.description}
                </p>
                <div className="text-curex-teal-600 font-bold text-lg">
                  {benefit.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              CureX40
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-blue-600 to-curex-teal-600"> Solves Everything</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform transforms your healthcare experience with intelligent
              medication management, instant access to pharmacists, and personalized care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-gradient-to-br from-curex-blue-50 to-curex-teal-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-curex-blue-100">
                <div className="w-16 h-16 bg-gradient-to-br from-curex-blue-600 to-curex-teal-600 rounded-2xl flex items-center justify-center mb-6">
                  <solution.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {solution.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {solution.description}
                </p>
                <ul className="space-y-2">
                  {solution.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center text-sm text-curex-blue-700">
                      <CheckCircle className="h-4 w-4 mr-2 text-curex-teal-600" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-curex-blue-50 to-curex-teal-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-blue-600 to-curex-teal-600"> CureX40</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the difference with our cutting-edge technology and personalized approach to healthcare.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-curex-blue-500 to-curex-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <benefit.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-curex-blue-400 to-curex-teal-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-curex-blue-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {benefit.description}
                </p>
                <div className="text-curex-teal-600 font-bold text-lg">
                  {benefit.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Real Stories,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-blue-600 to-curex-teal-600"> Real Results</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how CureX40 is transforming lives and improving health outcomes for our users.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-curex-teal-600 font-medium">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {testimonial.location}
                    </div>
                  </div>
                </div>
                <div className="bg-curex-teal-50 text-curex-teal-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {testimonial.improvement}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-blue-600 to-curex-teal-600"> Health Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and upgrade as your health needs grow. All plans include our AI health assistant.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                plan.popular
                  ? 'border-curex-teal-500 transform scale-105'
                  : 'border-gray-200 hover:border-curex-blue-300'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-curex-teal-500 to-curex-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.price}
                    {plan.period !== 'forever' && (
                      <span className="text-lg text-gray-600 font-normal">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-curex-teal-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Basic' ? '/register' : plan.name === 'Premium' ? '/register' : '/contact'}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-curex-teal-600 to-curex-blue-600 text-white hover:from-curex-teal-700 hover:to-curex-blue-700 transform hover:scale-105'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-curex-blue-600 to-curex-teal-600"> Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get answers to common questions about CureX40 and how it can help improve your health.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl overflow-hidden">
                  <button
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-curex-blue-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-8 pb-6">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-curex-blue-600 via-curex-blue-700 to-curex-teal-600 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-curex-teal-400/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Ready to Transform
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-curex-teal-200 to-white">
                Your Health Journey?
              </span>
            </h2>

            <p className="text-xl lg:text-2xl text-curex-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join over 150,000 users who have already revolutionized their healthcare experience.
              Start your free trial today and experience the future of health management.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="group relative overflow-hidden bg-gradient-to-r from-white to-curex-teal-50 text-curex-blue-700 font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-4"
                  >
                    <Sparkles className="h-6 w-6" />
                    Start Free Trial
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link
                    to="/medications"
                    className="group relative overflow-hidden border-2 border-white/80 text-white hover:bg-white hover:text-curex-blue-700 font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm bg-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <Play className="h-6 w-6" />
                      Watch Demo
                    </div>
                  </Link>
                </>
              ) : (
                <Link
                  to="/medications"
                  className="group relative overflow-hidden bg-gradient-to-r from-white to-curex-teal-50 text-curex-blue-700 font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-4"
                >
                  <ShoppingBag className="h-6 w-6" />
                  Continue to Dashboard
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              )}
            </div>

            {/* Newsletter Signup */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for updates"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-curex-blue-200 focus:outline-none focus:ring-2 focus:ring-curex-teal-300 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-curex-teal-600 to-curex-blue-600 text-white font-semibold rounded-xl hover:from-curex-teal-700 hover:to-curex-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-curex-blue-200 text-sm mt-4">
                Get health tips and updates delivered to your inbox. No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-curex-blue-600 to-curex-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
