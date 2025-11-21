const NOTIFICATION_FOLDER = (() => {
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    return basePath + 'notifications/';
})();
const API_ENDPOINT = NOTIFICATION_FOLDER + 'list.json';
let allFiles = [];

const routes = { '/': renderHome, '/danh-sach': renderNotificationList, '/404': renderNotFound };

function showScreen(renderFunction) {
    const viewerEl = document.getElementById('viewer-container');
    const pathBarEl = document.getElementById('file-path-bar');
    pathBarEl.style.display = 'none';
    viewerEl.innerHTML = '';
    renderFunction(viewerEl);
}

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
            shareableURL: file.path && file.path.startsWith('http') ? file.path : baseURL + (file.path || '/notifications/' + encodeURIComponent(file.filename))
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

function getFileType(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const images = ['jpg','jpeg','png','gif','webp','bmp','svg','avif','ico'];
    const videos = ['mp4','webm','ogg','mov','avi','mkv'];
    const audios = ['mp3','wav','ogg','m4a','aac'];
    if (ext === 'pdf') return 'pdf';
    if (ext === 'html' || ext === 'htm') return 'html';
    if (images.includes(ext)) return 'image';
    if (videos.includes(ext)) return 'video';
    if (audios.includes(ext)) return 'audio';
    if (['txt','log','csv','md'].includes(ext)) return 'text';
    return 'other';
}

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

        const type = getFileType(file.filename);
        let icon = '📄';
        if (type === 'image') icon = '🖼️';
        else if (type === 'video') icon = '🎥';
        else if (type === 'audio') icon = '🎵';
        else if (type === 'pdf') icon = '📄';
        else if (type === 'html') icon = '🌐';
        else if (type === 'text') icon = '📝';

        const cleanName = file.filename
            .replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]\s*/, '')
            .replace(/\.[^.]+$/, '')
            .replace(/[-_]+/g, ' ')
            .trim();

        const datePart = file.filename.split('_')[0].replace(/_/g, '-');

        li.innerHTML = `
            <span class="file-icon">${icon}</span>
            <div class="file-info">
                <div class="file-name">${cleanName || file.filename}</div>
                <div class="file-date">${datePart}</div>
            </div>
        `;
        li.onclick = () => {
            document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
            li.classList.add('active');
            loadNotificationDetail(file);
            if (window.innerWidth <= 768) toggleMenu();
        };
        fileListEl.appendChild(li);
    });
}

function loadNotificationDetail(file) {
    const viewerEl = document.getElementById('viewer-container');
    const pathBarEl = document.getElementById('file-path-bar');
    const currentPathEl = document.getElementById('current-path');
    
    currentPathEl.textContent = file.shareableURL;
    pathBarEl.style.display = 'flex';
    viewerEl.innerHTML = '<div class="loading">Đang tải nội dung...</div>';

    // === THÊM DÒNG NÀY ĐỂ CẬP NHẬT PREVIEW KHI CHIA SẺ ===
    updateSocialPreview(file);
    // ==================================================

    const url = file.fullPath;
    const type = getFileType(file.filename);

    if (type === 'pdf') {
        viewerEl.innerHTML = `<iframe src="${url}" class="pdf-viewer"></iframe>`;

    } else if (type === 'image') {
        viewerEl.innerHTML = `
            <div class="image-viewer">
                <img src="${url}" alt="${file.filename}" loading="lazy">
            </div>`;

    } else if (type === 'video') {
        viewerEl.innerHTML = `
            <div class="media-viewer">
                <video controls preload="metadata">
                    <source src="${url}" type="video/${file.filename.split('.').pop()}">
                    Trình duyệt không hỗ trợ video.
                </video>
            </div>`;

    } else if (type === 'audio') {
        viewerEl.innerHTML = `
            <div class="media-viewer">
                <audio controls>
                    <source src="${url}" type="audio/${file.filename.split('.').pop()}">
                    Trình duyệt không hỗ trợ audio.
                </audio>
                <p style="margin-top:12px;">${file.filename}</p>
            </div>`;

    } else if (type === 'html') {
        fetch(url)
            .then(r => r.ok ? r.text() : Promise.reject())
            .then(html => viewerEl.innerHTML = `<div class="html-content-wrapper">${html}</div>`)
            .catch(() => viewerEl.innerHTML = '<div class="message-box">Không tải được nội dung HTML.</div>');

    } else if (type === 'text') {
        fetch(url)
            .then(r => r.text())
            .then(text => viewerEl.innerHTML = `<pre class="text-viewer">${text.escapeHtml()}</pre>`)
            .catch(() => viewerEl.innerHTML = '<div class="message-box">Không tải được file text.</div>');

    } else {
        viewerEl.innerHTML = `
            <div class="message-box">
                <p>Không hỗ trợ xem trực tiếp định dạng này.</p>
                <a href="${url}" download class="big-button" style="margin-top:20px;">
                    📥 Tải xuống ${file.filename}
                </a>
            </div>`;
    }
}

