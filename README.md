# Markdown/HTML Viewer

Web app để xem tập trung các file Markdown và HTML nằm rải rác nhiều nơi trên máy. Backend NestJS theo kiến trúc Hexagonal (Ports & Adapters), frontend Vite + React + AlignUI.

## Kiến trúc

```
md-viewer/
├── backend/          NestJS (Hexagonal Architecture)
│   └── src/features/file-explorer/
│       ├── domain/          entities, ports, domain services
│       ├── application/     use cases
│       ├── infrastructure/  adapters (filesystem, JSON config)
│       └── presentation/    HTTP controllers, DTOs
├── frontend/         Vite + React + TailwindCSS v4 + AlignUI
│   └── src/
│       ├── components/      layout + AlignUI base components
│       ├── features/        sources, sidebar-tree, viewer
│       └── stores/          Zustand stores
├── ecosystem.config.js      pm2 process config
└── package.json             root coordinating scripts
```

**API surface** (backend, port `19121`):
- `GET /health` — health check
- `GET /sources` / `POST /sources` — quản lý danh sách folder gốc (source)
- `GET /sources/:id/tree` — lấy cây file/folder (.md/.html) của 1 source
- `GET /files/content?path=...` — đọc nội dung file (`{content, type}`)
- `POST /nodes/sync` — re-scan lại 1 node (root hoặc subfolder)

## Development

Yêu cầu: Node.js 20+, npm.

```bash
# Cài dependencies cho cả backend + frontend
npm run install:all

# Chạy backend (port 19121, hot-reload)
cd backend && npm run start:dev

# Chạy frontend dev server (port 19120, riêng, có CORS tới backend)
cd frontend && npm run dev
```

Trong dev mode, frontend (`:19120`) gọi API tới backend (`:19121`) qua CORS. Chạy test:

```bash
cd backend && npm run test        # unit tests
cd backend && npm run test:e2e    # e2e tests
cd frontend && npm run test       # unit + component tests
```

## Production build & deploy (pm2)

Ở production, backend serve luôn frontend build tĩnh — chỉ 1 process, 1 port (`19121`).

### 1. Build

```bash
npm run build
```

Lệnh này build frontend (`frontend/dist`) trước, sau đó build backend (`backend/dist`). Backend dùng `@nestjs/serve-static` để serve `frontend/dist` cùng port với API.

### 2. Chạy bằng pm2

```bash
# Cài pm2 (đã có trong devDependencies ở root, hoặc cài global: npm install -g pm2)
npm install

# Start
npm run start          # tương đương: pm2 start ecosystem.config.js

# Xem trạng thái
npm run status          # pm2 status

# Xem logs
npm run logs             # pm2 logs md-viewer

# Restart (sau khi build lại code mới)
npm run restart

# Stop
npm run stop
```

Sau khi start, mở `http://localhost:19121` — toàn bộ app (frontend + backend) chạy trong 1 process pm2 quản lý.

### 3. Tự động khởi động lại khi reboot máy (tuỳ chọn)

```bash
npx pm2 save
npx pm2 startup    # làm theo hướng dẫn hiển thị ra (cần chạy lệnh sudo được in ra)
```

### Cấu hình pm2 (`ecosystem.config.js`)

- `autorestart: true` — tự khởi động lại khi crash
- `max_restarts: 10`, `restart_delay: 2000` — giới hạn số lần restart liên tiếp, tránh restart loop
- Logs ghi vào `logs/out.log` và `logs/error.log` ở thư mục gốc repo

### Lưu ý khi update code

Sau khi sửa code và muốn deploy lại:

```bash
npm run build
npm run restart
```

## Cách dùng app

1. Mở app, bấm nút **+** ở sidebar để "Add folder" — nhập đường dẫn tuyệt đối tới thư mục chứa file `.md`/`.html`.
2. Sidebar hiển thị cây thư mục thật (chỉ hiện file `.md`/`.html` và folder chứa chúng).
3. Bấm vào file để xem nội dung — Markdown render với GFM (bảng, checkbox, strikethrough), syntax highlighting, Mermaid diagram. File `.html` hiện trong khung iframe sandbox riêng.
4. Bấm icon Sync cạnh mỗi folder để re-scan lại khi có file mới/thay đổi trên đĩa.
5. Toggle dark/light mode ở góc phải header.

Danh sách folder đã add được lưu tại `backend/data/sources.config.json` — không tạo symlink, chỉ lưu đường dẫn và quét trực tiếp mỗi lần load.
