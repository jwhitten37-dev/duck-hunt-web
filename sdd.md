---
organization: Artificial Intelligence Integration Center (AI2C)
software_name: Duck Hunt Web
software_version: v0.1.0
logo: docs/sdd/logo.png
classification: CUI
prepared_for:
  Organization: AI2C
  Name: CW3 Justin Whitten
  E-mail: justin.w.whitten.mil@army.mil
  Address: 6425 Living Place, Pittsburgh 15206
---

<!--
  NOTE: THIS MARKDOWN TEMPLATE IS NOT GITLAB FLAVORED, AND THUS WILL NOT RENDER CORRECTLY ON GITLAB IT IS DESIGNED TO BE RENDERED BY PANDOC INTO A PDF OR OTHER FORMAT. PLEASE REFER TO THE PANDOC DOCUMENTATION FOR MORE INFORMATION ON HOW TO DO THIS (https://pandoc.org/MANUAL.html#pandocs-markdown).

  THIS TEMPLATE IS DESIGNED TO BE USED WITH THE PANDOC CONTAINER IMAGE (https://code.code.cdso.army.mil/cdso/containers/tool/pandoc)

  THERE ARE PORTIONS OF THIS TEMPLATE THAT SERVE AS A FORM TO BE FILLED IN, AND OTHERS THAT ARE MEANT TO BE EDITED. PLEASE REFER TO THE COMMENTS IN THE TEMPLATE FOR MORE INFORMATION.

  THERE ARE ALSO PORTIONS THAT ARE FILLED OUT IN THEIR ENTIRETY AND ARE TARGETED FOR THE CDSO APPROVAL SYSTEM. DO NOT EDIT THESE UNLESS YOU HAVE A COMPELLING REASON TO OR ARE DEVIATING FROM THE CDSO PROCESS.
-->

<!--
 PORTION MARKINGS: You must use portion markings for all paragraphs and headers in this document. You must have specified the top-level classification of the SDD in the front-matter of this document (under the 'classification' key).

-->

## Classification Instruction

(U) Add the portion marking before each paragraph. This paragraph is marked as Unclassified, as denoted by the '(U)' at the beginning of this paragraph.

## Responsible Organization

(U) Who is the cognizant Authorizing Official (AO) for the organization?

(U) Mr. Joseph Welch

(U) Is your system funded by Title 10 or Title 50?

| Title 10 | Title 50 |
| -------- | -------- |
| x        |          |

### Points of Contact

| Name                     | Role                                | Phone Number   | Email                           |
| ------------------------ | ----------------------------------- | -------------- | ------------------------------- |
| LTC Scott Anderson       | Mission Owner                       | (978) 654-3210 | scott.t.anderson.mil@army.mil   |
| CPT Angus Ferrell        | Information System Owner            | (978) 654-3210 | angus.m.ferrell.mil@army.mil    |
| CW3 Victor Fernandez III | Information System Security Manager | (978) 654-3210 | victor.fernandez19.mil@army.mil |
| CIV Geoffrey Oldland     | Information System Security Officer | (978) 654-3210 | geoffrey.j.oldland.ctr@army.mil |

```{=latex}
\newpage
```

## cDSO Container Technology Pipeline Process

(U) The cDSO is a low cost, secure, flexible, and enterprise-wide containerized application development pipeline. Using the cDSO improves the quality and timeliness of the Risk Management Framework (RMF) process. It distributes the responsibility for security while enabling developers at all levels and organizations to develop and secure containerized applications with unmatched agility.

### Process

a. (U) System Owner completes CSDD and BoE with Cybersecurity Office assistance

b. (U) Cybersecurity Office POC reviews BoE and sends it to ISSM.

c. (U) ISSM reviews BoE and sends it to SCA-V or returns for rework.

d. (U) SCA-V reviews BoE and signs approval or returns for rework.

e. (U) ISSM signs approval. ISSM enters approval in the GitLab Merge Request.

f. (U) SCA-V enters approval in the GitLab Merge Request and Merges the CSDD.

g. (U) Container Software/Pipeline can now be installed, and BoE is incorporated into System BoE

```{=latex}
\newpage
```

## Software Overview

### Purpose

(U) The Cloud Observability Spend Toolkit (COST) provides authorized Department of Defense (DoD) personnel with a centralized, user-friendly interface to visualize, analyze, and manage Microsoft Azure cloud expenditures. The application directly interfaces with the Azure Cost Management API to present near real-time spending data, enabling financial managers, cloud engineers, and leadership to effectively track budgets, identify spending anomalies, and make informed financial decisions regarding their cloud resources.

### Intended Users

a. (U) Intended users include financial managers, cloud engineers, and leadership within the Artificial Intelligence Integration Center (AI2C) and other authorized U.S. Army organizations who are responsible for overseeing Azure cloud budgets and resources.

### Identification

(U) The COST application is a Government Off-the-Shelf (GOTS) software solution developed by AI2C. It will be deployed on NIPRNET and is designed for use by U.S. Army Cyber Command personnel.

<!-- Fill in this form's header with your project info and with an 'X' where applicable -->

```{=tex}
\begin{center}
\begin{tabular}{|c|c|}
\hline
\textbf{Software Name} & <Cloud Observability Spend Toolkit (COST)> \\
\hline
\textbf{Version}   & v2.6.0 \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Software Type}  \\
\hline
 & Commercial Off-the-Shelf (COTS)  \\
\hline
X & Government Off-the-Shelf (GOTS)  \\
\hline
X & Free and Open Source Software (FOSS)  \\
\hline
 & Contract-Developed / Modified Off-the-Shelf (MOTS)  \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Architecture}  \\
\hline
 & Installed on Desktop  \\
\hline
X & Application Server with Database  \\
\hline
 & Application Server with Persistent Storage  \\
\hline
\end{tabular}

% NOTE: Please specify as narrowly as possible the organization/group your users are a part in the table below
\begin{tabular}{|c|c|}
\hline
 & \textbf{Users of the Software}  \\
\hline
 & U.S. Army Cyber Command  \\
\hline
X & U.S. Army Cyber Command and other DoD organizations  \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Networks} \\
\hline
 & JWICS  \\
\hline
 & SIPRNET  \\
\hline
X & NIPRNET  \\
\hline
 & STEMSNET  \\
\hline
 & Stand-Alone (Name: )  \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Privacy Act Data} \\
\hline
 & "Business" or "Rolodex" PII  \\
\hline
 & PII  \\
\hline
 & PHI  \\
\hline
\end{tabular}
\end{center}
```

```{=latex}
\newpage
```

## Security Overview

### System Categorization

(U) The system is categorized as LOW Confidentiality, LOW Integrity, and LOW Availability. It does not store or process classified information or PII beyond standard "Business" information (e.g., user email). The data is a reflection of Azure billing information, and its temporary loss or corruption would not result in mission failure.

**Security categorization of the system that is the consumer of this pipeline**:

<!-- Replace the space in between brackents with an 'x' to select your information category. -->
<!-- More information on information categories can be found in NIST FIPS PUB 199: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf -->

**Confidentiality**

- [x] LOW

- [ ] MODERATE

- [ ] HIGH

**Integrity**

- [x] LOW

- [ ] MODERATE

- [ ] HIGH

**Availability**

- [x] LOW

- [ ] MODERATE

- [ ] HIGH

<!-- (highest classification of data processing, regardless of which network it sits on) -->
<!-- Fill in with the appropriate items and / or add any that apply -->

```{=tex}
\begin{center}
\begin{tabular}{|c|c|}
\hline
 & \textbf{Anticipated Domain(s)} (CUI when filled out) \\
\hline
 & Unclass (IL2) (DEV)   \\
\hline
X & NIPRNet (IL5) (TEST, PROD)  \\
\hline
 & SIPRNet (DEV, TEST, PROD)  \\
\hline
 & JWICS (DEV, TEST, PROD)  \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Anticipated Dissemination Controls (SIPR)} (CUI when filled out) \\
\hline
 & NOFORN   \\
\hline
 & FRD  \\
\hline
 & NATO  \\
\hline
 & ORCON  \\
\hline
 & PROPIN  \\
\hline
 & RESEN  \\
\hline
 & REL TO USA, AUS, CAN, GBR  \\
\hline
 & REL TO USA, AUS, CAN, GBR, NZL  \\
\hline
 & Other: (Please specify)  \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Anticipated Dissemination Controls (JWICS)} (CUI when filled out) \\
\hline
 & SI-G   \\
\hline
 & TK  \\
\hline
 & HCS-P  \\
\hline
 & COMINT  \\
\hline
 & MASINT  \\
\hline
 & NATO  \\
\hline
 & REL TO USA, AUS, CAN, GBR \\
\hline
 & REL TO USA, AUS, CAN, GBR, NZL  \\
\hline
 & COMSEC  \\
\hline
 & Other: (Please specify)  \\
\hline
\end{tabular}
\end{center}
```

```{=latex}
\newpage
```

### Architecture Diagram

(U) The COST application follows a modern microservices architecture. The frontend is a containerized React Single-Page Application (SPA) served by Nginx. The backend is a containerized Python FastAPI REST API. A Redis cache provides job queuing and temporary result storage. A background worker service processes long-running data fetch jobs asynchronously. All components are deployed as separate services within a Kubernetes cluster. User authentication is handled via an OIDC redirect flow with Azure Active Directory (Microsoft Entra ID), and cost data is fetched from the Azure Cost Management API via background jobs for improved performance and rate limit management.

![Architecture Diagram](docs/sdd/architecture-diagram.png)

```{=latex}
\newpage
```

## Detailed Software Description

### Software Purpose / Goals

(U) The primary goal of the COST application is to provide clear, actionable insights into Azure cloud spending for Army personnel. It aims to replace manual data gathering and spreadsheet analysis with an automated, interactive, and centralized dashboard. Key objectives include: providing centralized visibility of all authorized subscriptions, enabling trend analysis and cost forecasting, facilitating detailed resource-level cost exploration, and simplifying the creation of cost reports.

### Software Functionality

(U) The COST application provides the following core functions:

1. **Authentication**: Users authenticate via their standard government Azure Active Directory credentials using the OIDC redirect flow.

2. **Subscription Loading**: Upon login, users can select which of their authorized Azure subscriptions they wish to analyze. The application creates background jobs to fetch cost data asynchronously, allowing users immediate access while data loads in the background. Users can choose between "Fast" mode (current day only) or "Standard" mode (current day ±7 days including forecast data).

3. **Dashboard View**: A customizable dashboard with draggable and resizable widgets. Widgets include various charts (line, bar, doughnut), key performance indicators, and aggregated cost summaries.

4. **Comparison View**: A side-by-side view allowing users to compare cost metrics between different subscriptions across various timeframes.

5. **Resource View**: A detailed, drill-down view of all resources within a selected subscription, grouped by Azure Resource Provider, allowing for granular cost analysis.

6. **Data Management**: A dedicated page for managing data loading jobs, viewing data coverage across subscriptions and date ranges, and triggering on-demand data fetches for specific dates. Includes export/import functionality for offline data analysis.

7. **Settings**: A page for users to manage their profile (display name, avatar) and update their list of selected subscriptions for data loading.

8. **Theming**: Multiple user-selectable color themes (Light, Dark, Neon) for improved user experience and accessibility.

### Software Components

| Component | Technology | Function |
| --------- | ---------- | -------- |
| Frontend | React, Material-UI, Recharts	| A Single-Page Application (SPA) that provides the user interface. Renders all views, charts, and tables. |
| Frontend Server	| Nginx (in Docker container)	| A lightweight web server that serves the static, built React application files. |
| Backend API	| Python, FastAPI	| A RESTful API that handles requests from the frontend, manages background jobs, and serves cached results. |
| Backend Server	| Uvicorn (in Docker container)	| An ASGI server that runs the Python FastAPI application. |
| Worker Service	| Python, asyncio	| A background service that processes cost data fetch jobs from the Redis queue, handles Azure API rate limits with retry logic, and stores results. |
| Redis Cache	| Redis (in Docker container)	| Provides job queue management and temporary storage for job results. Jobs are queued by the backend API and processed by workers. |
| Azure SDKs	| azure-mgmt-costmanagement, azure-identity	| Python libraries used by the worker to securely authenticate and query the Azure Cost Management and Forecast APIs. |
| Client Storage	| Browser IndexedDB (Dexie.js)	| Stores cost data locally with per-resource, per-day granularity (v3 schema). Enables offline data access and reduces API calls. |
| Legacy Cache	| Browser localStorage	| Caches user settings, theme choice, and profile data for backward compatibility. |

### User Interface

(U) The application provides a modern Graphical User Interface (GUI) built with Material-UI. The main layout consists of a static header, a collapsible navigation sidebar on the left, a main content area, and a static footer.

(U) Initial user interaction is with the Azure AD login page, which is presented via a browser redirect (OIDC flow). This may require Multi-Factor Authentication (MFA) as enforced by DoD policy. Once authenticated, the user is presented with a one-time subscription selection screen, followed by the main dashboard. All subsequent interaction occurs within the SPA without full page reloads.

![User Interface](docs/sdd/user-interface.png)

### Configuration Management

(U) Application configuration is managed entirely through environment variables, following the Twelve-Factor App methodology.

- **Backend (Python)**: Environment variables are read at runtime by the FastAPI application. These are injected into the container via Kubernetes ConfigMaps.

- **Frontend (React)**: Environment variables are injected at container startup. An entrypoint.sh script reads variables from the Kubernetes ConfigMap and substitutes them into the static JavaScript files before the Nginx server starts. This allows a single Docker image to be deployed to different environments (Dev, Test, Prod) without being rebuilt.

### Development and Testing

(U) Development follows an Agile methodology. The application is composed of two primary codebases: frontend and backend.

- **Frontend Testing**: The React frontend utilizes Jest for unit tests and the React Testing Library for component-level integration tests.

- **Backend Testing**: The Python backend utilizes pytest for unit and integration tests of API endpoints and service logic.

- **CI/CD**: All code is managed in a Git repository and is subject to automated testing and security scans via the cDSO pipeline on every commit.

#### Milestones

(U) Project progress is measured by the completion of versioned feature sets.
- v1.0.0: Initial backend and frontend implementation.

- v1.1.0: Implementation of deployment onto UDS Core Development cluster.

- v2.0.0: Frontend revamp. Initial implementation of dashboard and widget functionality.

- v2.1.0: Addition of Comparison and Resource View pages.

- v2.2.0: Refactoring of data loading to a user-driven, chunked batch process to handle API rate limits.

- v2.4.0: Implementation of advanced theming system and UI/UX polish.

- v2.5.0: Implementation of individual subscription selection and data loading.

- v2.6.0: Implementation of asynchronous job-based architecture with Redis queue, worker pods, and IndexedDB v3 schema for improved performance and scalability. Addition of forecast data support and Data Management page.

#### Failure Conditions & Mitigations

| Failure Condition | Impact | Mitigation |
| ----------------- | ------ | ----------- |
| Azure Cost Management API unavailable or slow	| Users cannot load or refresh data.	| Jobs will be queued and retried automatically. Client-side IndexedDB cache serves existing data until API recovers.
| Azure AD unavailable	| Users cannot log in.	| This is an external dependency; no application-level mitigation is possible.
| Backend API service fails/crashes	| Users cannot create new jobs or query job status.	| Kubernetes will automatically restart the failing pod. Existing jobs continue processing in workers.
| Worker service fails/crashes	| Active jobs fail or stall.	| Kubernetes will automatically restart the failing pod. Failed jobs can be retried by users from Data Management page.
| Redis cache unavailable	| Job queue and result storage unavailable.	| Application will display error. Kubernetes will restart Redis pod. Jobs must be recreated after recovery.
| Frontend service fails/crashes	| Users cannot access the UI.	| Kubernetes will automatically restart the failing pod.
| Azure API rate limiting (429 errors)	| Data loading slows or fails temporarily.	| Worker implements exponential backoff retry logic with 60-second delays on rate limit errors. Week/month jobs use range queries instead of daily splits for better efficiency.


```{=latex}
\newpage
```

## Technical Overview

### Networking Capabilities

(U) The COST application is a web-based client-server application. All network traffic between the end-user's browser, the frontend and backend containers, and the external Azure APIs occurs over encrypted HTTPS (TLS 1.2 or higher). The frontend container and backend container communicate with each other over the internal Kubernetes cluster network.

### Ports / Protocol / Services

| Service/Component | Port(s) | Protocol(s) | Purpose |
| ----------------- | ------- | ----------- | ------- |
| Frontend (Nginx)	| 8080	| TCP	| Internal port the Nginx container listens on.
| Backend (Uvicorn)	| 8000	| TCP	| Internal port the FastAPI container listens on.
| Worker Service	| N/A	| N/A	| Background worker; does not expose ports. Communicates via Redis.
| Redis Cache	| 6379	| TCP	| Internal port for Redis pub/sub and data storage. Only accessible within cluster.
| Kubernetes Ingress	| 443	| TCP	| External port for all user traffic to the application.
| Azure APIs	| 443	| HTTPS	| External calls to Microsoft Entra ID, Cost Management, and Forecast APIs.

### Encryption

(U) Encryption in Transit: All data flows, including user-to-frontend, frontend-to-backend, and backend-to-Azure, are encrypted using Transport Layer Security (TLS) as part of the HTTPS protocol.
(U) Encryption at Rest: The application does not have its own persistent database. Cost data is temporarily stored in Redis (in-memory) during job processing and permanently cached in the user's browser IndexedDB. Configuration secrets are managed by Kubernetes Secrets, which are stored encrypted in etcd. The user's cost data and settings cached in the browser are subject to the security model of the end-user's browser and operating system. Redis does not persist data to disk; all job data expires after 24 hours.

### Authentication

(U) User authentication is handled via the OpenID Connect (OIDC) 1.0 protocol.

1. The frontend React application uses the Microsoft Authentication Library (MSAL) for React.

2. Unauthenticated users are redirected to the standard Microsoft Entra ID (Azure AD) login page.

3. Upon successful authentication, the user is redirected back to the application with an ID token and an access token.

4. The frontend stores the tokens and includes the access token as a Bearer token in the Authorization header of every API request to the backend.

5. The backend API validates the token and creates background jobs that include the user's token. When the worker processes these jobs, it uses the user's token to create an authenticated Azure SDK client, which then makes requests to the Azure APIs on behalf of the logged-in user.

### Operating System

(U) The application is designed and tested to run exclusively on Linux-based container operating systems.

- **Frontend Build Stage**: node:23-alpine

- **Frontend Final Stage**: alpine:3.22 with Nginx

- **Backend Stage**: python:3.12-alpine

- **Worker Stage**: python:3.12-alpine (same image as backend, different entrypoint)

- **Redis Stage**: redis:7-alpine

- **Target Architecture**: linux/amd64

### Role-Based Access Control (RBAC)

(U) The COST application does not implement its own internal roles. Access control is deferred to and enforced by the underlying Azure Role-Based Access Control (RBAC) system. The data a user can view is strictly limited by the permissions of their Azure AD identity. To view cost data for a subscription, a user must have at least the "Reader" role on that subscription in Azure. The application operates with the principle of least privilege by using the user's own token for all API calls.

<!-- START: DO NOT EDIT -->

### Audit Capabilities

This application uses the Continuous Integration (CI) services provided through Community DevSecOps (CDSO), which is an inner-sourced CI solution provided for use within the Department of the Army. The pipelines provided by CDSO are all open and auditable for anybody within the department of the Army. The source code for all components can be found here: <https://code.code.cdso.army.mil/cdso>. The documentation can be found here: <https://cdso.pages.code.cdso.army.mil/>.

### Dependencies

This application's dependencies can be viewed by looking at the pipeline artifacts for the most recent CI iteration under the `syft-grype` job artifacts.

This job produces a `syft.json` artifact which contains the Software Bill of Materials (SBOM) for the application image.

### Assumptions

List any assumptions made during the design of this application. This could include assumptions about the network or operating environment, assumptions about the end-user, etc.

```{=latex}
\newpage
```

## Constraints

List what constraints there are that affect this application in its design, implementation, deployment, etc.

### Scanning Tools & Remediation

This application uses all of the scanning tools as defined in the `application-security-review` Pipeline from CDSO. You can find details about the pipeline and its tools here: <https://cdso.pages.code.cdso.army.mil/components/pipelines/#application-security-reviewyml> .

Its definition can be found here: <https://code.code.cdso.army.mil/cdso/cdso/-/blob/main/pipelines/application-security-review.yml>.

<!-- END: DO NOT EDIT -->

### Security Technical Implementation Guides (STIGs)

(U) The containerized application will be deployed on a Kubernetes cluster that is hardened according to the latest DoD Kubernetes Security Technical Implementation Guide (STIG). The application's base images (Alpine Linux) are STIG'd by the cDSO platform.

```{=latex}
\newpage
```

# Appendix A -- References

1. (U) Azure Cost Management and Billing documentation: https://docs.microsoft.com/en-us/azure/cost-management-billing/

2. (U) Microsoft Authentication Library (MSAL) for React: https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react

3. (U) FastAPI Documentation: https://fastapi.tiangolo.com/

4. (U) Material-UI Documentation: https://mui.com/

```{=latex}
\newpage
```

# Appendix B -- Acronyms

Make sure to add any acronyms used in this CSDD that are pertinent to your organization and application/pipeline.

| Acronym | Definition                                     |
| ------- | ---------------------------------------------- |
| AI2C	| Artificial Intelligence Integration Center
| AO	| Authorizing Official
| API	| Application Programming Interface
| CDSO	| Community DevSecOps
| CI / CD	| Continuous Integration / Continuous Deployment
| COST	| Cloud Observability Spend Toolkit
| GOTS	| Government Off-the-Shelf
| GUI	| Graphical User Interface
| IndexedDB	| Indexed Database API (browser storage)
| ISSM	| Information System Security Manager
| MSAL	| Microsoft Authentication Library
| OIDC	| OpenID Connect
| RBAC	| Role-Based Access Control
| Redis	| Remote Dictionary Server (in-memory cache)
| RMF	| Risk Management Framework
| SDD	| Software Design Document
| SPA	| Single-Page Application
| STIG	| Security Technical Implementation Guide
| TLS	| Transport Layer Security
| UI	| User Interface

```{=latex}
\newpage
```

## SRG (Security Requirements Guide)

(U) The Cloud Computing (CC) Security Requirements Guide (SRG) is the applicable SRG for the system these containers support, as the application is hosted within a DoD-approved cloud environment.