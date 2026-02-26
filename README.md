# Smart Attendance Hub

An AI-powered, facial recognition-based attendance management system for educational institutions. Built with modern technologies for real-time attendance tracking, role-based access control, and comprehensive reporting.

**Repository**: https://github.com/Mahin499/smart-attendance-hub

## 🎯 Project Overview

Smart Attendance Hub is a full-stack web and ML application that enables:

- **Facial Recognition**: Real-time face detection and recognition using OpenCV and face_recognition
- **Role-Based Access**: Principal, Faculty, and Student roles with granular permissions
- **Modern Authentication**: Google OAuth 2.0 integration via Supabase
- **Live Attendance Tracking**: Real-time attendance marking with timestamp logging
- **Analytics & Reporting**: Comprehensive attendance analytics and Excel export functionality
- **Responsive UI**: Mobile-friendly dashboard with real-time data visualization

## 🛠 Technology Stack

### Frontend
- **Vite** - Next-generation build tool
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Recharts** - Data visualization

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **PostgreSQL** - Relational database
- **Supabase Auth** - Authentication & authorization

### Machine Learning
- **OpenCV** - Computer vision library
- **face_recognition** - Face detection and recognition
- **NumPy** - Numerical computing
- **Python 3.8+** - ML runtime

## 📋 Prerequisites

- **Node.js** 16+ & npm/yarn (for frontend)
- **Python** 3.8+ (for ML/face recognition)
- **Git** for version control
- **Supabase Account** (free tier available)
- **Google OAuth Credentials** (optional, for Google login)
- **Webcam** (for live attendance marking)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Mahin499/smart-attendance-hub.git
cd smart-attendance-hub
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env.local file with your Supabase credentials
cp .env.example .env.local

# Edit .env.local and add your values:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# Start development server
npm run dev
# Access at http://localhost:8080
```

### 3. ML Module Setup

```bash
cd ml

# Create Python virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Add student face images to ml/dataset/
# Example: ml/dataset/student_001.jpg, ml/dataset/student_002.jpg

# Run face recognition system
python face_recognition_attendance.py
```

## 📁 Project Structure

```
smart-attendance-hub/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── dashboard/      # Role-specific dashboards
│   │   └── DashboardLayout.tsx
│   ├── pages/              # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── LiveAttendance.tsx
│   │   ├── Analytics.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── auth-context.tsx    # Authentication context
│   │   ├── utils.ts            # Utility functions
│   │   └── mock-data.ts        # Test data
│   ├── integrations/
│   │   ├── supabase/          # Supabase client & types
│   │   └── lovable/           # Lovable integration
│   ├── hooks/                 # React hooks
│   ├── App.tsx
│   └── main.tsx
├── ml/
│   ├── face_recognition_attendance.py  # ML script
│   ├── requirements.txt                # Python dependencies
│   ├── dataset/                        # Student face images
│   └── README.md                       # ML documentation
├── supabase/
│   ├── migrations/            # Database migrations
│   └── config.toml           # Supabase configuration
├── public/                    # Static assets
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🔑 Key Features

### Authentication
- Email/Password login
- Google OAuth 2.0 authentication
- Role-based authorization (Principal, Faculty, Student)
- Secure token management with Supabase Auth

### Attendance Management
- Real-time facial recognition-based attendance marking
- QR code based attendance (future)
- Manual attendance entry
- Attendance history and records
- Timestamp logging with accuracy

### Analytics & Reporting
- Real-time attendance dashboard
- Attendance statistics and trends
- Student attendance percentage
- Excel export functionality
- Period-wise analysis

### User Management
- Faculty self-registration with codes
- Principal setup and management
- Student profile management
- Role assignment and permissions

## 📝 Environment Configuration

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# Google OAuth (optional)
# Configure in Supabase Dashboard > Authentication > Providers > Google
```

For ML module, ensure you have Python virtual environment activated.

## 🔐 Security Features

- PKCE OAuth 2.0 flow for secure authentication
- Database-level access control with Supabase RLS
- Encrypted sensitive data storage
- Secure session management with auto-refresh tokens
- Input validation and sanitization

## 🧪 Testing

### Frontend Tests

```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch
```

### Build & Linting

```bash
# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8080
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8080 | xargs kill -9
```

### Module Not Found Errors
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues
- Verify environment variables are correctly set
- Check Supabase project status
- Ensure API keys have proper permissions

### Face Recognition Issues
- Ensure adequate lighting
- Check webcam permissions
- Verify student images in `ml/dataset/`
- See [ml/README.md](ml/README.md) for detailed troubleshooting

## 📚 Documentation

- **[Google OAuth Setup](GOOGLE_AUTH_SETUP.md)** - Detailed Google authentication configuration
- **[ML Module](ml/README.md)** - Face recognition system documentation
- **[Implementation Report](IMPLEMENTATION_REPORT.md)** - Build and test results

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📊 Database Schema

Key tables in Supabase:

- `profiles` - User profiles with name, email
- `user_roles` - Role assignment (principal, faculty, student)
- `students` - Student records
- `attendance` - Attendance entries with timestamp
- `registration_codes` - Faculty registration codes
- `periods` - Time period configuration

See `supabase/migrations/` for detailed schema definitions.

## 🚢 Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Output in dist/ directory
```

### Deployment Platforms Supported
- Vercel (recommended)
- Netlify
- GitHub Pages
- Self-hosted servers

**Google OAuth Production Setup:**
- Add production domain to Google Cloud Console
- Update Supabase redirect URIs
- Enable HTTPS for production

## 📈 Performance Metrics

- Build time: ~13.6s
- Bundle size: ~1.5MB (gzipped: ~432KB)
- FCP (First Contentful Paint): <2s
- LCP (Largest Contentful Paint): <2.5s

## 📞 Support & Issues

- Create an issue on [GitHub Issues](https://github.com/Mahin499/smart-attendance-hub/issues)
- Contact the development team
- Check documentation for common solutions

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Author

**Mahin** - Lead Developer

## 🎉 Acknowledgments

- Shadcn/ui for amazing component library
- Supabase for backend infrastructure
- OpenCV for computer vision capabilities
- React community for excellent documentation

---

**Last Updated**: February 26, 2026  
**Version**: 1.0.0
