import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/App';
import { Folder, Users, CheckSquare, Upload, ArrowRight, BarChart3 } from 'lucide-react';

export default function LandingPage({ setAuth }) {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      setAuth(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" 
            alt="collaboration" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <nav className="relative z-10 flex justify-between items-center px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-800">project.co.id</h1>
          <Button 
            onClick={() => setShowAuth(true)} 
            className="btn-secondary"
            data-testid="nav-login-btn"
          >
            Sign In
          </Button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
          <div className="text-center space-y-6">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Collaborate Smarter,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Deliver Faster
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
              The all-in-one project management platform for modern teams.
              Plan, track, and deliver projects with ease.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <Button 
                onClick={() => { setIsLogin(false); setShowAuth(true); }}
                className="btn-primary text-lg"
                data-testid="hero-get-started-btn"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                onClick={() => { setIsLogin(true); setShowAuth(true); }}
                className="btn-secondary text-lg"
                data-testid="hero-login-btn"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-600">Powerful features to streamline your workflow</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Folder className="w-8 h-8" />}
              title="Project Management"
              description="Create and organize projects with custom workflows, deadlines, and status tracking."
              color="bg-blue-50 text-blue-600"
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Team Collaboration"
              description="Invite team members, assign tasks, and work together seamlessly in real-time."
              color="bg-purple-50 text-purple-600"
            />
            <FeatureCard 
              icon={<CheckSquare className="w-8 h-8" />}
              title="Task Tracking"
              description="Break down projects into manageable tasks with priorities and progress monitoring."
              color="bg-green-50 text-green-600"
            />
            <FeatureCard 
              icon={<Upload className="w-8 h-8" />}
              title="File Management"
              description="Upload and share project files, documents, and resources with your team."
              color="bg-yellow-50 text-yellow-600"
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8" />}
              title="Progress Tracking"
              description="Monitor project progress with visual indicators and real-time updates."
              color="bg-pink-50 text-pink-600"
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Team Management"
              description="Manage team members, roles, and permissions across all your projects."
              color="bg-indigo-50 text-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Join thousands of teams already using project.co.id to deliver better results.
          </p>
          <Button 
            onClick={() => { setIsLogin(false); setShowAuth(true); }}
            className="btn-primary text-lg"
            data-testid="cta-start-free-btn"
          >
            Start Free Today <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md" data-testid="auth-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  data-testid="auth-name-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="auth-email-input"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="auth-password-input"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full btn-primary" 
              disabled={loading}
              data-testid="auth-submit-btn"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 font-semibold hover:underline"
                data-testid="auth-toggle-btn"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="glass-card p-8 rounded-2xl hover:shadow-xl transition-shadow duration-300">
      <div className={`w-16 h-16 rounded-xl ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}