import React from "react";
import { Link } from "react-router-dom";
import {
  Code,
  BookOpen,
  Trophy,
  ArrowRight,
  Star,
  Users,
  Zap,
  Bot,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Code,
      title: "Smart Explanation",
      description:
        "Get AI-powered explanations for any code snippet in simple, beginner-friendly language.",
      link: "/explain",
      color: "from-blue-500 to-purple-600",
    },
    {
      icon: BookOpen,
      title: "Interactive Learning",
      description:
        "Practice with QCM exercises ranging from easy to hard difficulty levels.",
      link: "/exercises",
      color: "from-green-500 to-blue-600",
    },
    {
      icon: Zap,
      title: "AI Challenge",
      description:
        "Compete against AI in a 30-question challenge across 3 rounds of increasing difficulty!",
      link: "/challenge",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: Trophy,
      title: "Leaderboard & Ranking",
      description:
        "Track your progress and compete with other learners in our ranking system.",
      link: "/leaderboard",
      color: "from-yellow-500 to-orange-600",
    },
  ];

  const stats = [
    { icon: Users, label: "Active Learners", value: "10,000+" },
    { icon: BookOpen, label: "Exercises Completed", value: "50,000+" },
    { icon: Star, label: "Code Explanations", value: "100,000+" },
    { icon: Zap, label: "Success Rate", value: "95%" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Learn Programming
            <span className="block text-yellow-300">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Master coding with AI-powered explanations, interactive exercises,
            and gamified learning. Perfect for beginners who want to understand
            code without getting lost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/explain"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Start Learning</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/exercises"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors duration-200"
            >
              Try Exercises
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Learn Programming
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines AI technology with gamification to make
              learning programming engaging, effective, and fun for beginners.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-primary-600 font-semibold group-hover:text-primary-700 text-sm">
                    <span>Learn More</span>
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Coding Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of learners who have already improved their
            programming skills with our platform.
          </p>
          <Link
            to="/explain"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <span>Get Started Now</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
