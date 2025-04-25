# CardioCompanion API Documentation

## Overview
The CardioCompanion API is a Node.js-based backend service that provides endpoints for the CardioCompanion iOS app. It handles user authentication, symptom logging, medication management, and appointment scheduling.

### Key Features
- **Secure Authentication**: JWT-based user authentication
- **Real-time Updates**: WebSocket support for live data
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Standardized error responses
- **Scalability**: Designed for horizontal scaling

## Technology Stack

### Core Technologies
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **JWT**: Authentication
- **SendGrid**: Email service

### Additional Tools
- **Mongoose**: MongoDB ODM
- **Joi**: Data validation
- **Winston**: Logging
- **Jest**: Testing
- **Docker**: Containerization

## API Structure

### Core Components

#### 1. Routes
- **User Routes** (`/users`)
  - Registration
  - Authentication
  - Profile management
  - Password reset

- **Symptom Routes** (`/api/symptoms`)
  - Symptom logging
  - History retrieval
  - Analysis endpoints
  - Report generation

- **Medication Routes** (`/api/medications`)
  - Medication management
  - Schedule tracking
  - Reminder setup
  - Interaction checking

- **Appointment Routes** (`/api/appointments`)
  - Scheduling
  - Calendar integration
  - Reminder management
  - History tracking

#### 2. Controllers
- **User Controller**
  - Registration logic
  - Authentication flow
  - Profile updates
  - Security measures

- **Symptom Controller**
  - Log creation
  - Data retrieval
  - Analysis processing
  - Report generation

- **Medication Controller**
  - Medication CRUD
  - Schedule management
  - Reminder setup
  - Interaction checking

- **Appointment Controller**
  - Scheduling logic
  - Calendar sync
  - Reminder management
  - History tracking

#### 3. Models
- **User Model**
  - Profile data
  - Authentication info
  - Preferences
  - Security settings

- **Symptom Model**
  - Symptom data
  - Severity levels
  - Timestamps
  - Related data

- **Medication Model**
  - Medication details
  - Schedule info
  - Dosage data
  - Interaction info

- **Appointment Model**
  - Appointment details
  - Schedule data
  - Participant info
  - Status tracking

#### 4. Middleware
- **Authentication**
  - Token validation
  - Role checking
  - Session management
  - Security measures

- **Error Handling**
  - Error catching
  - Response formatting
  - Logging
  - Client feedback

- **Validation**
  - Input validation
  - Data sanitization
  - Type checking
  - Format verification

#### 5. Services
- **Email Service**
  - Notification emails
  - Password reset
  - Appointment reminders
  - System alerts

- **Notification Service**
  - Push notifications
  - SMS alerts
  - In-app notifications
  - Emergency alerts

- **Data Service**
  - Data processing
  - Analytics
  - Reporting
  - Export functionality

## API Endpoints

### User Management
```
POST /users/register
- Register new user
- Validate input
- Create profile
- Send welcome email

POST /users/login
- Authenticate user
- Generate JWT
- Update session
- Return user data

GET /users/profile
- Get user profile
- Validate token
- Return profile data
- Include preferences

PUT /users/profile
- Update profile
- Validate changes
- Save updates
- Return updated data
```

### Symptom Logging
```
POST /api/symptoms
- Create symptom log
- Validate data
- Store in database
- Trigger notifications

GET /api/symptoms
- Get symptom logs
- Apply filters
- Sort results
- Return paginated data

PUT /api/symptoms/:id
- Update symptom log
- Validate changes
- Save updates
- Return updated data

DELETE /api/symptoms/:id
- Delete symptom log
- Validate permission
- Remove data
- Update related records
```

### Medication Management
```
POST /api/medications
- Add medication
- Validate data
- Check interactions
- Set up reminders

GET /api/medications
- Get medications
- Apply filters
- Sort results
- Return paginated data

PUT /api/medications/:id
- Update medication
- Validate changes
- Save updates
- Update reminders

DELETE /api/medications/:id
- Delete medication
- Validate permission
- Remove data
- Cancel reminders
```

### Appointment Scheduling
```
POST /api/appointments
- Schedule appointment
- Check availability
- Send confirmations
- Set up reminders

GET /api/appointments
- Get appointments
- Apply filters
- Sort results
- Return paginated data

PUT /api/appointments/:id
- Update appointment
- Validate changes
- Save updates
- Update notifications

DELETE /api/appointments/:id
- Cancel appointment
- Validate permission
- Remove data
- Send cancellations
```

## Setup and Installation

### Prerequisites
- Node.js 16.x or later
- MongoDB 4.x or later
- npm or yarn
- Git

### Step-by-Step Guide
1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/CardioCompanionAPI.git
   cd CardioCompanionAPI
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

## Environment Variables
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/cardiocompanion

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Email Service
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@cardiocompanion.com

# Other Services
REDIS_URL=redis://localhost:6379
```

## Database Schema

### User Schema
```javascript
{
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### Symptom Log Schema
```javascript
{
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: [{
    type: String,
    required: true
  }],
  severity: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}
```

### Medication Schema
```javascript
{
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date
}
```

### Appointment Schema
```javascript
{
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}
```

## Security

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Token refresh mechanism
- Session management

### Data Protection
- Input validation
- Data sanitization
- XSS prevention
- CSRF protection

### API Security
- Rate limiting
- Request validation
- Error handling
- Logging

## Error Handling

### Error Types
- Validation errors
- Authentication errors
- Database errors
- Service errors

### Response Format
```javascript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Error message',
    details: {}
  }
}
```

## Testing

### Unit Tests
- Controller tests
- Service tests
- Model tests
- Utility tests

### Integration Tests
- API endpoint tests
- Database integration
- Service integration
- Authentication flow

### Test Setup
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "User"

# Run with coverage
npm run test:coverage
```

## Deployment

### Production Setup
1. **Environment Configuration**
   - Set production variables
   - Configure logging
   - Set up monitoring

2. **Database Setup**
   - Configure MongoDB
   - Set up indexes
   - Configure backups

3. **Server Setup**
   - Configure PM2
   - Set up SSL
   - Configure firewall

4. **Monitoring**
   - Set up logging
   - Configure alerts
   - Monitor performance

### Deployment Checklist
- [ ] All tests passing
- [ ] Environment configured
- [ ] Database migrated
- [ ] SSL certificates ready
- [ ] Monitoring configured
- [ ] Backup system ready

## Monitoring

### Logging
- Request logging
- Error logging
- Performance metrics
- Security events

### Alerts
- Error alerts
- Performance alerts
- Security alerts
- System alerts

### Metrics
- Response times
- Error rates
- Resource usage
- User activity

## Support

### Documentation
- API documentation
- Integration guides
- Troubleshooting guides
- Security guidelines

### Contact
- Technical support: api-support@cardiocompanion.com
- Development team: api-dev@cardiocompanion.com
- Emergency support: api-emergency@cardiocompanion.com

### Resources
- API documentation
- Developer portal
- Support portal
- Status page 