String.prototype.escapeHtml = function() {
    const div = document.createElement('div');
    div.textContent = this;
    return div.innerHTML;
};

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

function copyPath() {
    const url = document.getElementById('current-path').textContent;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.querySelector('#file-path-bar button');
        const old = btn.innerHTML;
        btn.innerHTML = '✓ Đã copy!';
        btn.style.color = '#27ae60';
        setTimeout(() => { btn.innerHTML = old; btn.style.color = ''; }, 2000);
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

function router() {
    let path = window.location.hash.slice(1) || '/';
    if (path.startsWith('/view/')) {
        const filename = decodeURIComponent(path.slice(6));
        const file = allFiles.find(f => f.filename === filename);
        if (file) {
            loadNotificationDetail(file);
            renderMenuInSidebar(allFiles);
            document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
            return;
        }
    }
    const route = routes[path] || routes['/404'];
    showScreen(route);
}

// ==================== HÀM MỚI: CẬP NHẬT PREVIEW KHI CHIA SẺ LINK ====================
function updateSocialPreview(file) {
    const cleanName = file.filename
        .replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]\s*/, '')
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim() || file.filename;

    const rawDate = file.filename.match(/^(\d{4}[-_]\d{2}[-_]\d{2})/)?.[0];
    const datePart = rawDate ? rawDate.replace(/_/g, '-') : '';

    const title = cleanName + (datePart ? ` - Ngày ${datePart}` : '');
    const description = `Thông báo nội bộ${datePart ? ' - ' + datePart : ''}`;
    const url = file.shareableURL || window.location.href;

    let image = '';
    const type = getFileType(file.filename);

    // Ưu tiên dùng chính file nếu là ảnh
    if (type === 'image') {
        image = file.fullPath;
    } else {
        // Fallback về logo công ty (tạo sẵn ảnh này để đẹp nhất)
        image = window.location.origin + '/assets/images/logo-preview.png';
        // Nếu chưa có ảnh logo, bạn có thể dùng ảnh chung:
        image = 'https://thongbaonoibo.onrender.com/assets/images/default-preview.jpg';
    }

    // Cập nhật các thẻ meta
    document.getElementById('og-title')?.setAttribute('content', title);
    document.getElementById('og-description')?.setAttribute('content', description);
    document.getElementById('og-image')?.setAttribute('content', image);
    document.getElementById('og-url')?.setAttribute('content', url);

    document.getElementById('twitter-title')?.setAttribute('content', title);
    document.getElementById('twitter-description')?.setAttribute('content', description);
    document.getElementById('twitter-image')?.setAttribute('content', image);

    // Cập nhật luôn title trang cho đẹp
    document.title = title + ' | Thông báo Nội bộ';
}
// =====================================================================

window.addEventListener('hashchange', router);
window.addEventListener('load', () => {
    router();
    if (allFiles.length === 0) {
        renderNotificationList(document.getElementById('viewer-container'));
    }
});