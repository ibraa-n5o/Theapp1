import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Upload, Download, CheckSquare, Calendar, User } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '', description: '', priority: 'medium', due_date: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes, filesRes] = await Promise.all([
        axios.get(`${API}/projects/${id}`),
        axios.get(`${API}/tasks/${id}`),
        axios.get(`${API}/files/${id}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setFiles(filesRes.data);
    } catch (error) {
      toast.error('Failed to fetch project data');
      navigate('/dashboard');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/tasks`, { ...taskFormData, project_id: id });
      toast.success('Task created successfully!');
      setShowTaskDialog(false);
      setTaskFormData({ title: '', description: '', priority: 'medium', due_date: '' });
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, { status: newStatus });
      toast.success('Task updated!');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    
    try {
      await axios.delete(`${API}/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', id);

    try {
      await axios.post(`${API}/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('File uploaded successfully!');
      fetchProjectData();
      e.target.value = '';
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const handleDownloadFile = async (fileId, filename) => {
    try {
      const response = await axios.get(`${API}/files/download/${fileId}`);
      const link = document.createElement('a');
      link.href = `data:application/octet-stream;base64,${response.data.file_data}`;
      link.download = filename;
      link.click();
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    
    try {
      await axios.delete(`${API}/files/${fileId}`);
      toast.success('File deleted');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'task-status-completed';
      case 'in-progress': return 'task-status-in-progress';
      default: return 'task-status-todo';
    }
  };

  if (!project) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="ghost" 
            className="mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="project-title">{project.title}</h1>
              <p className="text-gray-600" data-testid="project-description">{project.description}</p>
            </div>
            <span className={`status-badge ${project.status === 'active' ? 'status-active' : project.status === 'completed' ? 'status-completed' : 'status-archived'}`}>
              {project.status}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm">
            <TabsTrigger value="tasks" data-testid="tasks-tab">Tasks</TabsTrigger>
            <TabsTrigger value="files" data-testid="files-tab">Files</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
              <Button 
                onClick={() => setShowTaskDialog(true)} 
                className="btn-primary"
                data-testid="create-task-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>

            {tasks.length === 0 ? (
              <div className="glass-card p-12 rounded-2xl text-center" data-testid="no-tasks-message">
                <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tasks yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="tasks-list">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="glass-card p-4 rounded-xl flex items-center justify-between hover:shadow-lg transition-shadow"
                    data-testid={`task-item-${task.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <span className={`status-badge ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`status-badge ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={task.status}
                        onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger className="w-36" data-testid={`task-status-select-${task.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        data-testid={`delete-task-btn-${task.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Files</h2>
              <label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="file-upload-input"
                />
                <Button className="btn-primary" as="span" data-testid="upload-file-btn">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </label>
            </div>

            {files.length === 0 ? (
              <div className="glass-card p-12 rounded-2xl text-center" data-testid="no-files-message">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No files uploaded yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="files-list">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="glass-card p-4 rounded-xl hover:shadow-lg transition-shadow"
                    data-testid={`file-item-${file.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 break-all">{file.filename}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(file.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 btn-secondary"
                        onClick={() => handleDownloadFile(file.id, file.filename)}
                        data-testid={`download-file-btn-${file.id}`}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        data-testid={`delete-file-btn-${file.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="sm:max-w-lg" data-testid="create-task-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                data-testid="task-title-input"
                placeholder="e.g., Design homepage mockup"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                data-testid="task-description-input"
                placeholder="Task details..."
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={taskFormData.priority}
                onValueChange={(value) => setTaskFormData({ ...taskFormData, priority: value })}
              >
                <SelectTrigger data-testid="task-priority-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <Input
                id="task-due-date"
                data-testid="task-due-date-input"
                type="date"
                value={taskFormData.due_date}
                onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1 btn-primary" 
                disabled={loading}
                data-testid="submit-task-btn"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
              <Button 
                type="button" 
                onClick={() => setShowTaskDialog(false)} 
                className="btn-secondary"
                data-testid="cancel-task-btn"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}