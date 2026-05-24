# 🏢 Leave Management System — Complete Setup Guide

## What's in this project?

```
LeaveManagement/
├── backend/LeaveManagement.API/     ← .NET Core 8 Web API
├── frontend/                        ← Angular 17 app
└── .github/workflows/deploy.yml     ← CI/CD pipeline
```

---

## ✅ STEP 1 — Install Required Software

Install these before anything else. Do them one by one.

### 1A. Install .NET 8 SDK
- Go to: https://dotnet.microsoft.com/download/dotnet/8.0
- Download **.NET 8.0 SDK** (the SDK, not just Runtime)
- Install it, then open a new terminal and run:
  ```
  dotnet --version
  ```
  You should see `8.0.x`

### 1B. Install Node.js (version 18 or 20)
- Go to: https://nodejs.org
- Download and install **LTS version**
- After install, open terminal and run:
  ```
  node --version
  npm --version
  ```

### 1C. Install Angular CLI
- Open terminal and run:
  ```
  npm install -g @angular/cli
  ```
- Verify:
  ```
  ng version
  ```

### 1D. Install SQL Server Express (Free)
- Go to: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
- Download **Express** edition (free)
- Install with default settings

### 1E. Install SQL Server Management Studio / SSMS (Optional - to view DB)
- Go to: https://aka.ms/ssmsfullsetup
- Download and install

### 1F. Install VS Code
- Go to: https://code.visualstudio.com
- Install these VS Code extensions:
  - **C# Dev Kit** (by Microsoft)
  - **Angular Language Service** (by Angular)

---

## ✅ STEP 2 — Open Project in VS Code

1. Extract the zip file you downloaded
2. Open VS Code
3. Click **File → Open Folder**
4. Select the `LeaveManagement` folder (the root — not backend or frontend)
5. Click **Open**

---

## ✅ STEP 3 — Set Up the Backend

### 3A. Open a terminal in VS Code
- Press **Ctrl + `** (backtick) to open terminal in VS Code

### 3B. Navigate to backend folder
```bash
cd backend/LeaveManagement.API
```

### 3C. Update the connection string
Open the file: `backend/LeaveManagement.API/appsettings.json`

Find this line:
```json
"DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=LeaveManagementDb;Trusted_Connection=True;"
```

### 3D. Install EF Core tools
```bash
dotnet tool install --global dotnet-ef
```

### 3E. Restore packages
```bash
dotnet restore
```

### 3F. Create the database
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```
This creates the database and adds all tables + seed data automatically.

### 3G. Run the backend
```bash
dotnet run
```
You should see output like:
```
Now listening on: http://localhost:5000
```

### 3H. Test it works
Open your browser and go to:
```
http://localhost:5000/swagger
```
You should see the Swagger API documentation page. ✅

---

## ✅ STEP 4 — Set Up the Frontend

Open a **second terminal** in VS Code (click the + icon in the terminal panel).

### 4A. Navigate to frontend folder
```bash
cd frontend
```

### 4B. Install packages
```bash
npm install
```
This will take 2-3 minutes. Wait for it to finish.

### 4C. Run the Angular app
```bash
ng serve
```
You should see:
```
** Angular Live Development Server is listening on localhost:4200 **
```

### 4D. Open the app
Open your browser and go to:
```
http://localhost:4200
```

---

## ✅ STEP 5 — Login & Test

Use these demo credentials (seeded automatically):

| Role      | Email                   | Password       |
|-----------|-------------------------|----------------|
| HR Admin  | admin@company.com       | Password@123   |
| Manager   | ravi@company.com        | Password@123   |
| Employee  | priya@company.com       | Password@123   |
| Employee  | arjun@company.com       | Password@123   |

### Test the full workflow:
1. Login as **Employee (priya)** → Apply for leave
2. Login as **Manager (ravi)** → Approve or reject it
3. Login as **HR Admin** → See the full dashboard

---

## ✅ STEP 6 — Push to GitHub

### 6A. Create a GitHub account
Go to https://github.com and sign up (free)

### 6B. Install Git
Go to https://git-scm.com/downloads and install

### 6C. Initialize and push
Open terminal in VS Code at the root folder:
```bash
git init
git add .
git commit -m "feat: initial commit - Leave Management System"
```

### 6D. Create repo on GitHub
- Go to github.com → click **+** → New repository
- Name: `leave-management-system`
- Keep it **Public**
- Click **Create repository**

