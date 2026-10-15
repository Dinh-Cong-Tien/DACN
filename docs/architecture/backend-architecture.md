# Backend Architecture

- **Pattern:** Modular Monolith chia theo domain module độc lập.
- **Data Access:** Prisma ORM, PostgreSQL.
- **Security:** JWT Authentication, Role-based Access Control (RBAC), Rate limiting, Helmet.
- **Jobs & Realtime:** BullMQ / Redis cho cron jobs, WebSockets cho thi trực tuyến / phòng luyện nói.
