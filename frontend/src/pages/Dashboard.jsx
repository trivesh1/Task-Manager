import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/auth.service';
import { getTasks, createTask, updateTask, deleteTask } from '../services/task.service';
import { FiPlus, FiLogOut, FiEdit2, FiTrash2, FiClock, FiCheckCircle } from 'react-icons/fi';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending'
  });

  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showMessage = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', status: 'pending' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask._id, formData);
        showMessage('Task updated successfully');
      } else {
        await createTask(formData);
        showMessage('Task created successfully');
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      showMessage('Task deleted successfully');
      fetchTasks();
    } catch (err) {
       showMessage(err.response?.data?.error || 'Failed to delete task', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'in-progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white tracking-tight">
              TaskFlow <span className="text-indigo-500 text-sm font-medium ml-2 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">{user?.role}</span>
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:block">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
              >
                <FiLogOut /> <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Tasks</h2>
            <p className="text-sm text-slate-400 mt-1">Manage and track your daily activities</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/20 transition-all font-medium text-sm"
          >
            <FiPlus /> New Task
          </button>
        </div>

        {/* Feedback Messages */}
        {error && <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>}

        {/* Task Grid */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-slate-800 border-dashed">
            <FiCheckCircle className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No tasks found</h3>
            <p className="text-slate-500 mt-1">Get started by creating a new task.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.map(task => (
              <div key={task._id} className="glass-panel rounded-xl p-6 flex flex-col group hover:border-indigo-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(task.status)} capitalize`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  
                  {/* Actions: User owns task, or role is admin */}
                  {(user.id === task.userId?._id || user.id === task.userId || user.role === 'admin') && (
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(task)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-md transition-colors" title="Edit">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(task._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Delete">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{task.title}</h3>
                <p className="text-sm text-slate-400 flex-grow line-clamp-3 mb-4">{task.description}</p>
                
                <div className="flex items-center text-xs text-slate-500 mt-auto pt-4 border-t border-slate-800/50">
                  <FiClock className="mr-1.5" /> 
                  {new Date(task.createdAt).toLocaleDateString()}
                  
                  {/* Admin view: show owner email if populated */}
                  {user.role === 'admin' && task.userId?.email && (
                     <span className="ml-auto text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">
                       {task.userId.email}
                     </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="E.g., Complete project report"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Detailed description..."
                  ></textarea>
                </div>

                {editingTask && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
