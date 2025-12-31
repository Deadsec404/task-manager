import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { CheckCircle2, Clock, DollarSign, BarChart3, Target, Zap } from 'lucide-react';

export function AuthView() {
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: CheckCircle2,
      title: 'Task Management',
      description: 'Organize and track all your tasks with priorities and categories'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Track time spent on tasks and improve productivity'
    },
    {
      icon: DollarSign,
      title: 'Expense Tracking',
      description: 'Manage personal and business expenses with budgets'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Get insights into your productivity and spending patterns'
    },
    {
      icon: Target,
      title: 'Habit Tracking',
      description: 'Build and maintain daily habits with streak tracking'
    },
    {
      icon: Zap,
      title: 'Workspaces',
      description: 'Separate workspaces for personal, business, and projects'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">TaskFlow</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features & Hero */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                One Dashboard to Control Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                  {' '}Time, Tasks, and Money
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Simple, secure, and visually attractive. Manage your daily tasks, track expenses, and gain productivity insights—all from one place.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Free to Start</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">Secure</div>
                <div className="text-sm text-gray-600">Your Data</div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              {isLogin ? (
                <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <p>© 2025 TaskFlow. All rights reserved.</p>
          <p className="mt-2">Built with ❤️ for productivity</p>
        </div>
      </footer>
    </div>
  );
}

