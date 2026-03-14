# Full-Stack Task Manager (MERN)

A highly scalable and secure task management application featuring stateless JWT authentication, Role-Based Access Control (RBAC), and a responsive React frontend with a modern glassmorphism aesthetic.

## 🚀 Features

### Backend (Node.js & Express)
- **Authentication**: JWT-based auth with `bcrypt` password hashing.
- **RBAC (Role-Based Access Control)**:
  - `user`: Can manage (CRUD) only their own tasks.
  - `admin`: Can view and delete *any* user's tasks.
- **Security**: Request sanitization (`express-validator`), security headers (`helmet`), and rate-limiting.
- **Documentation**: Built-in Swagger UI documentation.
- **Error Handling**: Centralized error middleware handling DB constraint violations and invalid object IDs.

### Frontend (React & Vite)
- **Vite Setup**: Fast and modern React build tool.
- **Styling**: Tailwind CSS with custom glassmorphism components and a premium dark mode UI.
- **Routing**: Protected routes via `react-router-dom` ensuring only authenticated users can access the dashboard.
- **State & API**: Custom Axios instance with interceptors to handle seamless JWT injection on requests.

---

## 🛠️ Tech Stack
- **Database**: MongoDB (Mongoose ORM)
- **Backend API**: Node.js, Express.js
- **Frontend App**: React.js, Vite, Tailwind CSS, Axios, React Router v6

---

## 🏃‍♂️ Running the Project Locally

### Prerequisites
Make sure you have Node.js and a MongoDB instance running (local or Atlas).

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Check the .env file (it is pre-configured for local testing)
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/task-manager
# JWT_SECRET=supersecretjwtkey_12345
# JWT_EXPIRE=30d

# Start the server (runs on port 5000 by default)
npm run dev
# OR simply run
node server.js
```

### 2. Frontend Setup

```bash
# In a new terminal, navigate to local frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## 📚 API Endpoints Overview

For detailed API docs, run the backend and visit:  
**`http://localhost:5000/api-docs`**

| Route | Method | Access | Description |
|---|---|---|---|
| `/api/v1/auth/register` | POST | Public | Register new user (assigns JWT) |
| `/api/v1/auth/login` | POST | Public | Authenticate user & get JWT |
| `/api/v1/tasks` | GET | Private | Get user tasks (Admin sees all tasks) |
| `/api/v1/tasks` | POST | Private | Create a task under logged-in user |
| `/api/v1/tasks/:id` | PUT | Private | Modify a task (Owner only) |
| `/api/v1/tasks/:id` | DELETE | Private | Delete a task (Owner or Admin) |

---

## 📈 Scalability Improvements (Architectural Thoughts)

If this application were to handle millions of tasks and heavy concurrency, the following architectural steps would be taken:

1. **Microservices Architecture**: 
   - Instead of a monolithic Node.js backend, we would decouple logic into separate services (e.g., `User-Auth Service`, `Task-Management Service`).
   - This prevents a spike in traffic on the Auth endpoint from lagging the Task retrieval queues.

2. **Redis Caching**:
   - The query to retrieve all tasks `GET /tasks` logic can be heavy on the Database, especially for Admins.
   - We would implement a caching layer via **Redis**. The cache invalidates only upon a `POST`, `PUT`, or `DELETE` hitting the task schema.
   
3. **Load Balancing**:
   - Utilize a reverse proxy mechanism (Nginx or AWS Application Load Balancer) to distribute incoming API requests among multiple Node.js instances (using PM2 cluster mode) ensuring zero-downtime reloads and highly available node clusters.

4. **Docker Containerization**:
   - Each layer of the stack (Frontend Vite Server, Backend Node App, the MongoDB database, and Redis cache) would be containerized.
   - Employ **Kubernetes (K8s)** to orchestrate auto-scaling of the node containers based on CPU and memory usage heuristics.

5. **Database Sharding/Indexing**:
   - Implement rigorous index structures (like searching indexing on `task.title` and `task.status`). Map MongoDB shards based on geolocation or hash keys to handle high-throughput writes.
