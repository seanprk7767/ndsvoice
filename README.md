# Employee Voice - Staff Complaints, Suggestions & Ideas Management System

A comprehensive web application for managing employee feedback, complaints, suggestions, and ideas with role-based access control.

## 🚀 Features

### For Members
- ✅ Submit complaints, suggestions, and ideas
- ✅ Upload audio files with submissions
- ✅ Track submission status in real-time
- ✅ View personal submission history
- ✅ Receive admin feedback and notes

### For Administrators
- ✅ View and manage all submissions
- ✅ Update submission status and priority
- ✅ Add admin notes and feedback
- ✅ User management (create/edit/delete users)
- ✅ Staff profile management
- ✅ Database view and export functionality
- ✅ Authentication token management
- ✅ Dashboard analytics and statistics

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Alternative**: MySQL support included
- **Authentication**: Token-based authentication
- **File Upload**: Audio file support
- **Deployment**: Netlify

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account OR MySQL database

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-voice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Supabase Configuration (Primary)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # MySQL Configuration (Alternative)
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=employee_voice
   ```

### Database Setup

#### Option 1: Supabase (Recommended)
1. Create a Supabase project
2. Run the migration files in `/supabase/migrations/`
3. Update your `.env` file with Supabase credentials

#### Option 2: MySQL
1. Install MySQL server
2. Update `.env` with MySQL credentials
3. Run the setup script:
   ```bash
   node mysql-setup.js
   ```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔑 Default Credentials

### Admin Access
- **National ID**: `ndsvoice`
- **Password**: `nadiyas1234`

### Member Access
- **National ID**: `123456789012`
- **Name**: `John Doe`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── LoginForm.tsx    # Authentication
│   ├── AdminSetup.tsx   # Initial admin setup
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── AppContext.tsx  # Application state
├── services/           # API services
│   ├── userService.ts  # User management
│   ├── submissionService.ts # Submissions
│   └── tokenService.ts # Authentication tokens
├── types/              # TypeScript types
└── lib/                # Utilities
    └── supabase.ts     # Supabase client
```

## 🗄 Database Schema

### Core Tables
- **users** - User accounts and roles
- **submissions** - Complaints, suggestions, ideas
- **auth_tokens** - Authentication tokens
- **staff_profiles** - Extended user profiles
- **work_progress** - Task and project tracking
- **staff_performance** - Performance metrics

## 🔐 Authentication

The system uses token-based authentication with:
- 24-hour token expiration
- Automatic token refresh
- Role-based access control (admin/member)
- Secure token validation

## 📱 Features in Detail

### Submission Management
- Multiple submission types (complaint, suggestion, idea)
- Priority levels (low, medium, high)
- Status tracking (pending, in-review, resolved, rejected)
- Target manager assignment
- Category classification
- Audio file attachments

### Admin Dashboard
- Real-time submission monitoring
- User management interface
- Staff profile management
- Database export functionality
- Token management
- Analytics and reporting

### Audio File Support
- Multiple format support (MP3, WAV, M4A, OGG, AAC)
- Drag & drop upload
- File size validation
- Audio playback controls
- File management (download, remove)

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔧 Configuration Files

### MySQL Configuration
- `mysql.config.js` - Database connection and schema
- `mysql-setup.js` - Database initialization script

### Vite Configuration
- `vite.config.ts` - Build optimization
- `tailwind.config.js` - Styling configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

## 🔄 Updates

The system includes:
- Real-time data synchronization
- Automatic database migrations
- Progressive web app capabilities
- Mobile-responsive design

---

**Employee Voice** - Empowering workplace communication and feedback management.