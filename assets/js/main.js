const NOTIFICATION_FOLDER = (() => {
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    return basePath + 'notifications/';
})();

const API_ENDPOINT = './notifications/index.php';
let allFiles = [];

// Các "trang" (screens)
const routes = {
    '/': renderHome,
    '/danh-sach': renderNotificationList,
    '/404': renderNotFound
};

// Hàm render chung
function showScreen(renderFunction) {
    const viewerEl = document.getElementById('viewer-container');
    const pathBarEl = document.getElementById('file-path-bar');
    pathBarEl.style.display = 'none'; // Ẩn thanh path khi không xem file
    viewerEl.innerHTML = '';
    renderFunction(viewerEl);
}

// Trang Home
function renderHome(container) {
    container.innerHTML = `
        <div class="message-box home-screen">
            <h1 style="font-size:2.2rem;color:var(--primary);margin-bottom:16px;">
                Chào mừng đến Hệ thống Thông báo nội bộ
            </h1>
            <p style="font-size:1.1rem;color:#555;max-width:700px;margin:0 auto 30px;">
                Đây là nơi lưu trữ tất cả các thông báo, công văn, quyết định của công ty.
            </p>
            <div style="text-align:center;margin-top:40px;">
                <a href="#/danh-sach" class="big-button">
                    Xem danh sách thông báo →
                </a>
            </div>
        </div>
    `;
}

// Trang danh sách thông báo (code cũ của bạn, chỉ chuyển vào đây)
async function renderNotificationList(container) {
    container.innerHTML = '<div class="loading">Đang tải danh sách thông báo...</div>';

    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error('Không thể lấy danh sách');

        const fileList = await response.json();
        const baseURL = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

        allFiles = fileList.map(file => ({
            filename: file.filename,
            dateStr: file.filename.match(/^(\d{4}[-_]\d{2}[-_]\d{2})/) ? 
                     file.filename.match(/^(\d{4}[-_]\d{2}[-_]\d{2})/)[1].replace(/_/g, '-') : '0000-00-00',
            fullPath: NOTIFICATION_FOLDER + encodeURIComponent(file.filename),
            shareableURL: file.path.startsWith('http') ? file.path : baseURL + file.path
        }));

        allFiles.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
        renderMenuInSidebar(allFiles);

        container.innerHTML = `
            <div class="message-box">
                <h3>Chọn một thông báo từ menu bên trái</h3>
                <p>Hoặc sử dụng ô tìm kiếm để lọc nhanh.</p>
            </div>
        `;

    } catch (err) {
        container.innerHTML = `<div class="message-box" style="color:red;">Lỗi: ${err.message}</div>`;
    }
}

// Render menu vào sidebar (tách riêng để gọi lại)
function renderMenuInSidebar(files) {
    const fileListEl = document.getElementById('file-list');
    fileListEl.innerHTML = '';

    if (files.length === 0) {
        fileListEl.innerHTML = '<li style="padding:30px;text-align:center;color:#888;">Chưa có thông báo nào.</li>';
        return;
    }

    files.forEach(file => {
        const li = document.createElement('li');
        li.className = 'file-item';

        const isPdf = file.filename.toLowerCase().endsWith('.pdf');
        const icon = isPdf ? '📄' : '📝';
        const cleanName = file.filename
            .replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]\s*/, '')
            .replace(/\.(pdf|html?)$/i, '')
            .replace(/[-_]+/g, ' ')
            .trim();

        li.innerHTML = `
            <span class="file-icon">${icon}</span>
            <div class="file-info">
                <div class="file-name">${cleanName || file.filename}</div>
                <div class="file-date">${file.filename.split('_')[0].replace(/_/g, '-')}</div>
            </div>
        `;

        li.onclick = () => {
            document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
            li.classList.add('active');
            loadNotificationDetail(file, isPdf);
            if (window.innerWidth <= 768) toggleMenu();
        };

        fileListEl.appendChild(li);
    });
}

// Load chi tiết thông báo
function loadNotificationDetail(file, isPdf) {
    const viewerEl = document.getElementById('viewer-container');
    const pathBarEl = document.getElementById('file-path-bar');
    const currentPathEl = document.getElementById('current-path');

    currentPathEl.textContent = file.shareableURL;
    pathBarEl.style.display = 'flex';

    viewerEl.innerHTML = '<div class="message-box">Đang tải nội dung...</div>';

    if (isPdf) {
        viewerEl.innerHTML = `<iframe src="${file.fullPath}" title="${file.filename}"></iframe>`;
    } else {
        fetch(file.fullPath)
            .then(r => r.ok ? r.text() : Promise.reject())
            .then(html => viewerEl.innerHTML = `<div class="html-content-wrapper">${html}</div>`)
            .catch(() => viewerEl.innerHTML = '<div class="message-box">Không tải được nội dung.</div>');
    }
}

// Trang 404
function renderNotFound(container) {
    container.innerHTML = `
        <div class="message-box">
            <h3 style="font-size:2rem;color:#e74c3c;">404 - Không tìm thấy trang</h3>
            <p>Trang bạn yêu cầu không tồn tại.</p>
            <br>
            <a href="#/" style="color:var(--primary);text-decoration:underline;">← Quay về trang chủ</a>
        </div>
    `;
}

// Copy link
function copyPath() {
    const url = document.getElementById('current-path').textContent;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.querySelector('#file-path-bar button');
        const oldText = btn.innerHTML;          // lưu lại icon cũ (📋)
        btn.innerHTML = '✓ Đã copy!';            // đổi thành tick + chữ
        btn.style.color = '#27ae60';             // màu xanh lá cho đẹp
        
        setTimeout(() => {
            btn.innerHTML = oldText;             // trả lại icon cũ
            btn.style.color = '';                // bỏ màu xanh
        }, 2000);
    }).catch(() => {
        // nếu lỗi thì vẫn hiện nhẹ nhàng thay vì alert
        const btn = document.querySelector('#file-path-bar button');
        const oldText = btn.innerHTML;
        btn.innerHTML = '✕ Lỗi copy';
        btn.style.color = '#e74c3c';
        setTimeout(() => {
            btn.innerHTML = oldText;
            btn.style.color = '';
        }, 2000);
    });
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('open');
}

function filterFiles() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = allFiles.filter(f => f.filename.toLowerCase().includes(query));
    renderMenuInSidebar(filtered);
}

// Router đơn giản
function router() {
    let path = window.location.hash.slice(1) || '/';
    
    // Hỗ trợ xem trực tiếp file qua hash (tùy chọn)
    if (path.startsWith('/view/')) {
        const filename = decodeURIComponent(path.slice(6));
        const file = allFiles.find(f => f.filename === filename);
        if (file) {
            const isPdf = filename.toLowerCase().endsWith('.pdf');
            loadNotificationDetail(file, isPdf);
            renderMenuInSidebar(allFiles);
            return;
        }
    }

    const route = routes[path] || routes['/404'];
    showScreen(route);
}

// Khởi chạy
window.addEventListener('hashchange', router);
window.addEventListener('load', () => {
    router();
    // Load danh sách file ngay từ đầu để search và xem nhanh
    if (allFiles.length === 0) {
        fetch(NOTIFICATION_FOLDER).then(() => renderNotificationList(document.getElementById('viewer-container')));
    }
});