### 6E. Push your code
```bash
git remote add origin https://github.com/YOUR_USERNAME/leave-management-system.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## ✅ STEP 7 — Deploy to Azure (Free Tier)

### 7A. Create free Azure account
- Go to: https://azure.microsoft.com/free
- Sign up — get 12 months free + $200 credit

### 7B. Create App Service (for .NET API)
1. Go to portal.azure.com
2. Click **Create a resource → Web App**
3. Fill in:
   - **Name:** leave-mgmt-api (must be unique)
   - **Runtime stack:** .NET 8
   - **Region:** South India (closest to you)
   - **Plan:** Free F1
4. Click **Create**

### 7C. Create Azure SQL Database
1. Click **Create a resource → SQL Database**
2. Fill in:
   - **Database name:** LeaveManagementDb
   - **Server:** Create new → give a name and password
   - **Compute + storage:** Choose **Basic** (cheapest)
3. After creating, go to the database → **Connection strings**
4. Copy the **ADO.NET** connection string
5. In Azure App Service → **Configuration → Application settings** → Add:
   - Name: `ConnectionStrings__DefaultConnection`
   - Value: (paste connection string, replace password)

### 7D. Get publish profile
1. Go to your App Service in Azure
2. Click **Download publish profile**
3. Open it and copy the entire content

### 7E. Add GitHub Secrets
Go to your GitHub repo → **Settings → Secrets → Actions → New secret**

Add these secrets:
| Secret Name | Value |
|---|---|
| `AZURE_WEBAPP_NAME` | your app service name (e.g. leave-mgmt-api) |
| `AZURE_PUBLISH_PROFILE` | paste content of publish profile file |
| `NETLIFY_SITE_ID` | (add after Netlify setup below) |
| `NETLIFY_AUTH_TOKEN` | (add after Netlify setup below) |

---

## ✅ STEP 8 — Deploy Frontend to Netlify (Free)

### 8A. Create Netlify account
- Go to: https://netlify.com → Sign up free

### 8B. Get your tokens
1. In Netlify → click your profile → **User settings → Applications → Personal access tokens**
2. Click **New access token** → Copy it → This is your `NETLIFY_AUTH_TOKEN`

### 8C. Create Netlify site
1. In Netlify → click **Add new site → Deploy manually**
2. Drag any empty folder to deploy
3. After creating, go to **Site settings** → Copy the **Site ID**
4. This is your `NETLIFY_SITE_ID`

### 8D. Update Angular environment
Open `frontend/src/environments/environment.prod.ts` and update the API URL:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://YOUR-AZURE-APP-NAME.azurewebsites.net/api'
};
```

### 8E. Push to trigger deployment
```bash
git add .
git commit -m "feat: add production environment URL"
git push
```

This triggers GitHub Actions which builds and deploys both backend and frontend automatically. Watch it at: `github.com/YOUR_USERNAME/leave-management-system/actions`

---

## 🔧 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `dotnet: command not found` | Restart terminal after installing .NET SDK |
| `Cannot connect to database` | Check connection string in appsettings.json |
| `ng: command not found` | Run `npm install -g @angular/cli` again |
| `CORS error` in browser | Make sure backend is running on port 5000 |
| `401 Unauthorized` on API | You forgot to send the JWT token — login first |
| EF migration error | Delete the `Migrations` folder and run `dotnet ef migrations add InitialCreate` again |

---

## 📂 File Structure Explained

```
backend/LeaveManagement.API/
├── Controllers/        ← API endpoints (Auth, Leaves, Users, LeaveTypes)
├── Models/             ← Database tables as C# classes
├── DTOs/               ← Request/Response shapes (what API sends/receives)
├── Data/               ← DbContext + seed data
├── Services/           ← Business logic (LeaveService, JwtService)
├── Middleware/         ← Global error handler
├── Program.cs          ← App startup + DI setup
└── appsettings.json    ← Config (DB connection, JWT settings)

frontend/src/app/
├── core/
│   ├── services/       ← auth.service.ts, leave.service.ts
│   ├── guards/         ← auth.guard.ts (protects routes)
│   └── interceptors/   ← jwt.interceptor.ts (adds token to every request)
├── features/
│   ├── auth/login/     ← Login page
│   ├── employee/       ← Dashboard, Apply Leave, My Leaves
│   ├── manager/        ← Manager Dashboard, Approvals
│   └── admin/          ← HR Admin Dashboard
├── shared/
│   ├── models/         ← TypeScript interfaces
│   └── components/     ← Navbar
├── app.routes.ts       ← All page routes
├── app.config.ts       ← App setup (providers, interceptors)
└── app.component.ts    ← Root component
```

---

## 🎯 Interview Talking Points

**"Walk me through the architecture"**
> "The backend is ASP.NET Core 8 with a clean layered structure — Controllers handle HTTP, Services contain business logic, and EF Core handles DB. Frontend is Angular 17 with standalone components, JWT interceptor for auth, and route guards for role-based access."

**"How does the approval workflow work?"**
> "When an employee applies, it validates working days excluding weekends and holidays, checks balance, creates the request as Pending, and deducts from pending balance. When a manager approves, it moves used days from pending to used. Every action is recorded in an audit log."

**"How did you deploy it?"**
> "Backend is on Azure App Service with Azure SQL, frontend on Netlify. CI/CD is via GitHub Actions — every push to main triggers the pipeline which builds both, runs checks, and deploys automatically."
