import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit, Camera } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useAuth } from '../../../contexts/AuthContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { api } from '../../../lib/api';

export function ProfileView() {
  const { user, refreshUser } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [aboutText, setAboutText] = useState('Passionate freelance designer and developer with over 5 years of experience creating beautiful, functional digital products. Specialized in web design, UI/UX, and full-stack development. I help businesses bring their ideas to life through thoughtful design and clean code.');
  const [skills, setSkills] = useState([
    { name: 'Project Management', level: 90 },
    { name: 'Time Management', level: 85 },
    { name: 'Task Prioritization', level: 88 },
    { name: 'Budgeting', level: 75 },
  ]);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [profileStats, setProfileStats] = useState([
    { label: 'Tasks Completed', value: 156, change: '+12%' },
    { label: 'Hours Tracked', value: '342.5h', change: '+8%' },
    { label: 'Projects', value: 12, change: '+3' },
    { label: 'Productivity', value: '87%', change: '+5%' },
  ]);

  // Update nameValue when user changes
  useEffect(() => {
    if (user?.name) {
      setNameValue(user.name);
    }
  }, [user]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleSaveName = async () => {
    try {
      await api.updateUserPreferences({ name: nameValue });
      await refreshUser();
      setEditingName(false);
      alert('Name updated successfully!');
    } catch (error) {
      console.error('Failed to update name:', error);
      alert('Failed to update name. Please try again.');
    }
  };

  const handleEditAbout = () => {
    setEditingSection('about');
  };

  const handleSaveAbout = () => {
    // In a real app, you'd save this to the backend
    setEditingSection(null);
    alert('About section updated!');
  };

  const handleEditSkills = () => {
    setEditingSection('skills');
  };

  const handleSaveSkills = () => {
    // In a real app, you'd save this to the backend
    setEditingSection(null);
    alert('Skills updated!');
  };

  const handleEditExperience = () => {
    setEditingSection('experience');
  };

  const handleSaveExperience = () => {
    // In a real app, you'd save this to the backend
    setEditingSection(null);
    alert('Work experience updated!');
  };

  const handleProfilePicture = () => {
    alert('Profile picture upload feature coming soon!');
  };

  // Fetch real stats from dashboard
  useEffect(() => {
    const fetchStats = async () => {
      if (currentWorkspace) {
        try {
          const dashboardData = await api.getDashboardData(currentWorkspace.id);
          const tasksCompleted = dashboardData.tasksCompletedThisWeek || 0;
          const hoursTracked = (dashboardData.timeSpentToday / 3600).toFixed(1);
          
          setProfileStats([
            { label: 'Tasks Completed', value: tasksCompleted, change: '+12%' },
            { label: 'Hours Tracked', value: `${hoursTracked}h`, change: '+8%' },
            { label: 'Projects', value: currentWorkspace ? 1 : 0, change: '+3' },
            { label: 'Productivity', value: `${dashboardData.productivityScore || 0}%`, change: '+5%' },
          ]);
        } catch (error) {
          console.error('Failed to fetch dashboard stats:', error);
        }
      }
    };
    fetchStats();
  }, [currentWorkspace]);

  const recentActivity = [
    { action: 'Completed task', item: 'Design landing page mockups', time: '2 hours ago' },
    { action: 'Added expense', item: '$1,250 - Adobe Creative Cloud', time: '5 hours ago' },
    { action: 'Started timer', item: 'Client presentation preparation', time: '1 day ago' },
    { action: 'Updated profile', item: 'Changed timezone settings', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-4xl font-medium">
                  {getUserInitials()}
                </div>
                <button 
                  onClick={handleProfilePicture}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {editingName ? (
                <div className="w-full space-y-2">
                  <Input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    placeholder="Enter your name"
                    className="text-center"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveName} className="flex-1">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingName(false); setNameValue(user?.name || ''); }} className="flex-1">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                  >
                    <Edit className="w-3 h-3 inline mr-1" />
                    Edit name
                  </button>
                </>
              )}
              
              <Badge className="mt-3 bg-green-100 text-green-700 hover:bg-green-100">
                Active Member
              </Badge>

              <Separator className="my-4" />

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{user?.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 capitalize">{user?.role?.toLowerCase().replace('_', ' ') || 'User'}</span>
                </div>
                {user?.preferredCurrency && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Currency: {user.preferredCurrency}</span>
                  </div>
                )}
              </div>

              <div className="w-full mt-6">
                <p className="text-sm text-gray-500 text-center mb-2">
                  To edit profile settings, go to Settings in the sidebar
                </p>
              </div>
            </div>
          </Card>

          {/* Skills Card */}
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Skills & Expertise</h3>
              {editingSection === 'skills' ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSaveSkills}>Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleEditSkills}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700">{skill.name}</span>
                    <span className="text-gray-500">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profileStats.map((stat, index) => (
              <Card key={index} className="p-4">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </Card>
            ))}
          </div>

          {/* About Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">About Me</h3>
                  <p className="text-sm text-gray-500">Professional summary</p>
                </div>
              </div>
              {editingSection === 'about' ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveAbout}>Save</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingSection(null)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={handleEditAbout}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            {editingSection === 'about' ? (
              <Textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                rows={5}
                className="w-full"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {aboutText}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline">UI/UX Design</Badge>
              <Badge variant="outline">Web Development</Badge>
              <Badge variant="outline">React</Badge>
              <Badge variant="outline">TypeScript</Badge>
              <Badge variant="outline">Figma</Badge>
              <Badge variant="outline">Tailwind CSS</Badge>
            </div>
          </Card>

          {/* Work Experience */}
          <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Work Experience</h3>
                    <p className="text-sm text-gray-500">Career history</p>
                  </div>
                </div>
              {editingSection === 'experience' ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveExperience}>Save</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingSection(null)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={handleEditExperience}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="border-l-2 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">Senior Product Designer</h4>
                <p className="text-sm text-gray-600 mt-1">TechCorp Inc. • Full-time</p>
                <p className="text-sm text-gray-500 mt-1">Jan 2022 - Present</p>
                <p className="text-sm text-gray-700 mt-2">
                  Leading design initiatives for enterprise SaaS products, managing a team of 4 designers, 
                  and collaborating with cross-functional teams to deliver exceptional user experiences.
                </p>
              </div>
              <div className="border-l-2 border-gray-300 pl-4">
                <h4 className="font-semibold text-gray-900">Product Designer</h4>
                <p className="text-sm text-gray-600 mt-1">StartupXYZ • Full-time</p>
                <p className="text-sm text-gray-500 mt-1">Mar 2020 - Dec 2021</p>
                <p className="text-sm text-gray-700 mt-2">
                  Designed and implemented user interfaces for mobile and web applications, 
                  conducted user research, and created design systems.
                </p>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}:</span> {activity.item}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

