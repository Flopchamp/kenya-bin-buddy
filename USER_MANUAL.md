# Smart Garbage Tracking System - User Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [User Roles](#user-roles)
4. [Citizen User Guide](#citizen-user-guide)
5. [Driver User Guide](#driver-user-guide)
6. [Administrator User Guide](#administrator-user-guide)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

The Smart Garbage Tracking System is a comprehensive waste management solution designed for Kenyan cities. It enables real-time tracking of waste bins, optimized collection routes, and efficient communication between citizens, drivers, and administrators.

### Key Features
- **Real-Time GPS Tracking**: Monitor collection vehicles and bin locations
- **Smart Analytics**: Data-driven insights for optimized waste management
- **Citizen Reporting**: Easy reporting of waste management issues
- **Multi-Role Access**: Dedicated portals for different user types
- **Collection History**: Complete tracking of all waste collections

---

## Getting Started

### Sign Up and Login Process (All User Types)

**IMPORTANT**: All users (Citizens, Drivers, and Administrators) follow the same signup and login process. The system automatically assigns appropriate access based on user roles.

---

### Step-by-Step: Creating Your Account

#### For ALL Users (Citizen/Driver/Admin):

1. **Navigate to the Login Page**
   - Visit the application URL
   - You'll see the authentication screen

2. **Click the "Sign Up" Tab**
   - Switch from "Sign In" to "Sign Up" tab

3. **Fill in Registration Details**:
   - **Full Name**: Enter your complete name (e.g., "John Doe")
   - **Email**: Enter a valid email address (e.g., "john@example.com")
   - **Phone**: (Optional) Enter your phone number in international format (e.g., "+254 700 000 000")
   - **Password**: Create a password (minimum 6 characters)

4. **Click "Create Account"**
   - Wait for confirmation message: "Account created! You can now sign in."
   - You will be automatically redirected to the dashboard

5. **Default Role Assignment**
   - Your account is automatically created with **Citizen** role
   - To become a Driver or Administrator, you need role assignment from an existing admin

---

### Step-by-Step: Logging In

#### For ALL Users:

1. **Navigate to Login Page**
   - Visit the application URL
   - Click "Sign In" if you're on the homepage

2. **Click the "Sign In" Tab**
   - Ensure you're on the "Sign In" tab (not "Sign Up")

3. **Enter Your Credentials**:
   - **Email**: Your registered email address
   - **Password**: Your account password

4. **Click "Sign In"**
   - Wait for confirmation: "Signed in successfully!"
   - You'll be redirected to the dashboard

5. **Access Your Dashboard**
   - You'll see features based on your assigned role(s)
   - Navigation menu shows options you have access to

---

### Role Assignment Process

#### How to Become a Driver or Administrator:

**Note**: Only existing Administrators can assign roles.

1. **Contact an Administrator**
   - Request role assignment from system admin
   - Provide your registered email address

2. **Administrator Assigns Role**:
   - Admin logs into the system
   - Goes to **Admin Panel → Users Tab**
   - Finds your name in the users list
   - Selects your desired role from the dropdown:
     - **Citizen**: Basic reporting access (default)
     - **Driver**: Collection and tracking access
     - **Admin**: Full system management access

3. **Log Out and Log Back In**
   - After role assignment, log out of your account
   - Log back in to see updated permissions
   - New navigation menu items will appear based on your role

---

### First-Time Administrator Setup

**For the very first admin user** (system initialization):

1. **Create Account Through Sign Up**
   - Follow the standard sign-up process above
   - Account will be created with Citizen role initially

2. **Database Role Assignment** (Technical Admin/Developer):
   - A technical administrator needs to manually assign admin role in the database
   - This is typically done during system setup
   
3. **Subsequent Admin Assignment**:
   - Once first admin is set up, they can assign admin role to others through the Users Management interface

---

### Understanding Role-Based Access

After logging in, users see different features based on their role(s):

#### **Citizen** (Default Role):
- Dashboard with bin map view
- Reports page to create and track issues
- View personal report history

#### **Driver** (Requires Assignment):
- All Citizen features, plus:
- Driver page with collection schedules
- GPS tracking functionality
- Ability to update collection status
- View assigned routes

#### **Administrator** (Requires Assignment):
- All Citizen and Driver features, plus:
- Admin panel with management tabs:
  - Bins Management
  - Trucks Management
  - Schedules Management
  - Reports Management (all users' reports)
  - Users Management (role assignment)
- Analytics dashboard with comprehensive insights

**Note**: Users can have multiple roles simultaneously. For example, an admin can also be a driver.

---

## User Roles

The system has three primary user roles:

### 1. Citizen (Default)
- Report waste management issues
- View personal report history
- Track report status (Open, In Progress, Resolved)
- View nearby waste bins on the map

### 2. Driver
- View assigned collection schedules
- Update collection status
- Enable GPS tracking for real-time location
- View bin locations and fill levels
- Access route optimization

### 3. Administrator
- Manage all bins, trucks, and schedules
- View and respond to citizen reports
- Access comprehensive analytics
- Manage user roles
- Simulate bin fill levels for testing

---

## Citizen User Guide

### Reporting an Issue

1. **Access Reports Page**: Click "Reports" in the navigation menu
2. **Create New Report**: Click the "New Report" button (+ icon)
3. **Fill in Report Details**:
   - **Issue Type**: Select from dropdown
     - Overflowing Bin
     - Missed Collection
     - Damaged Bin
     - Illegal Dumping
     - Other
   - **Related Bin**: (Optional) Select the specific bin if applicable
   - **Description**: Provide detailed information (minimum 10 characters)
4. **Submit**: Click "Submit Report"
5. **Confirmation**: You'll receive a success notification

### Tracking Your Reports

1. **View Reports**: Navigate to "Reports" page
2. **Report Status Indicators**:
   - 🔴 **Open**: Report submitted, awaiting review
   - 🟡 **In Progress**: Being addressed by the team
   - 🟢 **Resolved**: Issue has been resolved
3. **Report Details**: Each report shows:
   - Issue type
   - Associated bin location
   - Description
   - Submission date and time
   - Current status

### Viewing Bins on Map

1. **Access Dashboard**: Click "Dashboard" in the navigation
2. **Interactive Map**: View all waste bins in your area
3. **Bin Information**: Click on map markers to see:
   - Bin code
   - Location name
   - Current fill level
   - Status (Empty, Moderate, Full, Critical)
   - Last collection date
   - Next scheduled collection

---

## Driver User Guide

### How the Driver Dashboard Works

**Important**: Before a driver can see collection schedules, an administrator must:
1. Assign the user a "Driver" role (in Admin Panel → Users Tab)
2. Assign that driver to a truck (in Admin Panel → Trucks Tab)
3. Create collection schedules for that truck (in Admin Panel → Schedules Tab)

### Workflow Overview

```
User signs up → Admin assigns Driver role → Admin creates truck and assigns driver → Admin creates schedules → Driver sees schedules
```

### Viewing Your Schedule

1. **Access Driver Page**: Click "Driver" in the navigation menu
2. **Today's Schedule**: View all assigned collections for your truck
3. **Schedule Information**:
   - Bin location and code
   - Scheduled time
   - Fill level
   - Status (Pending, In Progress, Completed)
4. **No Schedules?**: If you see "No upcoming collections":
   - Verify you have a truck assigned (contact admin)
   - Check if schedules exist for your truck (contact admin)

### Starting a Collection

1. **View Schedule**: Find the bin you're collecting from
2. **Update Status**: Click "Start Collection"
3. **Status Changes**: Pending → In Progress → Completed

### Completing a Collection

1. **Click "Complete"**: On the collection item
2. **Automatic Updates**:
   - Collection history is created
   - Bin fill level resets to 0%
   - Bin status updates to "Empty"
   - Next collection time is calculated

### GPS Tracking

1. **Enable Location Tracking**: Click "Start Tracking" button
2. **Grant Permissions**: Allow browser location access when prompted
3. **Real-Time Updates**: Your truck location updates every 30 seconds
4. **Stop Tracking**: Click "Stop Tracking" when collection is complete
5. **Location Display**: See your current coordinates while tracking

### Viewing Bin Locations

1. **Interactive Map**: View all bins with real-time data
2. **Color-Coded Markers**:
   - 🟢 Green: Empty (0-30% full)
   - 🟡 Yellow: Moderate (31-70% full)
   - 🔴 Red: Full (71-90% full)
   - ⚠️ Alert: Critical (>90% full)

---

## 5. Driver & Truck Assignment System

The system features an intelligent assignment system that manages driver workloads and automatically or manually assigns routes.

### 5.1 Assignment Modes

**Automatic Mode** (Coming Soon)
- System will automatically assign routes when bins reach 80% capacity
- Will consider truck size, driver availability, and workload limits
- Will prevent overworking by checking thresholds before assignment
- Will reassign to available drivers if primary driver is unavailable

**Manual Mode** (Current)
- Admins manually create and assign routes
- System validates driver workload limits
- Displays warnings if driver is near capacity
- Allows admin override with visibility

### 5.2 Driver Workload Limits

The system enforces these safety thresholds:
- **Maximum Hours**: 8 hours per day
- **Maximum Routes**: 2 routes per day
- **Maximum Distance**: 35 km per day
- **Maximum Bins**: 25 bins per day
- **Fatigue Score**: Must stay below 70%

When any limit is reached, the driver is marked as "overworked" and system warns before accepting new routes.

### 5.3 Workload Monitoring (Admin Panel → Workload Tab)

**Workload Panel** displays for each active driver:
- **Driver status**:
  - 🟢 Available: Ready for assignments
  - 🟡 Busy: Currently on route
  - 🔴 Overworked: Reached limits
  - ⚪ Offline: Not active today
- **Current routes** completed today vs. limit (0-2)
- **Hours worked** vs. limit (0-8h)
- **Distance covered** vs. limit (0-35km)
- **Bins collected** vs. limit (0-25)
- **Fatigue score** with color indicators:
  - 🟢 Green (0-49%): Fresh and ready
  - 🟡 Yellow (50-69%): Moderate fatigue
  - 🔴 Red (70-100%): Overworked - needs rest

### 5.4 Creating Manual Route Assignments (Admin Panel → Routes Tab)

#### Switching Assignment Mode

1. Navigate to **Admin Panel → Routes** tab
2. See **Assignment Mode** card at top
3. Toggle switch to change between:
   - ✅ **Automatic**: System assigns routes (coming soon)
   - ❌ **Manual**: Admin assigns routes

#### Creating a Manual Route

1. In **Routes** tab, click **"Create Assignment"** button
2. Fill in route details:
   - **Route Name**: Descriptive name (e.g., "Downtown Collection Route 1")
   - **Select Truck**: Choose from active trucks with assigned drivers
     - Only trucks that have drivers assigned appear in dropdown
   - **Select Bins**: Check boxes for bins to include
     - Shows bin code, location, and current fill level
     - Select multiple bins for the route
   - **Distance (km)**: Optional - estimated route distance
   - **Duration (min)**: Optional - estimated time to complete
   - **Notes**: Optional special instructions for driver
3. **Driver Availability Check**:
   - System automatically checks if assigned driver can accept route
   - ⚠️ Warning appears if driver is near or at limits
   - Admin can still proceed but should consider workload
4. Click **"Assign Route"** to create

### 5.5 Route Assignment Status

Routes progress through these statuses:
- **Pending**: Assigned but not started by driver
- **In Progress**: Driver has started collection
- **Completed**: All bins collected successfully
- **Cancelled**: Route was cancelled by admin

View all assignments in the **Routes** tab with tabs:
- **All**: See all route assignments
- **Automatic**: See system-generated routes (coming soon)
- **Manual**: See admin-created routes

---

## 6. Administrator User Guide

### 6.1 Accessing Admin Panel

1. **Click "Admin"**: In the navigation menu
2. **Eight Management Sections**:
   - **Bins**: Manage waste bin locations and details
   - **Trucks**: Manage collection vehicles and driver assignments
   - **Routes**: Create and monitor route assignments
   - **Workload**: Monitor driver fatigue and availability
   - **Schedules**: Legacy schedule management
   - **Users**: Manage user roles and permissions
   - **Reports**: Review and respond to citizen reports
   - **Simulator**: Test bin fill level changes

---

### 6.2 Managing Bins

#### Adding a New Bin

1. **Navigate to Bins Tab**
2. **Click "Add Bin"**
3. **Enter Bin Details**:
   - Bin Code (e.g., BIN-001)
   - Location Name
   - Latitude (decimal format)
   - Longitude (decimal format)
4. **Submit**: Bin is created with 0% fill level

#### Editing a Bin

1. **Find the Bin**: In the bins list
2. **Click Edit Icon** (pencil)
3. **Update Details**: Modify any field
4. **Save Changes**

#### Deleting a Bin

1. **Find the Bin**: In the bins list
2. **Click Delete Icon** (trash)
3. **Confirm**: Deletion is permanent

#### Simulating Fill Levels (Testing Feature)

1. **Scroll to "Bin Fill Level Simulator"**
2. **Select Bin**: Choose from dropdown
3. **Set Fill Level**: Use slider (0-100%)
4. **Update**: Bin fill level changes immediately
5. **Status Updates Automatically**:
   - 0-30%: Empty
   - 31-70%: Moderate
   - 71-90%: Full
   - 91-100%: Critical

---

### 6.3 Managing Trucks

#### Adding a New Truck

1. **Navigate to Trucks Tab**
2. **Click "Add Truck"**
3. **Enter Truck Details**:
   - **Truck Number**: Unique identifier (e.g., TRK-001)
   - **Capacity**: Weight capacity in kg (e.g., 5000)
   - **Assign Driver**: Select from users with driver role (optional)
     - Driver dropdown shows all users who have been assigned the "Driver" role
     - You can leave this unassigned and add a driver later
   - **Active Status**: Toggle whether truck is currently in service
4. **Submit**: Truck is created and assigned
5. **Important**: Driver must be assigned for them to see schedules

#### Editing a Truck

1. **Find the Truck**: In the trucks list (shows assigned driver name)
2. **Click Edit Icon** (pencil)
3. **Update Details**: 
   - Change truck number, capacity, or status
   - Reassign to different driver
   - Remove driver assignment (select "No Driver")
4. **Save Changes**
5. **Note**: Changing the assigned driver will affect which schedules that driver sees

#### Deleting a Truck

1. **Find the Truck**: In the trucks list
2. **Click Delete Icon**
3. **Confirm**: Ensure no active schedules exist

---

### 6.4 Managing Collection Schedules (Legacy)

#### Creating a Schedule

**Prerequisites**: Ensure you have:
- Created at least one bin
- Created at least one truck
- Assigned a driver to that truck (if you want drivers to see it)

1. **Navigate to Schedules Tab**
2. **Click "Add Schedule"**
3. **Enter Schedule Details**:
   - **Select Truck**: Choose from active trucks (only active trucks appear)
   - **Select Bin**: Choose the bin to be collected
   - **Scheduled Date**: Pick collection date
   - **Scheduled Time**: Set collection time
4. **Submit**: Schedule is created with "Pending" status
5. **Result**: Driver assigned to the selected truck will now see this schedule on their Driver dashboard

#### Monitoring Schedules

1. **View All Schedules**: Listed with:
   - Bin location
   - Truck number
   - Date and time
   - Status
2. **Status Types**:
   - Pending: Not yet started
   - In Progress: Driver has started collection
   - Completed: Collection finished
   - Cancelled: Schedule was cancelled

#### Editing a Schedule

1. **Find the Schedule**: In the list
2. **Click Edit Icon**
3. **Modify Details**: Change date, time, truck, or status
4. **Save Changes**

---

### Managing Citizen Reports

#### Viewing Reports

1. **Navigate to Reports Tab**
2. **View All Reports**: Listed with:
   - Reporter name
   - Issue type
   - Related bin
   - Status
   - Submission date

#### Responding to Reports

1. **Find the Report**: In the reports list
2. **Click Edit Icon**
3. **Update Status**:
   - Open → In Progress
   - In Progress → Resolved
4. **Save Changes**: Citizen sees updated status in real-time

#### Filtering Reports

- View by status (Open, In Progress, Resolved)
- Search by reporter or bin location

---

### Managing Users

#### Viewing Users

1. **Navigate to Users Tab**
2. **View All Users**: Listed with:
   - Full name
   - Email
   - Phone number
   - Current roles

#### Assigning Roles

1. **Find the User**: In the users list
2. **View Current Roles**: Displayed as badges
3. **Assign New Role**:
   - Admin: Full system access
   - Driver: Collection and tracking access
   - Citizen: Basic reporting access
4. **Multiple Roles**: Users can have multiple roles

#### Important Notes on User Management

- **Default Role**: All new users get "Citizen" role automatically
- **Admin Role**: Use carefully - grants full system access
- **Driver Role**: Required to assign trucks and schedules
- **Cannot Delete Users**: Users can delete their own accounts

---

### 7. Analytics Dashboard

#### Accessing Analytics

1. **Click "Analytics"**: In the navigation menu
2. **View Key Metrics**:
   - Total Bins
   - Total Trucks
   - Active Collection Schedules
   - Pending Citizen Reports

#### Understanding Charts

1. **Bin Status Distribution** (Pie Chart):
   - Shows percentage of bins in each status
   - Color-coded for easy identification
   - Click legend to toggle categories

2. **Collection Efficiency** (Bar Chart):
   - Weekly collection completion rates
   - Compare scheduled vs. completed collections
   - Identify optimization opportunities

#### Interpreting Data

- **Low Efficiency**: May indicate scheduling issues
- **High Critical Bins**: Need more frequent collections
- **Pending Reports**: Require urgent attention

---

## 9. Troubleshooting

### Common Issues and Solutions

#### Cannot Log In

**Problem**: Login fails with correct credentials
**Solution**:
1. Check email is correct and verified
2. Reset password using "Forgot Password" link
3. Clear browser cache and try again
4. Ensure caps lock is off

#### GPS Tracking Not Working

**Problem**: Location not updating for driver
**Solution**:
1. Check browser location permissions
2. Enable GPS on device
3. Refresh the page
4. Try different browser

#### Reports Not Submitting

**Problem**: Report submission fails
**Solution**:
1. Check all required fields are filled
2. Description must be at least 10 characters
3. Check internet connection
4. Try refreshing the page

#### Map Not Loading

**Problem**: Bin map doesn't display
**Solution**:
1. Check internet connection
2. Disable ad blockers
3. Clear browser cache
4. Try different browser

#### Cannot See Admin Panel

**Problem**: Admin menu not visible
**Solution**:
1. Verify you have admin role assigned
2. Log out and log back in
3. Contact system administrator for role assignment

### Getting Help

For additional assistance:
1. **System Issues**: Contact your system administrator
2. **Technical Support**: Refer to technical documentation
3. **Training**: Schedule training session with admin team

---

## 10. Best Practices

### For Citizens
- Report issues promptly
- Provide detailed descriptions
- Include photos if possible (via description)
- Check report status regularly

### For Drivers
- Enable GPS tracking during shifts
- Update collection status in real-time
- Report any bin issues immediately
- Complete all assigned collections

### For Administrators
- Review citizen reports daily
- Monitor bin fill levels regularly
- Optimize collection schedules weekly
- Assign appropriate user roles
- Keep truck and bin information updated
- Use analytics to improve efficiency

---

## System Requirements

### Minimum Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- JavaScript enabled
- Location services enabled (for drivers)

### Recommended
- High-speed internet connection
- Desktop or laptop for administrative tasks
- Mobile device with GPS for driver tracking
- Up-to-date browser version

---

## Security and Privacy

### Data Protection
- All passwords are encrypted
- User data is protected by role-based access
- GPS tracking only active when enabled by driver
- Reports are only visible to authorized users

### Account Security
- Use strong passwords (8+ characters, mix of letters, numbers, symbols)
- Never share login credentials
- Log out when finished, especially on shared devices
- Report suspicious activity immediately

---

## Updates and Maintenance

The system receives regular updates for:
- Security improvements
- New features
- Bug fixes
- Performance optimization

Administrators will be notified of scheduled maintenance windows.

---

**Version**: 1.0  
**Last Updated**: October 2025  
**For Support**: Contact your system administrator